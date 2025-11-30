import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Question {
  id: string;
  prompt: string;
  expected_answer_type: 'free_text' | 'scale_1_5' | 'multi_choice' | 'yes_no';
  options: string[];
  dimension: 'concepts' | 'tools' | 'planning' | 'debugging' | 'confidence';
}

export interface Proficiency {
  concepts: number;
  tools: number;
  planning: number;
  debugging: number;
  confidence: number;
}

export interface Analysis {
  proficiency: Proficiency;
  risk_areas: string[];
  missing_prerequisites: string[];
  summary: string;
}

export interface Resource {
  type: 'doc' | 'video' | 'article' | 'example';
  title: string;
  url: string;
  note: string;
}

export interface PlanStep {
  step_id: string;
  title: string;
  description: string;
  estimated_minutes: number;
  difficulty: number;
  prerequisites: string[];
  resources: Resource[];
}

export interface Warning {
  description: string;
  consequence: string;
  when_relevant: string;
}

export interface Guidance {
  warnings: Warning[];
  best_practices: string[];
  meta_cognition_prompts: string[];
  next_priority: string;
}

export interface NavigatorResponse {
  mode: 'assessment_questions' | 'assessment_feedback' | 'project_plan' | 'live_guidance';
  message: string;
  questions: Question[];
  analysis: Analysis | null;
  plan: PlanStep[];
  guidance: Guidance | null;
  error?: string;
}

export interface ConversationEntry {
  role: 'user' | 'navigator';
  content: string;
  timestamp: number;
}

export function useProjectNavigator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<NavigatorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [currentMode, setCurrentMode] = useState<string>('assessment_questions');

  const sendMessage = useCallback(async (message: string) => {
    if (!user) {
      setError('Please sign in to use the Project Navigator');
      return null;
    }

    setIsLoading(true);
    setError(null);

    // Add user message to history
    const newHistory: ConversationEntry[] = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: Date.now() }
    ];
    setConversationHistory(newHistory);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('project-navigator', {
        body: {
          projectDescription: projectDescription || message,
          userAnswers,
          currentMode,
          conversationHistory: newHistory,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const navResponse = data as NavigatorResponse;
      setResponse(navResponse);
      setCurrentMode(navResponse.mode);

      // Add navigator response to history
      setConversationHistory(prev => [
        ...prev,
        { role: 'navigator', content: navResponse.message, timestamp: Date.now() }
      ]);

      // Update project description if this was the first message
      if (!projectDescription && message) {
        setProjectDescription(message);
      }

      return navResponse;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get guidance';
      setError(errorMessage);
      toast({
        title: 'Navigator Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, projectDescription, userAnswers, currentMode, conversationHistory]);

  const submitAnswers = useCallback(async (answers: Record<string, string>) => {
    setUserAnswers(prev => ({ ...prev, ...answers }));
    
    // Format answers as a message
    const answerSummary = Object.entries(answers)
      .map(([id, answer]) => `${id}: ${answer}`)
      .join('\n');
    
    return sendMessage(`My answers:\n${answerSummary}`);
  }, [sendMessage]);

  const startNewProject = useCallback(() => {
    setResponse(null);
    setError(null);
    setProjectDescription('');
    setUserAnswers({});
    setConversationHistory([]);
    setCurrentMode('assessment_questions');
  }, []);

  return {
    sendMessage,
    submitAnswers,
    startNewProject,
    response,
    isLoading,
    error,
    currentMode,
    conversationHistory,
    projectDescription,
  };
}
