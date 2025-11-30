'use client';

import React from 'react';

interface WarningsProps {
  warnings: string[];
}

export const Warnings: React.FC<WarningsProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((warning, idx) => (
        <div
          key={`${warning}-${idx}`}
          className="border border-red-500/40 bg-red-900/20 text-red-200 px-3 py-2 rounded-lg shadow-sm"
        >
          <p className="text-xs uppercase tracking-wide text-red-300">Warning</p>
          <p className="text-sm leading-relaxed">{warning}</p>
        </div>
      ))}
    </div>
  );
};

