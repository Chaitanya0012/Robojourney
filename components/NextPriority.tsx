import React from "react";

type Props = {
  nextPriority?: string;
};

const NextPriority: React.FC<Props> = ({ nextPriority }) => {
  if (!nextPriority) return null;
  return (
    <div className="border border-indigo-200 bg-indigo-50 text-indigo-800 rounded-xl p-3 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
        Next Priority
      </div>
      <p className="text-base font-semibold mt-1">{nextPriority}</p>
    </div>
  );
};

export default NextPriority;
