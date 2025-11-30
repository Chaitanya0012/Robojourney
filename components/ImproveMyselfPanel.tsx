"use client";

import React from "react";
import type { MistakeTag } from "../lib/quizzes";

const suggestions: Record<MistakeTag, string> = {
  conceptual_gap: "Review the related micro-lesson and try drawing it out.",
  careless_mistake: "Slow down and re-read the question before choosing.",
  misread_question: "Highlight the key words like NOT or ALWAYS.",
  skill_flow_problem: "Break the task into tiny steps and check each one.",
  procedural_error: "List the steps and tick them off while you work.",
  hardware_misinterpretation: "Match each component to its job with labels or sketches.",
};

type Props = {
  recentMistakes: MistakeTag[];
};

export function ImproveMyselfPanel({ recentMistakes }: Props) {
  if (!recentMistakes.length) return null;
  return (
    <div className="rounded-md border bg-orange-50 p-3 text-sm">
      <div className="font-semibold">Improve Myself</div>
      <ul className="mt-2 space-y-1">
        {recentMistakes.map((tag) => (
          <li key={tag} className="flex items-start gap-2">
            <span className="text-orange-500">★</span>
            <span>{suggestions[tag]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
