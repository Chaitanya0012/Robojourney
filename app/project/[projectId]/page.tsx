"use client";

import { useState } from "react";
import ChatUI, { ChatMessage } from "../../../components/ChatUI";
import { PlanStep } from "../../../components/ProjectPlan";
import Warnings from "../../../components/Warnings";
import BestPractices from "../../../components/BestPractices";
import NextPriority from "../../../components/NextPriority";
import MemoryDebug from "../../../components/MemoryDebug";

type NavigatorGuidance = {
  warnings?: string[];
  best_practices?: string[];
  meta_cognition_prompts?: string[];
  next_priority?: string;
};

type NavigatorResponse = {
  mode?: string;
  message?: string;
  questions?: string[];
  analysis?: Record<string, unknown>;
  plan?: PlanStep[];
  guidance?: NavigatorGuidance;
  memory?: string[];
};

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [guidance, setGuidance] = useState<NavigatorGuidance | undefined>();
  const [recalledMemory, setRecalledMemory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    try {
      const res = await fetch("/api/navigator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: trimmed,
          projectId: params.projectId,
          mode: guidance?.mode ?? undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Navigator error: ${res.status}`);
      }

      const data: NavigatorResponse = await res.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message ?? "",
        response: data,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setPlan(data.plan ?? []);
      setGuidance(data.guidance);
      setRecalledMemory(data.memory ?? []);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          error instanceof Error
            ? `Error: ${error.message}`
            : "Navigator failed to respond.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-blue-600">
              Project ID
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              Robotics Workspace – {params.projectId}
            </h1>
            <p className="text-sm text-gray-600">
              Converse with the AI navigator, explore recommendations, and track
              your roadmap.
            </p>
          </div>
          {guidance?.next_priority ? (
            <div className="hidden md:block w-64">
              <NextPriority nextPriority={guidance.next_priority} />
            </div>
          ) : null}
        </div>

        <ChatUI
          messages={messages}
          onSend={sendMessage}
          loading={loading}
          plan={plan}
          guidance={guidance}
          recalledMemory={recalledMemory}
        />

        {guidance?.warnings?.length ? (
          <Warnings warnings={guidance.warnings} />
        ) : null}

        {guidance?.best_practices?.length ? (
          <BestPractices bestPractices={guidance.best_practices} />
        ) : null}

        {recalledMemory.length ? <MemoryDebug memories={recalledMemory} /> : null}
      </div>
    </div>
  );
}
