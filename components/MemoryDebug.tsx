"use client";

import React from "react";

type MemoryDebugProps = {
  memories: { text: string; score?: number }[];
};

export const MemoryDebug: React.FC<MemoryDebugProps> = ({ memories }) => {
  if (!memories || memories.length === 0) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/40 dark:bg-amber-900/20">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">
        <span className="h-2 w-2 rounded-full bg-amber-500" /> Memory Debug
      </div>
      <div className="mt-3 space-y-2 text-sm text-amber-900 dark:text-amber-100">
        {memories.map((memory, index) => (
          <div
            key={`${memory.text}-${index}`}
            className="rounded-lg border border-amber-200/70 bg-white/60 px-3 py-2 dark:border-amber-800/60 dark:bg-amber-950/40"
          >
            <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-200">
              <span>Recalled #{index + 1}</span>
              {typeof memory.score === "number" && (
                <span className="font-semibold">Score: {memory.score.toFixed(3)}</span>
              )}
            </div>
            <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-100">{memory.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryDebug;
