'use client';

import React from 'react';

interface BestPracticesProps {
  bestPractices: string[];
}

export const BestPractices: React.FC<BestPracticesProps> = ({ bestPractices }) => {
  if (!bestPractices || bestPractices.length === 0) return null;

  return (
    <div className="space-y-2">
      {bestPractices.map((item, idx) => (
        <div
          key={`${item}-${idx}`}
          className="border border-emerald-500/40 bg-emerald-900/20 text-emerald-50 px-3 py-2 rounded-lg shadow-sm"
        >
          <p className="text-xs uppercase tracking-wide text-emerald-300">Best Practice</p>
          <p className="text-sm leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
};

