"use client";

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Warnings } from "./Warnings";
import { BestPractices } from "./BestPractices";
import { NextPriority } from "./NextPriority";
import { ProjectPlan } from "./ProjectPlan";
import { MemoryDebug } from "./MemoryDebug";

export type Guidance = {
  warnings?: string[];
  best_practices?: string[];
  meta_cognition_prompts?: string[];
  next_priority?: string;
};

export type PlanStep = {
  title: string;
  description?: string;
  prerequisites?: string[];
  resources?: string[];
};

export type NavigatorResponse = {
  mode: string;
  message: string;
  questions?: string[];
  analysis?: Record<string, unknown>;
  plan?: PlanStep[];
  guidance?: Guidance;
  recalled_memory?: { text: string; score?: number }[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  data?: NavigatorResponse;
};

interface ChatUIProps {
  projectId: string;
  initialPlan?: PlanStep[];
  onNavigatorData?: (data: NavigatorResponse) => void;
}

export const ChatUI: React.FC<ChatUIProps> = ({
  projectId,
  initialPlan,
  onNavigatorData,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState<Guidance | undefined>();
  const [plan, setPlan] = useState<PlanStep[]>(initialPlan ?? []);
  const [recalledMemory, setRecalledMemory] = useState<
    { text: string; score?: number }[]
  >([]);

  const assistantCard = useMemo(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    return lastAssistant?.data;
  }, [messages]);

  useEffect(() => {
    if (initialPlan && initialPlan.length) {
      setPlan(initialPlan);
    }
  }, [initialPlan]);

  const handleNavigatorData = useCallback(
    (data: NavigatorResponse) => {
      if (data.guidance) {
        setGuidance(data.guidance);
      }
      if (data.plan && data.plan.length) {
        setPlan(data.plan);
      }
      if (data.recalled_memory) {
        setRecalledMemory(data.recalled_memory);
      }
      onNavigatorData?.(data);
    },
    [onNavigatorData]
  );

  const sendMessage = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!input.trim()) return;
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: input.trim(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch("/api/navigator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userMessage: userMessage.content,
            projectId,
            mode: assistantCard?.mode ?? "live_guidance",
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          const errorMessage = `Navigator error: ${errorText}`;
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: errorMessage,
            },
          ]);
          setLoading(false);
          return;
        }

        const data: NavigatorResponse = await response.json();
        handleNavigatorData(data);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.message,
            data,
          },
        ]);
      } catch (error) {
        const fallback =
          error instanceof Error ? error.message : "Unknown error occurred";
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Failed to contact navigator: ${fallback}`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [assistantCard?.mode, handleNavigatorData, input, projectId]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Robotics AI Navigator
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ask for guidance, code reviews, simulator checks, or research.
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
              <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
              Thinking...
            </div>
          )}
        </div>

        <div className="max-h-[480px] space-y-3 overflow-y-auto px-4 py-3">
          {messages.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              Start the conversation by sharing your robotics goal or asking for a plan.
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 rounded-xl border px-3 py-3 shadow-sm transition dark:border-slate-800 ${
                msg.role === "assistant"
                  ? "border-emerald-100 bg-emerald-50/60 dark:bg-emerald-900/20"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
              }`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-semibold text-white shadow">
                {msg.role === "assistant" ? "AI" : msg.role === "tool" ? "Tool" : "You"}
              </div>
              <div className="flex-1 space-y-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.data?.guidance?.warnings && msg.data.guidance.warnings.length > 0 && (
                  <Warnings warnings={msg.data.guidance.warnings} />
                )}
                {msg.data?.guidance?.best_practices &&
                  msg.data.guidance.best_practices.length > 0 && (
                    <BestPractices bestPractices={msg.data.guidance.best_practices} />
                  )}
                {msg.data?.guidance?.next_priority && (
                  <NextPriority nextPriority={msg.data.guidance.next_priority} />
                )}
                {msg.data?.plan && msg.data.plan.length > 0 && (
                  <ProjectPlan plan={msg.data.plan} />
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sensors, simulators, control loops, or share your progress..."
              className="min-h-[56px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {guidance?.warnings && guidance.warnings.length > 0 && (
        <Warnings warnings={guidance.warnings} />
      )}

      {guidance?.best_practices && guidance.best_practices.length > 0 && (
        <BestPractices bestPractices={guidance.best_practices} />
      )}

      {guidance?.next_priority && (
        <NextPriority nextPriority={guidance.next_priority} />
      )}

      {plan.length > 0 && <ProjectPlan plan={plan} />}

      {recalledMemory.length > 0 && <MemoryDebug memories={recalledMemory} />}
    </div>
  );
};

export default ChatUI;
