"use client";

import React, { useEffect, useState } from "react";
import ChatUI, { Guidance, NavigatorResponse, PlanStep } from "../../../components/ChatUI";
import { Warnings } from "../../../components/Warnings";
import { BestPractices } from "../../../components/BestPractices";
import { NextPriority } from "../../../components/NextPriority";
import { ProjectPlan } from "../../../components/ProjectPlan";
import { MemoryDebug } from "../../../components/MemoryDebug";

type PageProps = {
  params: {
    projectId: string;
  };
};

const ProjectPage: React.FC<PageProps> = ({ params }) => {
  const { projectId } = params;
  const [initialPlan, setInitialPlan] = useState<PlanStep[]>([]);
  const [guidance, setGuidance] = useState<Guidance | undefined>();
  const [recalledMemory, setRecalledMemory] = useState<
    { text: string; score?: number }[]
  >([]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await fetch("/api/navigator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userMessage: "Init plan",
            projectId,
            mode: "project_plan",
          }),
        });
        if (!response.ok) return;
        const data: NavigatorResponse = await response.json();
        if (data.plan) {
          setInitialPlan(data.plan);
        }
        if (data.guidance) {
          setGuidance(data.guidance);
        }
        if (data.recalled_memory) {
          setRecalledMemory(data.recalled_memory);
        }
      } catch (error) {
        console.error("Failed to fetch initial plan", error);
      }
    };

    bootstrap();
  }, [projectId]);

  const handleNavigatorData = (data: NavigatorResponse) => {
    if (data.guidance) {
      setGuidance(data.guidance);
    }
    if (data.recalled_memory) {
      setRecalledMemory(data.recalled_memory);
    }
    if (data.plan) {
      setInitialPlan(data.plan);
    }
  };

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Navigator</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Project ID: <span className="font-mono">{projectId}</span>
        </p>
      </header>

      <ChatUI
        projectId={projectId}
        initialPlan={initialPlan}
        onNavigatorData={handleNavigatorData}
      />

      {guidance?.warnings && guidance.warnings.length > 0 && (
        <Warnings warnings={guidance.warnings} />
      )}

      {guidance?.best_practices && guidance.best_practices.length > 0 && (
        <BestPractices bestPractices={guidance.best_practices} />
      )}

      {guidance?.next_priority && (
        <NextPriority nextPriority={guidance.next_priority} />
      )}

      {initialPlan.length > 0 && <ProjectPlan plan={initialPlan} />}

      {recalledMemory.length > 0 && <MemoryDebug memories={recalledMemory} />}
    </main>
  );
};

export default ProjectPage;
