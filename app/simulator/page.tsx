"use client";

import { useState } from "react";
import { LineFollowerSimulator } from "../../components/LineFollowerSimulator";
import { useNavigationOrchestrator } from "../../components/NavigationOrchestrator";

export default function SimulatorPage() {
  const { applyNavigatorOutput } = useNavigationOrchestrator();
  const [status, setStatus] = useState({ leftSensor: 0, rightSensor: 0, heading: 0 });

  const handleAskNavigator = async (prompt: string) => {
    const res = await fetch("/api/navigator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: prompt, context: "simulator" }),
    });
    if (!res.ok) return;
    const data = await res.json();
    applyNavigatorOutput(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Simulator</p>
          <h1 className="text-3xl font-bold text-gradient">Line follower lab</h1>
          <p className="text-muted-foreground">Watch sensors, heading, and drift warnings while you tune logic.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-slate-900/60 p-4 shadow-card-hover">
        <LineFollowerSimulator onTelemetry={setStatus} />
        <div className="mt-4 grid gap-4 md:grid-cols-4 text-sm text-muted-foreground">
          <div>Left sensor: {status.leftSensor.toFixed(2)}</div>
          <div>Right sensor: {status.rightSensor.toFixed(2)}</div>
          <div>Heading: {status.heading.toFixed(2)}°</div>
          <div className="text-amber-200">{Math.abs(status.leftSensor - status.rightSensor) > 0.4 ? "Drifting" : "Stable"}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            "Teach me this",
            "Why is my robot drifting?",
            "Fix my logic",
          ].map((label) => (
            <button
              key={label}
              onClick={() => handleAskNavigator(label)}
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-glow-cyan hover:bg-indigo-400"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
