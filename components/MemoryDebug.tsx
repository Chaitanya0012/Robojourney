import React from "react";

type Props = {
  memories?: string[];
};

const MemoryDebug: React.FC<Props> = ({ memories = [] }) => {
  if (!memories.length) return null;
  return (
    <div className="bg-gray-900 text-gray-100 rounded-xl p-3 border border-gray-800 shadow-inner">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
        Recalled Memory (debug)
      </div>
      <ul className="space-y-2 text-sm">
        {memories.map((chunk, idx) => (
          <li key={idx} className="bg-gray-800/60 rounded-lg p-2 border border-gray-700">
            {chunk}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemoryDebug;
