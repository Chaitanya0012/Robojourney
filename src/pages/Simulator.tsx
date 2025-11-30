import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Download, Cpu, Zap, Radio, Shield, Bug } from "lucide-react";
import Editor from "@monaco-editor/react";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSimulator } from "@/hooks/useSimulator";
import { SimulatorCanvas } from "@/components/simulator/SimulatorCanvas";
import { TelemetryPanel } from "@/components/simulator/TelemetryPanel";

const starterSketch = `// Async-friendly sketch. The simulator exposes setMotor(left, right), readSensor(name), and sleep(ms).
async function main(setMotor, readSensor, sleep, console) {
  console.log("Booting rover...");
  await sleep(150);

  // Roll forward gently
  setMotor(0.35, 0.35);
  await sleep(600);

  // Probe the ultrasonic sensor
  const distance = await readSensor("ultrasonic");
  console.log("Ultrasonic distance:", distance, "m");

  if (distance < 0.6) {
    console.log("Obstacle detected → backing up and rotating");
    setMotor(-0.25, 0.25);
    await sleep(400);
  }

  // Finish with a short sprint
  setMotor(0.6, 0.6);
  await sleep(450);
  setMotor(0, 0);
  console.log("Sequence complete");
}

main(setMotor, readSensor, sleep, console);`;

type CompileStatus = {
  state: "idle" | "ok" | "error";
  message: string;
};

const Simulator = () => {
  const [code, setCode] = useState(starterSketch);
  const [serialOutput, setSerialOutput] = useState<string[]>(["Ready for upload…"]);
  const [compileStatus, setCompileStatus] = useState<CompileStatus>({ state: "idle", message: "Awaiting validation" });

  const { isRunning, telemetry, startSimulation, stopSimulation, resetSimulation, executeCode } = useSimulator();
  const telemetryRef = useRef(telemetry);

  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  const boardPresets = useMemo(
    () => ({
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
    }),
    []
  );

  const [board, setBoard] = useState<keyof typeof boardPresets>("arduino-uno");
  const currentBoard = boardPresets[board];

  const validateCode = useCallback(() => {
    try {
      // Will throw on syntax errors and surface meaningful feedback
      new Function("setMotor", "readSensor", "sleep", "console", code);
      setCompileStatus({ state: "ok", message: "Parsed successfully. Runtime faults will surface in the console." });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown compiler error";
      setCompileStatus({ state: "error", message });
      setSerialOutput(prev => [...prev, `Compilation failed: ${message}`].slice(-30));
      return false;
    }
  }, [code]);

  const handleRun = () => {
    if (isRunning) {
      stopSimulation();
      setSerialOutput(prev => [...prev, "⏸ Simulation paused"].slice(-30));
      return;
    }

    const passed = validateCode();
    if (!passed) return;

    setSerialOutput(["▶ Simulation started", `Board: ${currentBoard.name}`, "Uploading sketch…"]);
    startSimulation();
    executeCode(code);
  };

  const handleReset = () => {
    resetSimulation();
    setSerialOutput(["Reset complete", "Ready for upload…"]);
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const snap = telemetryRef.current;
      setSerialOutput(prev =>
        [
          ...prev.slice(-24),
          `T${new Date().toLocaleTimeString()} :: L:${(snap.leftMotor * 100).toFixed(0)}% R:${(snap.rightMotor * 100).toFixed(
            0
          )}% | ultrasonic ${snap.sensors.ultrasonic}m`,
        ]
      );
    }, 700);

    return () => clearInterval(interval);
  }, [isRunning]);

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
              onChange={e => setBoard(e.target.value as keyof typeof boardPresets)}
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
                onChange={value => setCode(value || "")}
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
                <Button variant="outline" size="sm" onClick={validateCode}>
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
                  {isRunning ? "Live" : "Idle"}
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
                        {[...Array(currentBoard.lanes).keys()].map(lane => (
                          <div key={lane} className="px-2 py-1 rounded bg-white/10 border border-white/5 text-center">
                            D{lane + 2}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 border border-white/10 shadow-inner">
                      <div className="text-white/80 text-xs mb-2">Power & Analog</div>
                      <div className="flex flex-wrap gap-2 text-[10px] text-white/90">
                        {["5V", "3V3", "GND", "VIN", "A0", "A1", "A2", "A3", "A4", "A5"].map(label => (
                          <div key={label} className="px-2 py-1 rounded bg-white/10 border border-white/5">
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full shadow-lg border-4 border-white/40 transition-all duration-300 ${
                        isRunning ? "bg-yellow-300 shadow-glow-cyan" : "bg-white/20"
                      }`}
                    />
                    <div className="text-white text-sm">
                      <div className="font-semibold">Built-in LED</div>
                      <p className="text-white/80 text-xs">Toggles automatically while simulation runs</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 glass-card">
              <h2 className="text-lg font-semibold mb-3">3D Scene</h2>
              <SimulatorCanvas telemetry={telemetry} />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TelemetryPanel telemetry={telemetry} />
              <Card className="p-4 glass-card">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">Serial Monitor</h2>
                  <span className="text-xs text-muted-foreground">Live console</span>
                </div>
                <Separator className="mb-2" />
                <div className="bg-black/50 rounded-lg p-3 h-[180px] overflow-y-auto font-mono text-xs space-y-1">
                  {serialOutput.length === 0 ? (
                    <div className="text-gray-500">Waiting for output…</div>
                  ) : (
                    serialOutput.map((line, i) => (
                      <div key={i} className="text-green-400">
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
