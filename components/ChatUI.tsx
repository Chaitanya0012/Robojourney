"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Warnings from "./Warnings";
import BestPractices from "./BestPractices";
import NextPriority from "./NextPriority";
import ProjectPlan, { PlanStep } from "./ProjectPlan";
import MemoryDebug from "./MemoryDebug";

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

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  response?: NavigatorResponse;
};

interface ChatUIProps {
  messages: ChatMessage[];
  onSend: (message: string) => Promise<void> | void;
  loading?: boolean;
  plan?: PlanStep[];
  guidance?: NavigatorGuidance;
  recalledMemory?: string[];
}

const ChatUI: React.FC<ChatUIProps> = ({
  messages,
  onSend,
  loading,
  plan,
  guidance,
  recalledMemory,
}) => {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  const metaPrompts = useMemo(
    () => guidance?.meta_cognition_prompts?.filter(Boolean) ?? [],
    [guidance]
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="bg-white/5 border border-gray-200/30 rounded-xl shadow-sm flex flex-col h-[70vh] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200/40 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-semibold text-gray-900">AI Project Navigator</h2>
          <p className="text-sm text-gray-500">
            Chat live with the robotics mentor. JSON messages render as cards for
            clarity.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-3xl w-full rounded-2xl px-4 py-3 shadow-sm border ${
                  message.role === "assistant"
                    ? "bg-blue-50/60 border-blue-100"
                    : "bg-gray-900 text-white border-gray-800"
                }`}
              >
                <div className="text-xs font-medium uppercase tracking-wide mb-1 text-gray-500">
                  {message.role === "assistant" ? "Assistant" : "You"}
                </div>
                <div className="whitespace-pre-wrap text-sm">
                  {message.response?.message ?? message.content}
                </div>

                {message.response?.questions?.length ? (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Questions
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {message.response.questions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {message.response?.analysis ? (
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                      Analysis
                    </div>
                    <pre className="bg-white/70 border border-gray-200 rounded-lg p-3 text-xs text-gray-800 overflow-x-auto">
                      {JSON.stringify(message.response.analysis, null, 2)}
                    </pre>
                  </div>
                ) : null}

                {message.response?.guidance?.warnings?.length ? (
                  <div className="mt-3">
                    <Warnings warnings={message.response.guidance.warnings} />
                  </div>
                ) : null}

                {message.response?.guidance?.best_practices?.length ? (
                  <div className="mt-3">
                    <BestPractices
                      bestPractices={message.response.guidance.best_practices}
                    />
                  </div>
                ) : null}

                {message.response?.guidance?.next_priority ? (
                  <div className="mt-3">
                    <NextPriority
                      nextPriority={message.response.guidance.next_priority}
                    />
                  </div>
                ) : null}

                {message.response?.plan?.length ? (
                  <div className="mt-3">
                    <ProjectPlan plan={message.response.plan} />
                  </div>
                ) : null}

                {message.response?.memory?.length ? (
                  <div className="mt-3">
                    <MemoryDebug memories={message.response.memory} />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {loading ? (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-blue-50/60 border border-blue-100 px-4 py-3 rounded-2xl text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-300" />
                <span className="font-medium">Navigator is thinking...</span>
              </div>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
        <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <textarea
              className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your robotics project, e.g., PID tuning for a line follower"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
          {metaPrompts.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {metaPrompts.map((prompt, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded-lg"
                >
                  {prompt}
                </span>
              ))}
            </div>
          ) : null}
        </form>
      </div>

      {guidance?.warnings?.length ? (
        <Warnings warnings={guidance.warnings} />
      ) : null}

      {guidance?.best_practices?.length ? (
        <BestPractices bestPractices={guidance.best_practices} />
      ) : null}

      {guidance?.next_priority ? (
        <NextPriority nextPriority={guidance.next_priority} />
      ) : null}

      {plan?.length ? <ProjectPlan plan={plan} /> : null}

      {recalledMemory?.length ? <MemoryDebug memories={recalledMemory} /> : null}
    </div>
  );
};

export default ChatUI;
