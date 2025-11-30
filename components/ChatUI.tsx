'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Warnings } from './Warnings';
import { BestPractices } from './BestPractices';
import { NextPriority } from './NextPriority';
import { cn } from '../src/lib/utils';

type Guidance = {
  warnings?: string[];
  best_practices?: string[];
  meta_cognition_prompts?: string[];
  next_priority?: string;
};

export type NavigatorMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  createdAt?: string;
};

interface ChatUIProps {
  messages: NavigatorMessage[];
  loading?: boolean;
  onSend: (text: string) => Promise<void>;
  heading?: string;
}

const formatTime = (timestamp?: string) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const parseAssistantPayload = (content: string) => {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      const { message, guidance } = parsed as { message?: string; guidance?: Guidance };
      return {
        raw: parsed,
        displayMessage: message ?? content,
        guidance,
      };
    }
  } catch (err) {
    // swallow parsing errors and fallback to raw content
  }
  return { raw: content, displayMessage: content, guidance: undefined as Guidance | undefined };
};

export const ChatUI: React.FC<ChatUIProps> = ({ messages, onSend, loading, heading }) => {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const combinedLoading = loading || sending;

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await onSend(trimmed);
      setInput('');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const decoratedMessages = useMemo(() =>
    messages.map((msg) => ({
      ...msg,
      parsed: msg.role === 'assistant' ? parseAssistantPayload(msg.content) : undefined,
    })), [messages]);

  return (
    <div className="flex flex-col h-full bg-slate-950/40 border border-slate-800 rounded-xl shadow-lg">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 rounded-t-xl">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Robotics AI Navigator</p>
          <h2 className="text-lg font-semibold text-white">{heading ?? 'Project Chat'}</h2>
        </div>
        {combinedLoading && <div className="text-xs text-emerald-300 animate-pulse">Thinking…</div>}
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-900">
        {decoratedMessages.map((msg) => (
          <div key={msg.id} className={cn('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}>
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 capitalize">{msg.role}</span>
              {msg.createdAt && <span>{formatTime(msg.createdAt)}</span>}
            </div>
            <div className={cn(
              'max-w-2xl rounded-2xl px-4 py-3 shadow',
              msg.role === 'user'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-slate-800/80 text-slate-100 border border-slate-700',
            )}>
              {msg.role === 'assistant' && msg.parsed ? (
                <div className="space-y-3">
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.parsed.displayMessage}</p>
                  {msg.parsed.guidance?.warnings && msg.parsed.guidance.warnings.length > 0 && (
                    <Warnings warnings={msg.parsed.guidance.warnings} />
                  )}
                  {msg.parsed.guidance?.best_practices && msg.parsed.guidance.best_practices.length > 0 && (
                    <BestPractices bestPractices={msg.parsed.guidance.best_practices} />
                  )}
                  {msg.parsed.guidance?.next_priority && (
                    <NextPriority nextPriority={msg.parsed.guidance.next_priority} />
                  )}
                  {msg.parsed.guidance?.meta_cognition_prompts && msg.parsed.guidance.meta_cognition_prompts.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Meta-Cognition Prompts</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-200">
                        {msg.parsed.guidance.meta_cognition_prompts.map((prompt, idx) => (
                          <li key={idx} className="text-slate-100/90">{prompt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {combinedLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span>Navigator is thinking…</span>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 bg-slate-900/80 rounded-b-xl p-4">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for guidance, share progress, or request code snippets…"
            className="flex-1 h-24 resize-none rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={combinedLoading || !input.trim()}
            className="self-end h-12 px-4 rounded-xl bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {combinedLoading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

