"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ImproveMyselfPanel } from "../../components/ImproveMyselfPanel";
import { ProgressMap, ProgressEntry } from "../../components/ProgressMap";
import { XPBar } from "../../components/XPBar";
import { articles, curriculumNodes } from "../../lib/articles";
import { quizzes } from "../../lib/quizzes";
import { useNavigationOrchestrator } from "../../components/NavigationOrchestrator";

export default function DashboardPage() {
  const { personalization, learningPath } = useNavigationOrchestrator();
  const [progress] = useState<Record<string, ProgressEntry>>(() => {
    const base: Record<string, ProgressEntry> = {};
    curriculumNodes.forEach((id, idx) => {
      base[id] = {
        nodeId: id,
        completed: learningPath.includes(id),
        locked: idx !== 0 && !learningPath.includes(curriculumNodes[idx - 1]),
      };
    });
    return base;
  });

  const recommendedArticles = useMemo(() => {
    const ids = personalization.recommended_articles?.map((a) => a.id) ?? [];
    const fallbacks = curriculumNodes.filter((id) => !learningPath.includes(id)).slice(0, 3);
    return ids.concat(fallbacks).map((id) => articles.find((a) => a.id === id)).filter(Boolean);
  }, [learningPath, personalization.recommended_articles]);

  const recommendedQuizzes = useMemo(() => {
    const ids = personalization.recommended_quizzes?.map((q) => q.id) ?? [];
    const fallbacks = quizzes.slice(0, 3).map((q) => q.id);
    return ids.concat(fallbacks).map((id) => quizzes.find((q) => q.id === id)).filter(Boolean);
  }, [personalization.recommended_quizzes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Dashboard</p>
          <h1 className="text-3xl font-bold text-gradient">AI Navigator hub</h1>
          <p className="text-muted-foreground">Progress map, XP, simulator access, and Navigator-driven recommendations.</p>
        </div>
        <Link
          href="/simulator"
          className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-glow-cyan hover:bg-cyan-400"
        >
          Launch simulator
        </Link>
      </div>

      <XPBar />

      <div className="rounded-2xl border border-border/40 bg-slate-900/60 p-4 shadow-card-hover">
        <div className="flex items-center justify-between">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Progress map</p>
          <Link href="/" className="text-xs text-indigo-200 underline">
            Home
          </Link>
        </div>
        <div className="mt-3">
          <ProgressMap progress={progress} />
        </div>
      </div>

      <ImproveMyselfPanel />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel rounded-2xl border border-border/40 p-6 shadow-card-hover">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Recommended articles</p>
          </div>
          <div className="mt-3 space-y-3">
            {recommendedArticles.map((article) => (
              <div key={article!.id} className="rounded-xl border border-border/30 bg-slate-900/40 p-4">
                <h3 className="text-lg font-semibold text-gradient">{article!.title}</h3>
                <p className="text-sm text-muted-foreground">{article!.summary}</p>
                <Link
                  href={`/learn/${article!.id}`}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100"
                >
                  Read article →
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-border/40 p-6 shadow-card-hover">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Recommended quizzes</p>
          <div className="mt-3 space-y-3">
            {recommendedQuizzes.map((quiz) => (
              <div key={quiz!.id} className="rounded-xl border border-border/30 bg-slate-900/40 p-4">
                <h3 className="text-lg font-semibold text-gradient">{quiz!.title}</h3>
                <p className="text-sm text-muted-foreground">{quiz!.summary}</p>
                <Link
                  href={`/quiz/${quiz!.id}`}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100"
                >
                  Take quiz →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
