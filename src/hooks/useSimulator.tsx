import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Telemetry {
  position: [number, number, number];
  rotation: number;
  leftMotor: number;
  rightMotor: number;
  sensors: {
    ultrasonic: number;
  };
  timestamp: number;
}

export const useSimulator = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry>({
    position: [0, 0.05, 0],
    rotation: 0,
    leftMotor: 0,
    rightMotor: 0,
    sensors: { ultrasonic: 2.0 },
    timestamp: 0,
  });

  const workerRef = useRef<Worker | null>(null);
  const apiHandlersRef = useRef<Map<string, (data: any) => void>>(new Map());

  const startSimulation = useCallback(() => {
    setIsRunning(true);
    toast({
      title: "Simulation Started",
      description: "Robot is ready to execute your code",
    });
  }, [toast]);

  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    toast({
      title: "Simulation Stopped",
      description: "Robot has been stopped",
    });
  }, [toast]);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    setTelemetry({
      position: [0, 0.05, 0],
      rotation: 0,
      leftMotor: 0,
      rightMotor: 0,
      sensors: { ultrasonic: 2.0 },
      timestamp: 0,
    });
    toast({
      title: "Simulation Reset",
      description: "Robot returned to start position",
    });
  }, [stopSimulation, toast]);

  const updateTelemetry = useCallback((updates: Partial<Telemetry>) => {
    setTelemetry(prev => ({
      ...prev,
      ...updates,
      timestamp: Date.now(),
    }));
  }, []);

  // Lightweight kinematic loop to keep the canvas feeling responsive
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTelemetry(prev => {
        const speed = (prev.leftMotor + prev.rightMotor) / 2;
        const turn = (prev.rightMotor - prev.leftMotor) / 2;

        const heading = prev.rotation + turn * 0.08;
        const dx = Math.cos(heading) * speed * 0.05;
        const dz = Math.sin(heading) * speed * 0.05;

        const distanceToVirtualWall = Math.max(0.15, 1.5 - Math.abs(prev.position[0] + dx));

        return {
          ...prev,
          position: [prev.position[0] + dx, prev.position[1], prev.position[2] + dz],
          rotation: heading,
          sensors: {
            ultrasonic: Number(distanceToVirtualWall.toFixed(3)),
          },
          timestamp: Date.now(),
        };
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isRunning]);

  // API handlers that the worker can call
  const setMotor = useCallback((left: number, right: number) => {
    updateTelemetry({ leftMotor: left, rightMotor: right });
  }, [updateTelemetry]);

  const readSensor = useCallback((name: string): Promise<number> => {
    return new Promise(resolve => {
      if (name === "ultrasonic") {
        resolve(telemetry.sensors.ultrasonic);
      } else {
        resolve(0);
      }
    });
  }, [telemetry]);

  const executeCode = useCallback((code: string) => {
    try {
      // Create a safe execution environment
      const workerCode = `
        let motorState = { left: 0, right: 0 };
        
        self.onmessage = function(e) {
          if (e.data.type === 'init') {
            console.log('Worker initialized');
          } else if (e.data.type === 'execute') {
            try {
              // Create API functions
              const setMotor = (left, right) => {
                motorState = { left, right };
                self.postMessage({ type: 'setMotor', left, right });
                console.log('Setting motors:', left, right);
              };
              
              const readSensor = (name) => {
                return new Promise((resolve) => {
                  const id = Math.random().toString(36);
                  self.postMessage({ type: 'readSensor', name, id });
                  
                  const handler = (e) => {
                    if (e.data.type === 'sensorValue' && e.data.id === id) {
                      self.removeEventListener('message', handler);
                      resolve(e.data.value);
                    }
                  };
                  self.addEventListener('message', handler);
                });
              };
              
              const sleep = (ms) => {
                return new Promise(resolve => setTimeout(resolve, ms));
              };
              
              // Execute user code
              const userFunction = new Function('setMotor', 'readSensor', 'sleep', 'console', e.data.code);
              userFunction(setMotor, readSensor, sleep, console);
              
              self.postMessage({ type: 'complete' });
              
            } catch (error) {
              console.error('Worker error:', error);
              self.postMessage({ type: 'error', message: error.message });
            }
          }
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      const worker = new Worker(URL.createObjectURL(blob));

      worker.onmessage = (e) => {
        console.log('Main thread received:', e.data.type);
        if (e.data.type === "setMotor") {
          console.log('Updating motors:', e.data.left, e.data.right);
          setMotor(e.data.left, e.data.right);
        } else if (e.data.type === "readSensor") {
          readSensor(e.data.name).then(value => {
            worker.postMessage({
              type: "sensorValue",
              id: e.data.id,
              value,
            });
          });
        } else if (e.data.type === "complete") {
          console.log('Code execution completed');
        } else if (e.data.type === "error") {
          toast({
            title: "Code Error",
            description: e.data.message,
            variant: "destructive",
          });
          stopSimulation();
        }
      };

      worker.onerror = (error) => {
        console.error('Worker error:', error);
        toast({
          title: "Execution Error",
          description: error.message,
          variant: "destructive",
        });
        stopSimulation();
      };

      worker.postMessage({ type: "init" });
      worker.postMessage({ type: "execute", code });

      workerRef.current = worker;
    } catch (error) {
      console.error('Failed to start worker:', error);
      toast({
        title: "Failed to start",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      stopSimulation();
    }
  }, [setMotor, readSensor, stopSimulation, toast]);

  return {
    isRunning,
    telemetry,
    startSimulation,
    stopSimulation,
    resetSimulation,
    executeCode,
    updateTelemetry,
  };
};
