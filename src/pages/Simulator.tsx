import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Download, Cpu, Zap, Radio, Brain, AlertTriangle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const defaultCode = `// Arduino-style robot code
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(2, OUTPUT); // Motor A
  pinMode(3, OUTPUT); // Motor B
  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);

  // Basic forward motion
  digitalWrite(2, HIGH);
  digitalWrite(3, LOW);
  delay(1000);

  Serial.println("Robot moving...");
}`;

const boardPresets = {
  "arduino-uno": {
    name: "Arduino Uno",
    color: "from-cyan-500/70 to-emerald-500/60",
    label: "ARDUINO UNO",
    lanes: 10,
  },
  "arduino-nano": {
    name: "Arduino Nano",
    color: "from-indigo-500/70 to-blue-500/60",
    label: "ARDUINO NANO",
    lanes: 8,
  },
  esp32: {
    name: "ESP32 DevKit",
    color: "from-purple-500/70 to-pink-500/60",
    label: "ESP32 DEVKIT",
    lanes: 12,
  },
};

const Simulator = () => {
  const [code, setCode] = useState(defaultCode);
  const [serialOutput, setSerialOutput] = useState<string[]>([]);
  const [ledState, setLedState] = useState(false);
  const [board, setBoard] = useState<keyof typeof boardPresets>("arduino-uno");
  const [compileStatus, setCompileStatus] = useState<"idle" | "ok" | "error" | "analyzing">("idle");
  const [compileErrors, setCompileErrors] = useState<string[]>([]);

  const extractSerialMessages = (sketch: string) => {
    const regex = /Serial\.println?\(([^)]+)\)/g;
    const messages: string[] = [];
    let match;

    while ((match = regex.exec(sketch))) {
      messages.push(match[1].replace(/["'`]/g, "").trim());
    }

    return messages.length > 0
      ? messages
      : ["No explicit Serial.print calls found, streaming telemetry only."];
  };

  const validateSketch = (sketch: string) => {
    const errors: string[] = [];

    if (!sketch.includes("void setup")) errors.push("Missing setup() function");
    if (!sketch.includes("void loop")) errors.push("Missing loop() function");

    const braceDiff = (sketch.match(/\{/g)?.length || 0) - (sketch.match(/\}/g)?.length || 0);
    if (braceDiff !== 0) errors.push("Unbalanced braces detected");

    if (!/Serial\.begin/.test(sketch)) {
      errors.push("Serial port never initialized (Serial.begin missing)");
    }

    if (!/digitalWrite|analogWrite/.test(sketch)) {
      errors.push("No pin control detected. Add digitalWrite/analogWrite calls.");
    }

    return errors;
  };

  const currentBoard = useMemo(() => boardPresets[board], [board]);

  const compiledMessages = useMemo(() => extractSerialMessages(code), [code]);

  useEffect(() => {
    setCompileStatus("idle");
    setCompileErrors([]);
  }, [code]);

  useEffect(() => {
    if (!isRunning || compileStatus !== "ok") return;

    const messages = [
      "[Boot] MCU ready. Uploading sketch...",
      "[Info] Pins initialized",
      ...compiledMessages.map((msg) => `[Serial] ${msg}`),
      "[Sensor] Ultrasonic ping 24cm",
      "[Info] LED toggled",
    ];

    let step = 0;
    const interval = setInterval(() => {
      setSerialOutput((prev) => [...prev, messages[step % messages.length]]);
      setLedState((prev) => !prev);
      step += 1;
    }, 900);

    return () => clearInterval(interval);
  }, [isRunning, compileStatus, compiledMessages]);

  const handleRun = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    setCompileStatus("analyzing");
    const issues = validateSketch(code);

    if (issues.length) {
      setCompileStatus("error");
      setCompileErrors(issues);
      setSerialOutput((prev) => [
        ...prev,
        "⛔ Compilation failed",
        ...issues.map((issue) => `• ${issue}`),
      ]);
      setIsRunning(false);
      return;
    }

    setCompileErrors([]);
    setCompileStatus("ok");
    setSerialOutput((prevOutput) => [
      ...prevOutput,
      "✅ Compile succeeded",
      "▶ Simulation started",
    ]);
    setIsRunning(true);
  };

  const handleReset = () => {
    clearTimers();
    resetSimulation();
    setLedState(false);
    setSerialOutput([]);
    setCompileErrors([]);
    setCompileStatus("idle");
  };

  const handlePause = () => {
    clearTimers();
    stopSimulation();
    setLedState(false);
    appendSerial("■ Simulation paused");
  };

  useEffect(() => () => clearTimers(), []);

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5 text-primary" />
              <h1 className="text-4xl font-bold">Robot Simulator</h1>
            </div>
            <p className="text-muted-foreground">Wokwi-inspired electronics playground with quick board switching</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={board} onValueChange={(value: keyof typeof boardPresets) => setBoard(value)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Choose board" />
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

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Code Editor</h2>
              <div className="flex gap-2 items-center">
                <div
                  className={`text-xs px-3 py-1 rounded-full border ${
                    compileStatus === "ok"
                      ? "border-emerald-400/60 text-emerald-200 bg-emerald-500/10"
                      : compileStatus === "error"
                        ? "border-red-400/60 text-red-200 bg-red-500/10"
                        : compileStatus === "analyzing"
                          ? "border-amber-400/60 text-amber-100 bg-amber-500/10"
                          : "border-border text-muted-foreground bg-background/60"
                  }`}
                >
                  {compileStatus === "analyzing"
                    ? "Analyzing sketch..."
                    : compileStatus === "ok"
                      ? "Ready to simulate"
                      : compileStatus === "error"
                        ? "Fix required"
                        : "Idle"}
                </div>
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

            <div className="border border-border/50 rounded-lg overflow-hidden h-[500px]">
              <Editor
                height="100%"
                defaultLanguage="cpp"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </div>

            {compileErrors.length > 0 && (
              <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
                <div className="font-semibold mb-1">Compilation blockers</div>
                <ul className="list-disc list-inside space-y-1">
                  {compileErrors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="p-6 glass-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Virtual Board</h2>
                  <p className="text-xs text-muted-foreground">{currentBoard.name} · live LED feedback</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Radio className={`h-3 w-3 ${isRunning ? "text-green-400" : "text-muted-foreground"}`} />
                  {isRunning ? "Live" : "Idle"}
                </div>
              </div>
              <div className={`relative rounded-xl p-6 min-h-[320px] border bg-gradient-to-br ${currentBoard.color} overflow-hidden`}>
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
                            className={`px-2 py-1 rounded border text-center transition-colors ${
                              usedPins.includes(`D${lane + 2}`)
                                ? "bg-emerald-500/70 border-emerald-200 text-white shadow-glow-cyan"
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
                        {["5V", "3V3", "GND", "VIN", "A0", "A1", "A2", "A3", "A4", "A5"].map((label) => (
                          <div
                            key={label}
                            className={`px-2 py-1 rounded border transition-colors ${
                              usedPins.includes(label)
                                ? "bg-emerald-500/70 border-emerald-200 text-white shadow-glow-cyan"
                                : "bg-white/10 border-white/5"
                            }`}
                          >
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/80">Highlighted pins show what your code is touching.</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full shadow-lg border-4 border-white/40 transition-all duration-300 ${ledState ? "bg-yellow-300 shadow-glow-cyan" : "bg-white/20"}`} />
                    <div className="text-white text-sm">
                      <div className="font-semibold">Built-in LED</div>
                      <p className="text-white/80 text-xs">Toggles automatically while simulation runs</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 glass-card">
              <h2 className="text-xl font-semibold mb-4">Serial Monitor</h2>
              <div className="bg-black/50 rounded-lg p-4 h-[200px] overflow-y-auto font-mono text-sm">
                {serialOutput.length === 0 ? (
                  <div className="text-gray-500">Waiting for output...</div>
                ) : (
                  serialOutput.map((line, i) => (
                    <div key={i} className="text-green-400 mb-1">{line}</div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6 glass-card space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">AI Tutor Coach</h2>
              </div>
              {simulatorError ? (
                <div className="flex items-start gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-semibold">Detected issue</p>
                    <p>{simulatorError}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Run your sketch to get proactive coaching when something fails.</p>
              )}

              {isHintLoading ? (
                <p className="text-sm text-muted-foreground">AI tutor is reviewing your code…</p>
              ) : aiHint ? (
                <div className="rounded-md bg-muted/50 border border-border/50 p-3 text-sm whitespace-pre-wrap">
                  {aiHint}
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
