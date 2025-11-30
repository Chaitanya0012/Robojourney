import { useEffect, useMemo, useState } from "react";
import { Play, Pause, RotateCcw, Cpu, Zap, Radio, Shield, Bug, Sparkles, Brain } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "@/components/simulator/CodeEditor";
import { TelemetryPanel } from "@/components/simulator/TelemetryPanel";
import { SimulatorCanvas } from "@/components/simulator/SimulatorCanvas";
import { useSimulator } from "@/hooks/useSimulator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const defaultCode = `// Basic robot sketch
function setup() {
  // configure pins here
}

function loop() {
  // drive motors and read sensors
}

main(setMotor, readSensor, sleep, console);`;

type CompileStatus = {
  state: "idle" | "ok" | "error";
  message: string;
};

type Diagnostics = {
  errors: string[];
  warnings: string[];
  ledUsage: boolean;
};

const analogPinLabels = ["A0", "A1", "A2", "A3", "A4", "A5"];
const powerAndAnalogPins = ["5V", "3V3", "GND", "VIN", ...analogPinLabels];

const boardPresets = {
  "arduino-uno": { label: "Arduino Uno", name: "Arduino Uno", lanes: 12, color: "from-emerald-500/60 to-slate-900" },
  "arduino-nano": { label: "Arduino Nano", name: "Arduino Nano", lanes: 10, color: "from-blue-500/60 to-slate-900" },
  esp32: { label: "ESP32 DevKit", name: "ESP32 DevKit", lanes: 14, color: "from-indigo-500/60 to-slate-900" },
};

type BoardKey = keyof typeof boardPresets;

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

const Simulator = () => {
  const { user } = useAuth();
  const { isRunning, telemetry, startSimulation, stopSimulation, resetSimulation, executeCode } = useSimulator();

  const [board, setBoard] = useState<BoardKey>("arduino-uno");
  const [code, setCode] = useState(defaultCode);
  const [compileStatus, setCompileStatus] = useState<CompileStatus>({ state: "idle", message: "Ready to simulate" });
  const [diagnostics, setDiagnostics] = useState<Diagnostics>({ errors: [], warnings: [], ledUsage: false });
  const [serialOutput, setSerialOutput] = useState<string[]>([
    "💡 Tip: Type code, then hit Run to validate and stream live output.",
  ]);
  const [digitalUsedPins, setDigitalUsedPins] = useState<number[]>([]);
  const [analogUsedPins, setAnalogUsedPins] = useState<string[]>([]);
  const [tutorGuidance, setTutorGuidance] = useState<string>("");
  const [isTutorAnalyzing, setIsTutorAnalyzing] = useState(false);

  const currentBoard = boardPresets[board];

  const validateCode = () => {
    const errors: string[] = [];

    if (!/function\s+setup\s*\(/i.test(code)) {
      errors.push("Missing setup() function to configure pins.");
    }

    if (!/function\s+loop\s*\(/i.test(code)) {
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
    const { digitalPins, analogPins } = extractUsedPins(code);
    setDigitalUsedPins(digitalPins);
    setAnalogUsedPins(analogPins);
  }, [code]);

  const handleRun = async () => {
    const validationErrors = validateCode();

    if (validationErrors.length > 0) {
      setCompileStatus({ state: "error", message: "Fix the issues before running" });
      setDiagnostics({ errors: validationErrors, warnings: [], ledUsage: digitalUsedPins.includes(13) });
      setSerialOutput((prev) => [...prev, "⛔ Simulation blocked: fix the issues below", ...validationErrors.map((err) => `- ${err}`)]);
      await requestTutorGuidance(validationErrors);
      return;
    }

    setTutorGuidance("");
    setCompileStatus({ state: "ok", message: "Sketch validated" });
    setDiagnostics({ errors: [], warnings: [], ledUsage: digitalUsedPins.includes(13) });
    setSerialOutput((prev) => [...prev, "▶ Simulation started"]);
    startSimulation();
    executeCode(code);
  };

  const handlePause = () => {
    stopSimulation();
    setCompileStatus((prev) => ({ ...prev, state: "idle", message: "Simulation paused" }));
    setSerialOutput((prev) => [...prev, "⏸ Simulation paused"]);
  };

  const handleReset = () => {
    resetSimulation();
    setCompileStatus({ state: "idle", message: "Ready to simulate" });
    setSerialOutput(["💡 Tip: Type code, then hit Run to validate and stream live output."]);
    setTutorGuidance("");
  };

  const simulationState = useMemo(() => {
    if (compileStatus.state === "error") return "error";
    if (isRunning) return "running";
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
            <Select value={board} onValueChange={(value) => setBoard(value as BoardKey)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arduino-uno">Arduino Uno</SelectItem>
                <SelectItem value="arduino-nano">Arduino Nano</SelectItem>
                <SelectItem value="esp32">ESP32 DevKit</SelectItem>
              </SelectContent>
            </Select>
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
                {isRunning ? (
                  <Button size="sm" onClick={handlePause} className="bg-orange-500">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleRun} className="bg-green-500">
                    <Play className="h-4 w-4 mr-2" />
                    Run
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            <CodeEditor value={code} onChange={setCode} placeholder="Write your robot sketch here" />

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border border-border/50 rounded-lg p-3 bg-background/60">
              <div className="flex items-center gap-2">
                {compileStatus.state === "ok" && <Shield className="h-4 w-4 text-green-400" />}
                {compileStatus.state === "error" && <Bug className="h-4 w-4 text-destructive" />}
                {compileStatus.state === "idle" && <Radio className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm font-medium">{compileStatus.message}</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Button variant="outline" size="sm" onClick={() => setCompileStatus({ state: "idle", message: "Manual validation not yet implemented" })}>
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
                </div>
              </div>
            </Card>

            <Card className="p-4 glass-card">
              <h2 className="text-lg font-semibold mb-3">3D Scene</h2>
              <SimulatorCanvas telemetry={telemetry} />
            </Card>

            <Card className="p-4 glass-card">
              <h2 className="text-lg font-semibold mb-3">Telemetry</h2>
              <TelemetryPanel telemetry={telemetry} />
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Compilation &amp; Health</h2>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  simulationState === "running"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : simulationState === "error"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-slate-500/15 text-slate-300"
                }`}
              >
                {simulationState === "running" ? "Running" : simulationState === "error" ? "Build errors" : "Idle"}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {diagnostics.errors.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                  Sketch passes quick validation
                </div>
              ) : (
                diagnostics.errors.map((error, index) => (
                  <div key={index} className="flex items-center gap-2 text-destructive">
                    <Bug className="h-4 w-4" />
                    {error}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6 glass-card space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">AI Tutor</h2>
                <p className="text-xs text-muted-foreground">Guidance for debugging your sketch.</p>
              </div>
            </div>
            <ScrollArea className="h-40 rounded-md border border-border/50 p-3 bg-background/60">
              <div className="space-y-2 text-sm">
                {tutorGuidance ? tutorGuidance.split("\n").map((line, idx) => <p key={idx}>{line}</p>) : <p className="text-muted-foreground">Run validation to request guidance.</p>}
              </div>
            </ScrollArea>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" disabled={isTutorAnalyzing} onClick={async () => {
                const errors = validateCode();
                if (errors.length === 0) {
                  toast.info("No validation issues detected.");
                  return;
                }
                await requestTutorGuidance(errors);
              }}>
                {isTutorAnalyzing ? "Requesting..." : "Request guidance"}
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6 glass-card">
          <h2 className="text-lg font-semibold mb-3">Serial Monitor</h2>
          <ScrollArea className="h-48 rounded-md border border-border/50 p-3 bg-background/60 font-mono text-sm">
            <div className="space-y-1">
              {serialOutput.map((line, index) => (
                <div key={`${line}-${index}`} className="text-foreground/80">
                  {line}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};

export default Simulator;
