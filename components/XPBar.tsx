"use client";

import React from "react";

type Props = {
  xp: number;
  level: number;
  nextLevelXp: number;
};

export function XPBar({ xp, level, nextLevelXp }: Props) {
  const percent = Math.min(100, Math.round((xp / nextLevelXp) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>Level {level}</span>
        <span>{xp} / {nextLevelXp} XP</span>
      </div>
      <div className="h-3 w-full rounded bg-slate-200">
        <div className="h-3 rounded bg-purple-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
