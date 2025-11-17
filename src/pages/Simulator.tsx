import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Download } from "lucide-react";
import Navigation from "@/components/Navigation";
import Editor from "@monaco-editor/react";

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

const Simulator = () => {
  const [code, setCode] = useState(defaultCode);
  const [isRunning, setIsRunning] = useState(false);
  const [serialOutput, setSerialOutput] = useState<string[]>([]);
  const [ledState, setLedState] = useState(false);

  const handleRun = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      setSerialOutput(prev => [...prev, "▶ Simulation started"]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Robot Simulator</h1>
          <p className="text-muted-foreground">Wokwi-style electronics simulator</p>
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
                <Button size="sm" variant="outline" onClick={() => setIsRunning(false)}>
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
              <h2 className="text-xl font-semibold mb-4">Virtual Board</h2>
              <div className="relative bg-[#008080] rounded-lg p-8 min-h-[300px] border-4 border-[#006666]">
                <div className="absolute top-2 left-2 text-white text-xs font-mono">ARDUINO UNO</div>
                <div className="absolute top-8 right-8">
                  <div className="text-white text-xs mb-1">LED 13</div>
                  <div className={`w-8 h-8 rounded-full transition-all ${ledState ? 'bg-yellow-400 shadow-glow-cyan' : 'bg-yellow-900'}`} />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
