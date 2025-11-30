import React from "react";

type Props = {
  bestPractices?: string[];
};

const BestPractices: React.FC<Props> = ({ bestPractices = [] }) => {
  if (!bestPractices.length) return null;
  return (
    <div className="space-y-2">
      {bestPractices.map((item, idx) => (
        <div
          key={idx}
          className="border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-xl p-3 shadow-sm"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Best Practice
          </div>
          <p className="text-sm leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
};

export default BestPractices;
