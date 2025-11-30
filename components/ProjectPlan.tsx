"use client";

import React, { useState } from "react";
import type { PlanStep } from "./ChatUI";

type ProjectPlanProps = {
  plan: PlanStep[];
};

export const ProjectPlan: React.FC<ProjectPlanProps> = ({ plan }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!plan || plan.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Project Plan</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Expand steps to see details, prerequisites, and resources.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {plan.map((step, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={`${step.title}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-800/60"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.title}</p>
                  {step.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-2">
                      {step.description}
                    </p>
                  )}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                  {isOpen ? "Hide" : "Show"}
                </span>
              </button>
              {isOpen && (
                <div className="space-y-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-100">
                  {step.description && (
                    <p className="whitespace-pre-wrap leading-relaxed">{step.description}</p>
                  )}
                  {step.prerequisites && step.prerequisites.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Prerequisites
                      </p>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        {step.prerequisites.map((item, idx) => (
                          <li key={`${item}-${idx}`} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {step.resources && step.resources.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Resources
                      </p>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        {step.resources.map((item, idx) => (
                          <li key={`${item}-${idx}`} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectPlan;
