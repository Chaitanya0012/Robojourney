"use client";

import React from "react";

type BestPracticesProps = {
  bestPractices: string[];
};

export const BestPractices: React.FC<BestPracticesProps> = ({ bestPractices }) => {
  if (!bestPractices || bestPractices.length === 0) return null;
  return (
    <div className="space-y-2">
      {bestPractices.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-100"
        >
          <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
          <p className="whitespace-pre-wrap leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
};

export default BestPractices;
