"use client";

import React from "react";

type NextPriorityProps = {
  nextPriority?: string;
};

export const NextPriority: React.FC<NextPriorityProps> = ({ nextPriority }) => {
  if (!nextPriority) return null;
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-900/20">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-200">
        <span className="h-2 w-2 rounded-full bg-indigo-500" /> Next Priority
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
        {nextPriority}
      </p>
    </div>
  );
};

export default NextPriority;
