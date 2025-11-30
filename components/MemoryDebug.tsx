'use client';

import React from 'react';

export type MemoryChunk = {
  id: string;
  content: string;
  score?: number;
  created_at?: string;
};

interface MemoryDebugProps {
  memories: MemoryChunk[];
  title?: string;
}

export const MemoryDebug: React.FC<MemoryDebugProps> = ({ memories, title }) => {
  if (!memories || memories.length === 0) return null;

  return (
    <div className="border border-amber-500/40 bg-amber-900/20 text-amber-50 rounded-xl p-4 space-y-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-amber-200">{title ?? 'Recalled Memory'}</p>
        <p className="text-sm text-amber-100/80">Debug view of RAG context</p>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {memories.map((chunk) => (
          <div key={chunk.id} className="bg-slate-950/40 border border-amber-500/20 rounded-lg p-3 shadow-inner">
            <div className="flex justify-between text-xs text-amber-200/80 mb-1">
              <span>{chunk.id}</span>
              {chunk.score !== undefined && <span>score: {chunk.score.toFixed(3)}</span>}
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{chunk.content}</p>
            {chunk.created_at && (
              <p className="text-[10px] text-amber-300/80 mt-1">{new Date(chunk.created_at).toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

