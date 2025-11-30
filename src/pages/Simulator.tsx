import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Download, Cpu, Zap, Radio, Shield, Bug, Brain, Sparkles } from "lucide-react";

import Navigation from "@/components/Navigation";
import { SimulatorCanvas } from "@/components/simulator/SimulatorCanvas";
import { CodeEditor } from "@/components/simulator/CodeEditor";
import { TelemetryPanel } from "@/components/simulator/TelemetryPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSimulator } from "@/hooks/useSimulator";

const defaultCode = `// Arduino-style robot code\nvoid setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n  pinMode(2, OUTPUT); // Motor A\n  pinMode(3, OUTPUT); // Motor B\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  setMotor(0.5, 0.5);\n  await sleep(500);\n  digitalWrite(LED_BUILTIN, HIGH);\n  Serial.println("Moving forward");\n}`;

type CompileStatus = {
  state: "idle" | "ok" | "error" | "paused";
  message: string;
};

type Diagnostics = {
  errors: string[];
  warnings: string[];
  signals: string[];
  ledUsage: boolean;
  script: string[];
};

const boardPresets = {
  "arduino-uno": { name: "Arduino Uno", label: "ATmega328P", lanes: 12, color: "from-emerald-500/30 to-cyan-500/30" },
  "arduino-nano": { name: "Arduino Nano", label: "ATmega4809", lanes: 10, color: "from-blue-500/30 to-indigo-500/30" },
  esp32: { name: "ESP32 DevKit", label: "Xtensa LX6", lanes: 18, color: "from-amber-500/30 to-orange-500/30" },
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
  const messages = Array.from(source.matchAll(/Serial\.print(?:ln)?\(([^)]+)\)/g)).map((match) => match[1]?.trim() ?? "");
  if (messages.length === 0) {
    return ["Serial is quiet – add Serial.println() to stream data."];
  }
  return messages.slice(0, 5);
};

const Simulator = () => {
  const { isRunning, telemetry, startSimulation, stopSimulation, resetSimulation, executeCode } = useSimulator();
  const telemetryRef = useRef(telemetry);

  const [code, setCode] = useState(defaultCode);
  const [board, setBoard] = useState<keyof typeof boardPresets>("arduino-uno");
  const [compileStatus, setCompileStatus] = useState<CompileStatus>({ state: "idle", message: "Ready to simulate" });
  const [serialOutput, setSerialOutput] = useState<string[]>([
    "💡 Tip: Type code, then hit Run to validate and stream live output.",
  ]);
  const [digitalUsedPins, setDigitalUsedPins] = useState<number[]>([]);
  const [analogUsedPins, setAnalogUsedPins] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostics>({
    errors: [],
    warnings: [],
    signals: [],
    ledUsage: false,
    script: ["Awaiting first run"]
  });

  const currentBoard = useMemo(() => boardPresets[board], [board]);

  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  useEffect(() => {
    const { digitalPins, analogPins } = extractUsedPins(code);
    setDigitalUsedPins(digitalPins);
    setAnalogUsedPins(analogPins);
  }, [code]);

  const validateCode = useCallback(() => {
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
  }, [analogUsedPins, currentBoard, digitalUsedPins, code]);

  const computeDiagnostics = useCallback((): Diagnostics => {
    const validationErrors = validateCode();
    const serialMessages = extractSerialMessages(code);
    const digitalWrites = Array.from(code.matchAll(/digitalWrite\s*\(([^,]+)/gi)).map((match) => match[1]?.trim() ?? "");

    const warnings: string[] = [];
    if (!/Serial\.begin/i.test(code)) warnings.push("Serial.begin(...) not found – serial monitor will stay quiet.");
    if (!/setMotor/i.test(code)) warnings.push("setMotor(left, right) is never called – robot will stay idle.");

    const signals = Array.from(new Set(serialMessages.map((msg) => msg.replace(/"/g, ""))));

    return {
      errors: validationErrors,
      warnings,
      signals,
      ledUsage: digitalWrites.some((dw) => dw.toLowerCase().includes("led_builtin")),
      script: serialMessages,
    };
  }, [code, validateCode]);

  const handleRun = useCallback(() => {
    const nextDiagnostics = computeDiagnostics();
    setDiagnostics(nextDiagnostics);

    if (nextDiagnostics.errors.length > 0) {
      setCompileStatus({ state: "error", message: "Fix the validation issues before running." });
      setSerialOutput((prev) => [
        ...prev,
        "⛔ Simulation blocked: fix the issues below",
        ...nextDiagnostics.errors.map((err) => `- ${err}`),
      ]);
      stopSimulation();
      return;
    }

    if (isRunning) {
      stopSimulation();
      setCompileStatus({ state: "paused", message: "Simulation paused" });
      setSerialOutput((prev) => [...prev, "⏸ Simulation paused"]);
      return;
    }

    setCompileStatus({ state: "ok", message: "Simulation running" });
    setSerialOutput((prev) => [...prev, "▶ Simulation started", ...nextDiagnostics.script]);
    startSimulation();
    executeCode(code);
  }, [computeDiagnostics, executeCode, isRunning, startSimulation, stopSimulation, code]);

  const handleReset = useCallback(() => {
    resetSimulation();
    setSerialOutput(["💡 Tip: Type code, then hit Run to validate and stream live output."]);
    setCompileStatus({ state: "idle", message: "Ready to simulate" });
  }, [resetSimulation]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const snap = telemetryRef.current;
      setSerialOutput((prev) => [
        ...prev.slice(-24),
        `T${new Date().toLocaleTimeString()} :: L:${(snap.leftMotor * 100).toFixed(0)}% R:${(snap.rightMotor * 100).toFixed(0)}% | ultrasonic ${snap.sensors.ultrasonic}m`,
      ]);
    }, 900);

    return () => clearInterval(interval);
  }, [isRunning]);

  const simulationState = useMemo(() => {
    if (compileStatus.state === "error") return "error";
    if (isRunning) return "running";
    if (compileStatus.state === "paused") return "paused";
    return "idle";
  }, [compileStatus.state, isRunning]);

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
              onChange={(event) => setBoard(event.target.value as keyof typeof boardPresets)}
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

            <CodeEditor value={code} onChange={setCode} language="javascript" />

            <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-background/60 p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                {compileStatus.state === "ok" && <Shield className="h-4 w-4 text-green-400" />}
                {compileStatus.state === "error" && <Bug className="h-4 w-4 text-destructive" />}
                {compileStatus.state === "idle" && <Radio className="h-4 w-4 text-muted-foreground" />}
                {compileStatus.state === "paused" && <Pause className="h-4 w-4 text-amber-400" />}
                <span className="text-sm font-medium">{compileStatus.message}</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Button variant="outline" size="sm" onClick={() => setDiagnostics(computeDiagnostics())}>
                  Run validation only
                </Button>
              </div>
            </div>

            <Card className="p-4 glass-card">
              <h3 className="text-sm font-semibold mb-2">Serial Monitor</h3>
              <div className="h-[160px] overflow-y-auto rounded-md border border-border/50 bg-background/60 p-3 font-mono text-xs space-y-1">
                {serialOutput.map((line, index) => (
                  <div key={`${line}-${index}`} className="text-foreground/80">
                    {line}
                  </div>
                ))}
              </div>
            </Card>
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
                  {isRunning ? "Live" : "Idle"}
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
                      : compileStatus.state === "error"
                        ? "bg-red-500/15 text-red-400"
                        : compileStatus.state === "ok"
                          ? "bg-blue-500/15 text-blue-300"
                          : "bg-slate-500/15 text-slate-300"
                  }`}
                >
                  {isRunning ? "Running" : compileStatus.state === "error" ? "Build errors" : compileStatus.state === "ok" ? "Validated" : "Idle"}
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
              {diagnostics.errors.length > 0 ? (
                <div className="whitespace-pre-wrap rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
                  Review the errors above and fix them to continue.
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
