'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChatUI, NavigatorMessage } from '../../../components/ChatUI';
import { Warnings } from '../../../components/Warnings';
import { BestPractices } from '../../../components/BestPractices';
import { NextPriority } from '../../../components/NextPriority';
import { ProjectPlan, PlanStep } from '../../../components/ProjectPlan';
import { MemoryDebug, MemoryChunk } from '../../../components/MemoryDebug';
import { nanoid } from 'nanoid';

type Guidance = {
  warnings?: string[];
  best_practices?: string[];
  meta_cognition_prompts?: string[];
  next_priority?: string;
};

type NavigatorResponse = {
  mode?: string;
  message: string;
  plan?: PlanStep[];
  guidance?: Guidance;
  analysis?: Record<string, unknown>;
  questions?: string[];
  memories?: MemoryChunk[];
};

const useNavigator = (projectId: string) => {
  const [messages, setMessages] = useState<NavigatorMessage[]>([{
    id: nanoid(),
    role: 'assistant',
    content: JSON.stringify({
      mode: 'assessment_questions',
      message: 'Share your project goals, hardware, and constraints so I can tailor the plan.',
      questions: [
        'What robot are you building (line follower, arm, obstacle avoider, manipulator)?',
        'Which controllers and sensors are available (Arduino, ESP32, motors, encoders, IMU, LiDAR)?',
      ],
      guidance: {
        next_priority: 'Describe your hardware stack and target behavior.',
      },
    }),
  }]);
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [guidance, setGuidance] = useState<Guidance>({});
  const [memories, setMemories] = useState<MemoryChunk[]>([]);
  const [loading, setLoading] = useState(false);

  const appendMessage = useCallback((msg: NavigatorMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const sendToNavigator = useCallback(async (text: string, mode?: string) => {
    setLoading(true);
    const userMsg: NavigatorMessage = { id: nanoid(), role: 'user', content: text, createdAt: new Date().toISOString() };
    appendMessage(userMsg);

    try {
      const response = await fetch('/api/navigator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: text, projectId, mode }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Navigator request failed');
      }

      const data: NavigatorResponse = await response.json();
      const assistantMsg: NavigatorMessage = {
        id: nanoid(),
        role: 'assistant',
        content: typeof data.message === 'string' ? data.message : JSON.stringify(data.message),
        createdAt: new Date().toISOString(),
      };

      if (data.plan) setPlan(data.plan);
      if (data.guidance) setGuidance(data.guidance);
      if (data.memories) setMemories(data.memories);

      appendMessage(assistantMsg);
    } catch (error) {
      const assistantMsg: NavigatorMessage = {
        id: nanoid(),
        role: 'assistant',
        content: JSON.stringify({
          mode: 'error',
          message: error instanceof Error ? error.message : 'Unknown navigator error',
          guidance: { warnings: ['Navigator failed to respond. Please retry.'] },
        }),
        createdAt: new Date().toISOString(),
      };
      appendMessage(assistantMsg);
    } finally {
      setLoading(false);
    }
  }, [appendMessage, projectId]);

  useEffect(() => {
    // Fetch an initial plan on mount
    sendToNavigator('Initialize project plan', 'project_plan');
  }, [sendToNavigator]);

  return { messages, plan, guidance, memories, loading, sendToNavigator };
};

const ProjectPage: React.FC = () => {
  const params = useParams<{ projectId: string }>();
  const projectId = useMemo(() => params?.projectId ?? 'default', [params]);
  const { messages, plan, guidance, memories, loading, sendToNavigator } = useNavigator(projectId);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Project</p>
            <h1 className="text-3xl font-bold text-white">Navigator for Project {projectId}</h1>
            <p className="text-slate-400 mt-1">Chat with an expert robotics mentor. Plans, warnings, and next steps update live.</p>
          </div>
          {guidance?.next_priority && (
            <div className="max-w-sm">
              <NextPriority nextPriority={guidance.next_priority} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[70vh]">
            <ChatUI messages={messages} onSend={(text) => sendToNavigator(text, 'live_guidance')} loading={loading} />
          </div>
          <div className="space-y-4">
            {guidance?.warnings && guidance.warnings.length > 0 && (
              <Warnings warnings={guidance.warnings} />
            )}
            {guidance?.best_practices && guidance.best_practices.length > 0 && (
              <BestPractices bestPractices={guidance.best_practices} />
            )}
            {guidance?.next_priority && (
              <NextPriority nextPriority={guidance.next_priority} />
            )}
            {plan && plan.length > 0 && (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <ProjectPlan plan={plan} />
              </div>
            )}
            {memories && memories.length > 0 && (
              <MemoryDebug memories={memories} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;

