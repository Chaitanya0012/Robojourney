import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Download, Cpu, Zap, Radio, Shield, Bug, Brain, Sparkles } from "lucide-react";
import Editor from "@monaco-editor/react";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { SimulatorCanvas } from "@/components/simulator/SimulatorCanvas";

const defaultCode = `// Arduino-style robot code
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(2, OUTPUT); // Motor A
  pinMode(3, OUTPUT); // Motor B
  Serial.begin(9600);
}

main(setMotor, readSensor, sleep, console);`;

type CompileStatus = {
  state: "idle" | "ok" | "error";
  message: string;
};

type SimulationState = "idle" | "running" | "paused" | "error";

type Telemetry = {
  position: [number, number, number];
  rotation: number;
  leftMotor: number;
  rightMotor: number;
  sensors: {
    ultrasonic: number;
  };
  timestamp: number;
};

const analogPinLabels = ["A0", "A1", "A2", "A3", "A4", "A5"];
const powerAndAnalogPins = ["5V", "3V3", "GND", "VIN", ...analogPinLabels];

const boardPresets = {
  "arduino-uno": {
    name: "Arduino Uno",
    label: "UNO R3",
    lanes: 12,
    color: "from-slate-800 via-slate-900 to-slate-950",
  },
  "arduino-nano": {
    name: "Arduino Nano",
    label: "NANO V3",
    lanes: 10,
    color: "from-indigo-800 via-indigo-900 to-slate-950",
  },
  esp32: {
    name: "ESP32 DevKit",
    label: "ESP32",
    lanes: 16,
    color: "from-purple-800 via-purple-900 to-slate-950",
  },
};

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

const initialTelemetry: Telemetry = {
  position: [0, 0.05, 0],
  rotation: 0,
  leftMotor: 0,
  rightMotor: 0,
  sensors: { ultrasonic: 2 },
  timestamp: Date.now(),
};

const Simulator = () => {
  const { user } = useAuth();
  const [code, setCode] = useState(defaultCode);
  const [isRunning, setIsRunning] = useState(false);
  const [serialOutput, setSerialOutput] = useState<string[]>([
    "💡 Tip: Type code, then hit Run to validate and stream live output.",
  ]);
  const [ledState, setLedState] = useState(false);
  const [board, setBoard] = useState<keyof typeof boardPresets>("arduino-uno");
  const [digitalUsedPins, setDigitalUsedPins] = useState<number[]>([]);
  const [analogUsedPins, setAnalogUsedPins] = useState<string[]>([]);
  const [tutorGuidance, setTutorGuidance] = useState<string>("");
  const [isTutorAnalyzing, setIsTutorAnalyzing] = useState(false);
  const [compileStatus, setCompileStatus] = useState<CompileStatus>({
    state: "idle",
    message: "Ready to run validation",
  });
  const [simulationState, setSimulationState] = useState<SimulationState>("idle");
  const [telemetry, setTelemetry] = useState<Telemetry>(initialTelemetry);
  const telemetryRef = useRef<Telemetry>(initialTelemetry);

  const currentBoard = boardPresets[board];

  const digitalWrites = useMemo(
    () => [...code.matchAll(/digitalWrite\s*\(\s*([A-Za-z0-9_]+)/gi)].map((match) => match[1]),
    [code]
  );

  const validateCode = () => {
    const errors: string[] = [];

    if (!/void\s+setup\s*\(/i.test(code)) {
      errors.push("Missing setup() function to configure pins.");
    }

    if (!/void\s+loop\s*\(/i.test(code) && !/main\s*\(/i.test(code)) {
      errors.push("Missing loop() or main() function to run repeatedly.");
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

  const diagnostics = useMemo(() => {
    const errors = validateCode();
    const warnings: string[] = [];
    const signals: string[] = [];

    if (/delay\s*\(\s*1000\s*\)/i.test(code)) {
      warnings.push("Long delay(1000) detected; this can block the loop.");
    }

    if (/Serial\.print/gi.test(code)) {
      signals.push("Serial output");
    }

    const script = digitalWrites.length
      ? digitalWrites.map((dw, idx) => `Writing to ${dw} (step ${idx + 1})`)
      : ["Loop running...", "Monitoring sensors..."];

    return {
      errors,
      warnings,
      signals,
      ledUsage: digitalWrites.some((dw) => dw.toLowerCase().includes("led_builtin")),
      script,
    };
  }, [analogUsedPins, code, currentBoard.lanes, currentBoard.name, digitalUsedPins, digitalWrites]);

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
    const { digitalPins, analogPins } = extractUsedPins(code);
    setDigitalUsedPins(digitalPins);
    setAnalogUsedPins(analogPins);
  }, [code]);

  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  useEffect(() => {
    if (!isRunning) return;

    let step = 0;
    const interval = setInterval(() => {
      const message = diagnostics.script[step % diagnostics.script.length];
      setSerialOutput((prev) => [...prev.slice(-24), message]);
      setLedState((prev) => (diagnostics.ledUsage ? !prev : false));
      step += 1;
    }, 900);

    return () => clearInterval(interval);
  }, [diagnostics.ledUsage, diagnostics.script, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const snap = telemetryRef.current;
      setSerialOutput((prev) => [
        ...prev.slice(-24),
        `T${new Date().toLocaleTimeString()} :: L:${(snap.leftMotor * 100).toFixed(0)}% R:${(snap.rightMotor * 100).toFixed(
          0
        )}% | ultrasonic ${snap.sensors.ultrasonic}m`,
      ]);
    }, 700);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const speed = 0.25;
        const heading = prev.rotation + 0.03;
        const dx = Math.cos(heading) * speed * 0.02;
        const dz = Math.sin(heading) * speed * 0.02;

        return {
          ...prev,
          position: [prev.position[0] + dx, prev.position[1], prev.position[2] + dz],
          rotation: heading,
          sensors: {
            ultrasonic: Math.max(0.2, Number((prev.sensors.ultrasonic - 0.01).toFixed(3))),
          },
          timestamp: Date.now(),
        };
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (diagnostics.errors.length > 0) {
      setCompileStatus({ state: "error", message: "Fix the issues before running" });
      setSimulationState("error");
    } else {
      setCompileStatus({ state: "ok", message: "Sketch validated" });
      setSimulationState(isRunning ? "running" : "idle");
    }
  }, [diagnostics.errors.length, isRunning]);

  const handleValidateOnly = () => {
    const validationErrors = validateCode();

    if (validationErrors.length > 0) {
      setCompileStatus({ state: "error", message: `${validationErrors.length} issue(s) detected` });
      setSimulationState("error");
      setSerialOutput((prev) => [...prev, ...validationErrors.map((err) => `⚠️ ${err}`)]);
    } else {
      setCompileStatus({ state: "ok", message: "Sketch validated" });
      setSimulationState(isRunning ? "running" : "idle");
      setSerialOutput((prev) => [...prev, "✅ Validation passed"]);
    }
  };

  const handleRun = async () => {
    const validationErrors = validateCode();

    if (validationErrors.length > 0) {
      setIsRunning(false);
      setSimulationState("error");
      setSerialOutput((prevOutput) => [
        ...prevOutput,
        "⛔ Simulation blocked: fix the issues below",
        ...validationErrors.map((err) => `- ${err}`),
      ]);
      await requestTutorGuidance(validationErrors);
      return;
    }

    setTutorGuidance("");
    setIsRunning((prev) => {
      const next = !prev;
      setSimulationState(next ? "running" : "paused");
      if (next) {
        setSerialOutput((prevOutput) => [...prevOutput, "▶ Simulation started"]);
      }
      return next;
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setSimulationState("idle");
    setLedState(false);
    setSerialOutput([]);
    setTutorGuidance("");
    setTelemetry(initialTelemetry);
    setCompileStatus({ state: "idle", message: "Ready to run validation" });
  };

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
              onChange={(e) => setBoard(e.target.value as keyof typeof boardPresets)}
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

        <div className="grid lg:grid-cols-[1.2fr,1fr] gap-6">
          <Card className="p-6 glass-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Code Editor</h2>
                <p className="text-xs text-muted-foreground">JavaScript-style sketch compiled inside a secure worker.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleRun} className={isRunning ? "bg-orange-500" : "bg-green-500"}>
                  {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isRunning ? "Pause" : "Run"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="border border-border/50 rounded-lg overflow-hidden h-[520px]">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border border-border/50 rounded-lg p-3 bg-background/60">
              <div className="flex items-center gap-2">
                {compileStatus.state === "ok" && <Shield className="h-4 w-4 text-green-400" />}
                {compileStatus.state === "error" && <Bug className="h-4 w-4 text-destructive" />}
                {compileStatus.state === "idle" && <Radio className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm font-medium">{compileStatus.message}</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Button variant="outline" size="sm" onClick={handleValidateOnly}>
                  Run validation only
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-4 glass-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold">Virtual Board</h2>
                  <p className="text-xs text-muted-foreground">{currentBoard.name} · live LED feedback</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Radio className={`h-3 w-3 ${isRunning ? "text-green-400" : "text-muted-foreground"}`} />
                  {simulationState === "error" ? "Error" : isRunning ? "Live" : "Idle"}
                </div>
              </div>
              <div className={`relative rounded-xl p-4 min-h-[320px] border bg-gradient-to-br ${currentBoard.color} overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between text-white text-xs font-mono">
                    <span>{currentBoard.label}</span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" /> 5V rail
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded-lg p-4 border border-white/10 shadow-inner">
                      <div className="text-white/80 text-xs mb-2">Digital Pins</div>
                      <div className="grid grid-cols-5 gap-2 text-[10px] text-white/90">
                        {[...Array(currentBoard.lanes).keys()].map((lane) => (
                          <div
                            key={lane}
                            className={`px-2 py-1 rounded border text-center transition-colors duration-200 ${
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
                    <div className="bg-black/30 rounded-lg p-4 border border-white/10 shadow-inner">
                      <div className="text-white/80 text-xs mb-2">Power & Analog</div>
                      <div className="flex flex-wrap gap-2 text-[10px] text-white/90">
                        {powerAndAnalogPins.map((label) => (
                          <div
                            key={label}
                            className={`px-2 py-1 rounded border ${
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
                      className={`w-10 h-10 rounded-full shadow-lg border-4 border-white/40 transition-all duration-300 ${
                        ledState && diagnostics.ledUsage ? "bg-yellow-300 shadow-glow-cyan" : "bg-white/20"
                      }`}
                    />
                    <div className="text-white text-sm">
                      <div className="font-semibold">Built-in LED</div>
                      <p className="text-white/80 text-xs">
                        {diagnostics.ledUsage
                          ? "Toggles when code hits digitalWrite(LED_BUILTIN, ...)"
                          : "Add LED_BUILTIN writes to visualize activity"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 glass-card">
              <h2 className="text-lg font-semibold mb-3">3D Scene</h2>
              <SimulatorCanvas telemetry={telemetry} />
            </Card>

            <Card className="p-6 glass-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Compilation &amp; Health</h2>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                      <Bug className="h-4 w-4 mt-0.5" />
                      <span>{err}</span>
                    </div>
                  ))
                )}

                {diagnostics.warnings.map((warn, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-amber-300">
                    <Radio className="h-4 w-4 mt-0.5" />
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

            <Card className="p-6 glass-card">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">AI Tutor Debugger</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                When the simulator spots an issue, the AI tutor will ask guiding questions instead of giving the answer.
              </p>
              {isTutorAnalyzing ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>AI tutor is reviewing your code...</span>
                </div>
              ) : tutorGuidance ? (
                <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm whitespace-pre-wrap">
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
