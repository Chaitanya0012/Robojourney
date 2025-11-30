import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Download, Cpu, Zap, Radio, Brain } from "lucide-react";
import Navigation from "@/components/Navigation";
import Editor from "@monaco-editor/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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

const Simulator = () => {
  const { user } = useAuth();
  const [code, setCode] = useState(defaultCode);
  const [isRunning, setIsRunning] = useState(false);
  const [serialOutput, setSerialOutput] = useState<string[]>([]);
  const [ledState, setLedState] = useState(false);
  const [board, setBoard] = useState<keyof typeof boardPresets>("arduino-uno");
  const [digitalUsedPins, setDigitalUsedPins] = useState<number[]>([]);
  const [analogUsedPins, setAnalogUsedPins] = useState<string[]>([]);
  const [tutorGuidance, setTutorGuidance] = useState<string>("");
  const [isTutorAnalyzing, setIsTutorAnalyzing] = useState(false);

  const currentBoard = useMemo(() => boardPresets[board], [board]);

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
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          prompt: `You are helping a student debug a microcontroller sketch in a virtual simulator. Please DO NOT give the final code or numeric answers. Ask guiding questions and suggest checkpoints so the student can fix issues themselves.\n\nBoard: ${currentBoard.name}\nDetected problems:\n${errors.map((err) => `- ${err}`).join('\n')}\n\nHere is the current code:\n${code}\n\nRespond with 3-5 short prompts that lead the student to the fix, and end with one reflection question.`,
          userId: user?.id,
          action: 'chat'
        }
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
    const validationErrors = validateCode();

    if (validationErrors.length > 0) {
      setIsRunning(false);
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
    setTutorGuidance("");
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
