import React, { useState } from "react";

export type PlanStep = {
  title: string;
  description?: string;
  prerequisites?: string[];
  resources?: string[];
};

type Props = {
  plan?: PlanStep[];
};

const ProjectPlan: React.FC<Props> = ({ plan = [] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!plan.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Project Plan</h3>
        <p className="text-sm text-gray-500">
          Expand each phase to see the details, prerequisites, and resources.
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {plan.map((step, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="p-4">
              <button
                type="button"
                className="w-full flex items-center justify-between text-left"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                <div>
                  <p className="text-sm uppercase text-gray-500 font-semibold">
                    Step {idx + 1}
                  </p>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {step.title}
                  </h4>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full border ${
                    isOpen
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-600"
                  }`}
                >
                  {isOpen ? "Hide" : "View"}
                </span>
              </button>
              {isOpen ? (
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  {step.description ? <p>{step.description}</p> : null}
                  {step.prerequisites?.length ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                        Prerequisites
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {step.prerequisites.map((pre, i) => (
                          <li key={i}>{pre}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {step.resources?.length ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                        Resources
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {step.resources.map((res, i) => (
                          <li key={i}>{res}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectPlan;
