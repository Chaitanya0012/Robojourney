"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { NavigatorModel } from "../lib/openaiClient";

export type PersonalizationState = {
  recommended_articles: { id: string; reason?: string }[];
  recommended_quizzes: { id: string; reason?: string }[];
  next_step: { type: string; id: string } | null;
};

export type LayoutToggles = {
  showRecommendations: boolean;
  showPath: boolean;
  showChat: boolean;
  openSimulator?: boolean;
  showFeedback?: boolean;
};

type NavigationContextValue = {
  personalization: PersonalizationState;
  layout: LayoutToggles;
  learningPath: string[];
  lastNavigatorMessage: string;
  currentRoute: string;
  applyNavigatorOutput: (output: NavigatorModel) => void;
  navigate: (target: string) => void;
};

const defaultPersonalization: PersonalizationState = {
  recommended_articles: [],
  recommended_quizzes: [],
  next_step: null,
};

const defaultLayout: LayoutToggles = {
  showRecommendations: true,
  showPath: true,
  showChat: true,
  openSimulator: false,
  showFeedback: false,
};

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export const NavigationOrchestratorProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [personalization, setPersonalization] = useState<PersonalizationState>(defaultPersonalization);
  const [layout, setLayout] = useState<LayoutToggles>(defaultLayout);
  const [learningPath, setLearningPath] = useState<string[]>([]);
  const [lastNavigatorMessage, setLastNavigatorMessage] = useState<string>(
    "Hello! I can steer you through articles, quizzes, and the simulator.",
  );

  const navigate = useCallback(
    (target: string) => {
      if (!target) return;
      router.push(target);
    },
    [router],
  );

  const applyNavigatorOutput = useCallback(
    (output: NavigatorModel) => {
      if (output.message) setLastNavigatorMessage(output.message);

      if (output.personalization) {
        setPersonalization({
          recommended_articles: output.personalization.recommended_articles || [],
          recommended_quizzes: output.personalization.recommended_quizzes || [],
          next_step: output.personalization.next_step || null,
        });
      }

      if (output.path_update?.path) {
        setLearningPath(output.path_update.path);
      }

      if (output.ui_action === "NAVIGATE" && output.ui_payload && "target" in output.ui_payload) {
        const target = String(output.ui_payload.target);
        navigate(target);
      }

      if (output.ui_action === "UPDATE_PATH" && output.ui_payload && "path" in output.ui_payload) {
        const nextPath = Array.isArray(output.ui_payload.path)
          ? (output.ui_payload.path as string[])
          : [];
        setLearningPath(nextPath);
      }

      if (output.ui_action === "UPDATE_LAYOUT" && output.ui_payload) {
        setLayout((prev) => ({
          ...prev,
          ...(output.ui_payload as Partial<LayoutToggles>),
        }));
      }

      if (output.ui_action === "OPEN_SIMULATOR") {
        setLayout((prev) => ({ ...prev, openSimulator: true }));
        navigate("/simulator");
      }

      if (output.ui_action === "SHOW_FEEDBACK") {
        setLayout((prev) => ({ ...prev, showFeedback: true }));
      }
    },
    [navigate],
  );

  const value = useMemo<NavigationContextValue>(
    () => ({ personalization, layout, learningPath, lastNavigatorMessage, currentRoute: pathname, applyNavigatorOutput, navigate }),
    [personalization, layout, learningPath, lastNavigatorMessage, pathname, applyNavigatorOutput, navigate],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export const NavigationOrchestrator = ({ children }: { children: React.ReactNode }) => (
  <NavigationOrchestratorProvider>{children}</NavigationOrchestratorProvider>
);

export const useNavigationOrchestrator = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useNavigationOrchestrator must be used within NavigationOrchestratorProvider");
  }
  return ctx;
};
