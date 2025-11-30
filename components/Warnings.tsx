import React from "react";

type Props = {
  warnings?: string[];
};

const Warnings: React.FC<Props> = ({ warnings = [] }) => {
  if (!warnings.length) return null;
  return (
    <div className="space-y-2">
      {warnings.map((warning, idx) => (
        <div
          key={idx}
          className="border border-red-200 bg-red-50 text-red-800 rounded-xl p-3 shadow-sm"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-red-600">
            Warning
          </div>
          <p className="text-sm leading-relaxed">{warning}</p>
        </div>
      ))}
    </div>
  );
};

export default Warnings;
