'use client';

import React, { useState } from 'react';

export type PlanStep = {
  title: string;
  description: string;
  prerequisites?: string[];
  resources?: string[];
};

interface ProjectPlanProps {
  plan: PlanStep[];
}

export const ProjectPlan: React.FC<ProjectPlanProps> = ({ plan }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!plan || plan.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm uppercase tracking-wide text-slate-400">Project Plan</h3>
      <div className="space-y-2">
        {plan.map((step, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={`${step.title}-${idx}`}
              className="border border-slate-800 bg-slate-900/70 rounded-xl overflow-hidden shadow"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-slate-100 hover:bg-slate-800/60"
              >
                <div>
                  <p className="text-sm text-slate-400">Step {idx + 1}</p>
                  <p className="text-lg font-semibold">{step.title}</p>
                </div>
                <span className="text-slate-400">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-slate-200 leading-relaxed">{step.description}</p>
                  {step.prerequisites && step.prerequisites.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Prerequisites</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-200">
                        {step.prerequisites.map((item, i) => (
                          <li key={`${item}-${i}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {step.resources && step.resources.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Resources</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-emerald-200">
                        {step.resources.map((item, i) => (
                          <li key={`${item}-${i}`}>{item}</li>
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

