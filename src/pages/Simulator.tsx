import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Download, Cpu, Zap, Radio, AlertTriangle, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import Editor from "@monaco-editor/react";
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
  const { user } = useAuth();
  const [code, setCode] = useState(defaultCode);
  const [isRunning, setIsRunning] = useState(false);
  const [serialOutput, setSerialOutput] = useState<string[]>([]);
  const [ledState, setLedState] = useState(false);
  const [board, setBoard] = useState<keyof typeof boardPresets>("arduino-uno");
  const [simErrors, setSimErrors] = useState<string[]>([]);
  const [tutorResponse, setTutorResponse] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentBoard = useMemo(() => boardPresets[board], [board]);
  const usedPins = useMemo(() => {
    const pins = new Set<string>();
    const regex = /(pinMode|digitalWrite|analogWrite|analogRead)\s*\(\s*([^,\s\)]+)/gi;
    const normalize = (pin: string) => {
      const trimmed = pin.trim();
      if (/^A\d+/i.test(trimmed)) return trimmed.toUpperCase();
      if (/^\d+$/.test(trimmed)) return `D${trimmed}`;
      if (trimmed.toUpperCase() === "LED_BUILTIN") return "D13";
      return trimmed.toUpperCase();
    };

    let match;
    while ((match = regex.exec(code))) {
      pins.add(normalize(match[2]));
    }
    return pins;
  }, [code]);

  const validateSketch = (sketch: string) => {
    const issues: string[] = [];
    if (!sketch.includes("void setup")) issues.push("Missing setup() function");
    if (!sketch.includes("void loop")) issues.push("Missing loop() function");
    const braces = (sketch.match(/[\{\}]/g) || []).reduce((count, brace) => (brace === "{" ? count + 1 : count - 1), 0);
    if (braces !== 0) issues.push("Unbalanced braces detected");
    return issues;
  };

  const buildSimPrompt = (issues: string[], sketch: string) => `You are a Socratic robotics tutor helping a learner debug an Arduino-style sketch.
Highlight the issues without giving the final fix. Ask 2-3 guiding questions and suggest what signals, pins, or functions to inspect next.

Issues detected: ${issues.join(", ")}
Sketch:\n${sketch}`;

  const requestTutorHelp = async (issues: string[]) => {
    if (!user) {
      toast.error("Sign in to get AI tutor guidance");
      return;
    }

    setIsAnalyzing(true);
    setTutorResponse("");
    setSimErrors(issues);

    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          prompt: buildSimPrompt(issues.length ? issues : ["No blocking errors detected"], code),
          userId: user.id,
          action: 'chat',
          mode: 'socratic',
        }
      });

      if (error) throw error;
      setTutorResponse(data.response || "The tutor is ready to help. Try refining your code and rerun.");
    } catch (error: any) {
      console.error('AI tutor simulator help error:', error);
      toast.error(error.message || "Tutor could not analyze the sketch");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    const messages = [
      "[Boot] MCU ready. Uploading sketch...",
      "[Info] Pins initialized",
      "[Serial] Robot moving...",
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
  }, [isRunning]);

  const handleRun = async () => {
    const issues = validateSketch(code);
    if (issues.length > 0) {
      setSimErrors(issues);
      setIsRunning(false);
      setSerialOutput((prevOutput) => [...prevOutput, "⚠️ Simulation blocked: fix the sketch issues first."]);
      await requestTutorHelp(issues);
      return;
    }

    setSimErrors([]);
    setTutorResponse("");
    setIsRunning((prev) => {
      const next = !prev;
      if (next) {
        setSerialOutput((prevOutput) => [...prevOutput, "▶ Simulation started"]);
      }
      return next;
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setLedState(false);
    setSerialOutput([]);
    setSimErrors([]);
    setTutorResponse("");
  };

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
                            className={`px-2 py-1 rounded border text-center transition ${
                              usedPins.has(`D${lane + 2}`)
                                ? "bg-amber-200 text-black border-yellow-300 shadow-glow-cyan"
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
                            className={`px-2 py-1 rounded border ${
                              usedPins.has(label)
                                ? "bg-amber-200 text-black border-yellow-300 shadow-glow-cyan"
                                : "bg-white/10 border-white/5"
                            }`}
                          >
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full shadow-lg border-4 border-white/40 transition-all duration-300 ${ledState ? "bg-yellow-300 shadow-glow-cyan" : "bg-white/20"}`} />
                    <div className="text-white text-sm">
                      <div className="font-semibold">Built-in LED</div>
                      <p className="text-white/80 text-xs">Toggles automatically while simulation runs</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/80">Highlighted pins are referenced in your sketch.</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">AI Tutor Guidance</h2>
                  <p className="text-xs text-muted-foreground">Guiding questions appear when the simulator spots issues.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => requestTutorHelp(validateSketch(code))}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze sketch
                </Button>
              </div>
              {simErrors.length > 0 && (
                <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-semibold">We spotted some blockers:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {simErrors.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <div className="p-3 rounded-lg border border-border/50 bg-muted/40 min-h-[80px] text-sm">
                {isAnalyzing ? (
                  <p className="text-muted-foreground">AI tutor is reviewing your code with guiding questions...</p>
                ) : tutorResponse ? (
                  <p className="whitespace-pre-wrap">{tutorResponse}</p>
                ) : (
                  <p className="text-muted-foreground">Run the simulator or click Analyze to get thought-provoking prompts.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
