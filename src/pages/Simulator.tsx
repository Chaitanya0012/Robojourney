import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Download, Cpu, Zap, Radio, Shield, Bug, Brain } from "lucide-react";

import Navigation from "@/components/Navigation";
import { SimulatorCanvas } from "@/components/simulator/SimulatorCanvas";
import { CodeEditor } from "@/components/simulator/CodeEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSimulator } from "@/hooks/useSimulator";
import { useAuth } from "@/contexts/AuthContext";
import { CodeEditor } from "@/components/simulator/CodeEditor";

const defaultCode = `// Arduino-style robot code
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(2, OUTPUT); // Motor A
  pinMode(3, OUTPUT); // Motor B
  Serial.begin(9600);
}

void loop() {
  setMotor(0.5, 0.5);
  sleep(500);
  digitalWrite(LED_BUILTIN, HIGH);
  sleep(300);
  digitalWrite(LED_BUILTIN, LOW);
  sleep(300);
}
`;

type CompileStatus = {
  state: "idle" | "ok" | "error";
  message: string;
};

type BoardKey = "arduino-uno" | "arduino-nano" | "esp32";

const boardPresets: Record<BoardKey, { name: string; label: string; lanes: number; color: string }> = {
  "arduino-uno": {
    name: "Arduino Uno",
    label: "UNO R3",
    lanes: 12,
    color: "from-sky-500/40 to-indigo-700/50",
  },
  "arduino-nano": {
    name: "Arduino Nano",
    label: "NANO",
    lanes: 10,
    color: "from-emerald-500/40 to-cyan-700/50",
  },
  esp32: {
    name: "ESP32 DevKit",
    label: "ESP32",
    lanes: 14,
    color: "from-purple-500/40 to-pink-700/50",
  },
};

const analogPinLabels = ["A0", "A1", "A2", "A3", "A4", "A5"];
const powerAndAnalogPins = ["5V", "3V3", "GND", "VIN", ...analogPinLabels];

const extractUsedPins = (source: string) => {
  const digitalPins = new Set<number>();
  const analogPins = new Set<string>();

  const pinCallPattern = /(pinMode|digitalWrite|analogWrite|digitalRead|analogRead)\s*\(\s*([A-Za-z0-9_]+)/g;
  const analogLabelPattern = /A\d+/g;

  for (const match of source.matchAll(pinCallPattern)) {
    const pinToken = match[2];
    if (!pinToken) continue;

    if (pinToken.toUpperCase() === "LED_BUILTIN") {
      digitalPins.add(13);
      continue;
    }

    if (pinToken.toUpperCase().startsWith("A")) {
      analogPins.add(pinToken.toUpperCase());
      continue;
    }

    const parsed = parseInt(pinToken, 10);
    if (!Number.isNaN(parsed)) {
      digitalPins.add(parsed);
    }
  }

  for (const match of source.matchAll(analogLabelPattern)) {
    analogPins.add(match[0].toUpperCase());
  }

  return { digitalPins: Array.from(digitalPins).sort((a, b) => a - b), analogPins: Array.from(analogPins) };
};

const extractSerialMessages = (source: string) => {
  const logPattern = /console\.log\(([^;]+)\)/g;
  const matches = Array.from(source.matchAll(logPattern));
  if (matches.length === 0) {
    return [
      "Boot: initializing virtual board...",
      "Running setup()",
      "Loop started — motors responding",
      "LED status channel live",
    ];
  }

  return matches.map((match) => `serial> ${match[1].replace(/[`'\"]+/g, "").trim()}`);
};

const analyzeCode = (source: string) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const signals: string[] = [];

  if (!/void\s+setup\s*\(/i.test(source)) {
    errors.push("Missing setup() function to configure pins.");
  }

  if (!/void\s+loop\s*\(/i.test(source)) {
    errors.push("Missing loop() function to run repeatedly.");
  }

  if (/delay\s*\(/i.test(source)) {
    warnings.push("Consider using sleep() instead of delay() to avoid blocking telemetry.");
  }

  if (/analogWrite\s*\(/i.test(source)) {
    signals.push("PWM");
  }

  const ledUsage = /led_builtin/i.test(source);
  const script = extractSerialMessages(source);

  return { errors, warnings, signals, ledUsage, script };
};

const Simulator = () => {
  const { user } = useAuth();
  const { isRunning, telemetry, startSimulation, stopSimulation, resetSimulation, executeCode } = useSimulator();
  const telemetryRef = useRef(telemetry);
  const [code, setCode] = useState(defaultCode);
  const [board, setBoard] = useState<BoardKey>("arduino-uno");
  const [serialOutput, setSerialOutput] = useState<string[]>(["💡 Tip: Type code, then hit Run to validate and stream live output."]);
  const [compileStatus, setCompileStatus] = useState<CompileStatus>({ state: "idle", message: "Awaiting run" });
  const [tutorGuidance, setTutorGuidance] = useState<string>("");
  const [isTutorAnalyzing, setIsTutorAnalyzing] = useState(false);

  const currentBoard = boardPresets[board];
  const { digitalPins: digitalUsedPins, analogPins: analogUsedPins } = useMemo(() => extractUsedPins(code), [code]);
  const diagnostics = useMemo(() => analyzeCode(code), [code]);
  const compiledMessages = useMemo(() => diagnostics.script, [diagnostics.script]);

  const validateCode = () => {
    const errors: string[] = [];

    if (!/void\s+setup\s*\(/i.test(code)) {
      errors.push("Missing setup() function to configure pins.");
    }

    if (!/void\s+loop\s*\(/i.test(code)) {
      errors.push("Missing loop() function to run repeatedly.");
    }

    const maxDigitalPin = currentBoard.lanes + 1;
    digitalUsedPins.forEach((pin) => {
      if (pin !== 13 && (pin < 2 || pin > maxDigitalPin)) {
        errors.push(`Pin D${pin} is outside the available pins for ${currentBoard.name}.`);
      }
    });

    analogUsedPins.forEach((pin) => {
      if (!analogPinLabels.includes(pin)) {
        errors.push(`Analog pin ${pin} is not available on this board.`);
      }
    });

    return errors;
  };

  const requestTutorGuidance = async (errors: string[]) => {
    setIsTutorAnalyzing(true);
    setTutorGuidance("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          prompt: `You are helping a student debug a microcontroller sketch in a virtual simulator. Please DO NOT give the final code or numeric answers. Ask guiding questions and suggest checkpoints so the student can fix issues themselves.\n\nBoard: ${currentBoard.name}\nDetected problems:\n${errors.map((err) => `- ${err}`).join("\n")}\n\nHere is the current code:\n${code}\n\nRespond with 3-5 short prompts that lead the student to the fix, and end with one reflection question.`,
          userId: user?.id,
          action: "chat",
        },
      });

      if (error) throw error;
      setTutorGuidance(data.response || "The tutor could not generate guidance right now.");
    } catch (error: any) {
      console.error("Tutor debug error", error);
      toast.error(error.message || "Failed to get AI tutor guidance");
    } finally {
      setIsTutorAnalyzing(false);
    }
  };

  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  useEffect(() => {
    if (!isRunning) return;

    let step = 0;
    const interval = setInterval(() => {
      const nextMessage = compiledMessages[step % compiledMessages.length];
      setSerialOutput((prev) => [...prev.slice(-24), nextMessage]);
      step += 1;
    }, 900);

    return () => clearInterval(interval);
  }, [compiledMessages, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const snap = telemetryRef.current;
      setSerialOutput((prev) => [
        ...prev.slice(-24),
        `T${new Date().toLocaleTimeString()} :: L:${(snap.leftMotor * 100).toFixed(0)}% R:${(snap.rightMotor * 100).toFixed(0)}% | ultrasonic ${snap.sensors.ultrasonic}m`,
      ]);
    }, 700);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleRun = async () => {
    const validationErrors = validateCode();

    if (validationErrors.length > 0) {
      setCompileStatus({ state: "error", message: "Fix validation issues" });
      setSerialOutput((prevOutput) => [
        ...prevOutput,
        "⛔ Simulation blocked: fix the issues below",
        ...validationErrors.map((err) => `- ${err}`),
      ]);
      await requestTutorGuidance(validationErrors);
      return;
    }

    if (isRunning) {
      stopSimulation();
      setCompileStatus({ state: "idle", message: "Simulation paused" });
      return;
    }

    setTutorGuidance("");
    setCompileStatus({ state: "ok", message: "Compilation passed" });
    startSimulation();
    executeCode(code);
    setSerialOutput((prevOutput) => [...prevOutput, "▶ Simulation started"]);
  };

  const handleReset = () => {
    resetSimulation();
    setSerialOutput([]);
    setTutorGuidance("");
    setCompileStatus({ state: "idle", message: "Awaiting run" });
  };

  const simulationState: "running" | "paused" | "error" | "idle" =
    compileStatus.state === "error" ? "error" : isRunning ? "running" : "idle";

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5 text-primary" />
              <h1 className="text-4xl font-bold">Robot Simulator</h1>
            </div>
            <p className="text-muted-foreground">
              Live-coded sandbox: validate your sketch, stream telemetry, and see the 3D board react in real time.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="bg-green-500/10 text-green-300">
                Worker-isolated execution
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-300">
                LED & motor feedback
              </Badge>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-300">
                Syntax guardrails
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="w-[220px] rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
              value={board}
              onChange={(e) => setBoard(e.target.value as BoardKey)}
            >
              <option value="arduino-uno">Arduino Uno</option>
              <option value="arduino-nano">Arduino Nano</option>
              <option value="esp32">ESP32 DevKit</option>
            </select>
            <Button variant="secondary" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export Sketch
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <Card className="glass-card space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Code Editor</h2>
                <p className="text-xs text-muted-foreground">JavaScript-style sketch compiled inside a secure worker.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleRun} className={isRunning ? "bg-orange-500" : "bg-green-500"}>
                  {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  {isRunning ? "Pause" : "Run"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="border border-border/50 rounded-lg overflow-hidden h-[520px]">
              <CodeEditor value={code} onChange={setCode} language="javascript" />
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-background/60 p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                {compileStatus.state === "ok" && <Shield className="h-4 w-4 text-green-400" />}
                {compileStatus.state === "error" && <Bug className="h-4 w-4 text-destructive" />}
                {compileStatus.state === "idle" && <Radio className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm font-medium">{compileStatus.message}</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Button variant="outline" size="sm" onClick={async () => {
                  const validationErrors = validateCode();
                  if (validationErrors.length === 0) {
                    setCompileStatus({ state: "ok", message: "Validation passed" });
                    toast.success("Validation passed");
                  } else {
                    setCompileStatus({ state: "error", message: `${validationErrors.length} issue(s) found` });
                    validationErrors.forEach((err) => toast.error(err));
                  }
                }}>
                  Run validation only
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="glass-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Virtual Board</h2>
                  <p className="text-xs text-muted-foreground">{currentBoard.name} · live LED feedback</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Radio className={`h-3 w-3 ${isRunning ? "text-green-400" : "text-muted-foreground"}`} />
                  {simulationState === "error" ? "Error" : isRunning ? "Live" : "Idle"}
                </div>
              </div>
              <div className={`relative min-h-[320px] overflow-hidden rounded-xl border bg-gradient-to-br ${currentBoard.color}`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 space-y-4 p-4">
                  <div className="flex items-center justify-between text-xs font-mono text-white">
                    <span>{currentBoard.label}</span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" /> 5V rail
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-white/10 bg-black/30 p-4 shadow-inner">
                      <div className="mb-2 text-xs text-white/80">Digital Pins</div>
                      <div className="grid grid-cols-5 gap-2 text-[10px] text-white/90">
                        {[...Array(currentBoard.lanes).keys()].map((lane) => (
                          <div
                            key={lane}
                            className={`rounded border px-2 py-1 text-center transition-colors duration-200 ${
                              digitalUsedPins.includes(lane + 2)
                                ? "bg-emerald-300 text-black border-white/60"
                                : "bg-white/10 border-white/5"
                            }`}
                          >
                            D{lane + 2}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-4 shadow-inner">
                      <div className="mb-2 text-xs text-white/80">Power & Analog</div>
                      <div className="flex flex-wrap gap-2 text-[10px] text-white/90">
                        {powerAndAnalogPins.map((label) => (
                          <div
                            key={label}
                            className={`rounded border px-2 py-1 ${
                              analogUsedPins.includes(label)
                                ? "bg-emerald-300 text-black border-white/60"
                                : "bg-white/10 border-white/5"
                            }`}
                          >
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/80">Highlighted pins are in use in your sketch.</p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full border-4 border-white/40 shadow-lg transition-all duration-300 ${
                        diagnostics.ledUsage ? "bg-yellow-300 shadow-glow-cyan" : "bg-white/20"
                      }`}
                    />
                    <div className="text-sm text-white">
                      <div className="font-semibold">Built-in LED</div>
                      <p className="text-xs text-white/80">
                        {diagnostics.ledUsage
                          ? "Toggles when code hits digitalWrite(LED_BUILTIN, ...)"
                          : "Add LED_BUILTIN writes to visualize activity"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-4">
              <h2 className="mb-3 text-lg font-semibold">3D Scene</h2>
              <SimulatorCanvas telemetry={telemetry} />
            </Card>

            <Card className="glass-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Compilation &amp; Health</h2>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    simulationState === "running"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : simulationState === "error"
                        ? "bg-red-500/15 text-red-400"
                        : simulationState === "paused"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-slate-500/15 text-slate-300"
                  }`}
                >
                  {simulationState === "running"
                    ? "Running"
                    : simulationState === "error"
                      ? "Build errors"
                      : simulationState === "paused"
                        ? "Paused"
                        : "Idle"}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {diagnostics.errors.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                    Sketch passes quick validation
                  </div>
                ) : (
                  diagnostics.errors.map((err, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-red-300">
                      <Bug className="mt-0.5 h-4 w-4" />
                      <span>{err}</span>
                    </div>
                  ))
                )}

                {diagnostics.warnings.map((warn, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-amber-300">
                    <Radio className="mt-0.5 h-4 w-4" />
                    <span>{warn}</span>
                  </div>
                ))}

                {diagnostics.signals.length > 0 && (
                  <div className="pt-2 text-xs text-muted-foreground">
                    Signals detected: {diagnostics.signals.join(", ")}
                  </div>
                )}
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="mb-2 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">AI Tutor Debugger</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                When the simulator spots an issue, the AI tutor will ask guiding questions instead of giving the answer.
              </p>
              {isTutorAnalyzing ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                  <span>AI tutor is reviewing your code...</span>
                </div>
              ) : tutorGuidance ? (
                <div className="whitespace-pre-wrap rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
                  {tutorGuidance}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Run the simulator to see guided debugging tips here.</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
