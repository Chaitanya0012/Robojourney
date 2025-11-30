'use client';

import React from 'react';

interface NextPriorityProps {
  nextPriority?: string;
}

export const NextPriority: React.FC<NextPriorityProps> = ({ nextPriority }) => {
  if (!nextPriority) return null;

  return (
    <div className="border border-indigo-400/50 bg-indigo-900/20 text-indigo-50 px-4 py-3 rounded-xl shadow-sm">
      <p className="text-xs uppercase tracking-wide text-indigo-200">Next Priority</p>
      <p className="text-base leading-relaxed font-semibold">{nextPriority}</p>
    </div>
  );
};

