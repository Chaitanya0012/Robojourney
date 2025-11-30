"use client";

import React from "react";

type WarningsProps = {
  warnings: string[];
};

export const Warnings: React.FC<WarningsProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;
  return (
    <div className="space-y-2">
      {warnings.map((warning, index) => (
        <div
          key={`${warning}-${index}`}
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 shadow-sm dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-100"
        >
          <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
          <p className="whitespace-pre-wrap leading-relaxed">{warning}</p>
        </div>
      ))}
    </div>
  );
};

export default Warnings;
