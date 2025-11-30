"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProgressMap, ProgressEntry } from "../components/ProgressMap";
import { XPBar } from "../components/XPBar";
import { articles, curriculumNodes } from "../lib/articles";
import { useNavigationOrchestrator } from "../components/NavigationOrchestrator";

export default function LandingPage() {
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

  const recommendedArticle = useMemo(() => {
    const navPick = personalization.recommended_articles?.[0]?.id;
    if (navPick) return articles.find((a) => a.id === navPick) ?? null;
    const firstIncomplete = curriculumNodes.find((id) => !learningPath.includes(id));
    return articles.find((a) => a.id === firstIncomplete) ?? null;
  }, [learningPath, personalization.recommended_articles]);

  return (
    <div className="space-y-8">
      <div className="glass-panel rounded-3xl p-10 shadow-2xl md:p-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-14">
          <div className="flex-1 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">Robotics Learning OS</p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              <span className="text-gradient">Navigator-powered homepage</span>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              The AI Navigator keeps your progress map, XP, and recommendations in sync. Jump into the next node or
              ask for a different pace.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-glow-cyan transition hover:scale-105 hover:bg-indigo-400"
              >
                Continue learning
              </Link>
              <Link
                href="/simulator"
                className="rounded-full border border-indigo-300/40 px-6 py-3 text-sm font-semibold text-indigo-100 transition hover:border-indigo-200 hover:bg-indigo-200/10"
              >
                Open simulator
              </Link>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <XPBar />
            <div className="rounded-2xl border border-border/40 bg-slate-900/60 p-4 shadow-card-hover">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Progress map</p>
              <ProgressMap progress={progress} />
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel rounded-2xl border border-border/40 p-6 shadow-card-hover">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Recommended next article</p>
          {recommendedArticle ? (
            <div className="mt-3 space-y-2">
              <h2 className="text-2xl font-semibold text-gradient">{recommendedArticle.title}</h2>
              <p className="text-muted-foreground">{recommendedArticle.summary}</p>
              <Link
                href={`/learn/${recommendedArticle.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/30"
              >
                Read now
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-muted-foreground">Navigator will select something for you shortly.</p>
          )}
        </div>

        <div className="glass-panel rounded-2xl border border-border/40 p-6 shadow-card-hover">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">XP summary</p>
          <p className="mt-2 text-muted-foreground">
            Your XP bar reflects quiz performance, spaced repetition, and simulator practice. Each completed node unlocks the next
            glowing stop on the path.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-glow-cyan hover:bg-indigo-400"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
