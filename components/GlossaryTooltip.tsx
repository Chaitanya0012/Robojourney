"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import React from "react";
import { findGlossaryMatches, type GlossaryEntry } from "../lib/glossary";

export function GlossaryTooltip({ text }: { text: string }) {
  const matches = findGlossaryMatches(text);
  if (!matches.length) return <>{text}</>;

  const pieces = splitWithTerms(text, matches);

  return (
    <Tooltip.Provider delayDuration={150}>
      {pieces.map((piece, idx) =>
        piece.entry ? (
          <Tooltip.Root key={`${piece.entry.term}-${idx}`}>
            <Tooltip.Trigger asChild>
              <span className="glossary-term cursor-help underline decoration-dotted decoration-indigo-400">
                {piece.text}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content className="rounded bg-slate-900 p-2 text-xs text-white shadow">
              <div className="font-semibold">{piece.entry.term}</div>
              <div>{piece.entry.definition}</div>
            </Tooltip.Content>
          </Tooltip.Root>
        ) : (
          <span key={`plain-${idx}`}>{piece.text}</span>
        ),
      )}
    </Tooltip.Provider>
  );
}

function splitWithTerms(text: string, terms: GlossaryEntry[]) {
  const lower = text.toLowerCase();
  const result: Array<{ text: string; entry?: GlossaryEntry }> = [];
  let cursor = 0;
  const sortedTerms = [...terms].sort((a, b) => lower.indexOf(a.term) - lower.indexOf(b.term));

  for (const entry of sortedTerms) {
    const idx = lower.indexOf(entry.term.toLowerCase(), cursor);
    if (idx === -1) continue;
    if (idx > cursor) result.push({ text: text.slice(cursor, idx) });
    result.push({ text: text.slice(idx, idx + entry.term.length), entry });
    cursor = idx + entry.term.length;
  }
  if (cursor < text.length) result.push({ text: text.slice(cursor) });
  return result;
}
