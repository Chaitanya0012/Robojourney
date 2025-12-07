import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  age?: number | null;
  self_description?: string;
  goal?: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  time_per_day_minutes?: number | null;
  returning_after_days?: number | null;
}

export interface ProgressState {
  completed_items: string[];
  failed_quizzes: Array<{
    quiz_id: string;
    attempts: number;
    last_score: number;
    last_attempt_days_ago: number;
  }>;
  current_skill_estimate: {
    mechanics: number;
    electronics: number;
    programming: number;
    logic: number;
    robot_design: number;
    confidence: number;
  };
  streak_days: number;
  xp: number;
  badges: string[];
  last_active_days_ago: number | null;
}

export interface ContentItem {
  id: string;
  type: 'article' | 'quiz' | 'project' | 'simulation' | 'checkpoint';
  title: string;
  topic: string;
  tags: string[];
  difficulty: number;
  estimated_minutes: number;
  prerequisites: string[];
  follow_ups: string[];
  is_capstone: boolean;
}

export interface PlanStep {
  step_type: string;
  target_id: string | null;
  reason: string;
  expected_duration_minutes: number;
  difficulty: number;
  prerequisites: string[];
}

export interface NavigatorResponse {
  message: string;
  ui_action: 'NAVIGATE' | 'SHOW_PLAN' | 'REVIEW' | 'ASK_CLARIFICATION' | 'IDLE';
  ui_payload: Record<string, unknown>;
  tutor_intent: string;
  plan: PlanStep[];
  skill_update: {
    mechanics: number;
    electronics: number;
    programming: number;
    logic: number;
    robot_design: number;
    confidence: number;
  };
  spaced_repetition: {
    schedule: Array<{
      target_id: string;
      reason: string;
      suggested_interval_days: number;
    }>;
  };
  error?: string;
}

// Default content graph based on existing articles
const DEFAULT_CONTENT_GRAPH: ContentItem[] = [
  { id: 'basic_01', type: 'article', title: 'What is a Robot — Simple Definition', topic: 'fundamentals', tags: ['beginner', 'intro'], difficulty: 1, estimated_minutes: 5, prerequisites: [], follow_ups: ['basic_02'], is_capstone: false },
  { id: 'basic_02', type: 'article', title: 'Voltage, Current, Resistance — The Trio', topic: 'electronics', tags: ['beginner', 'electronics'], difficulty: 1, estimated_minutes: 8, prerequisites: ['basic_01'], follow_ups: ['basic_03'], is_capstone: false },
  { id: 'basic_03', type: 'article', title: 'Analog vs Digital Signals', topic: 'electronics', tags: ['beginner', 'signals'], difficulty: 2, estimated_minutes: 7, prerequisites: ['basic_02'], follow_ups: ['basic_04'], is_capstone: false },
  { id: 'basic_04', type: 'article', title: 'Common Sensors: Ultrasonic, IR, LDR, Touch', topic: 'sensors', tags: ['beginner', 'sensors'], difficulty: 2, estimated_minutes: 10, prerequisites: ['basic_03'], follow_ups: ['basic_05'], is_capstone: false },
  { id: 'basic_05', type: 'article', title: 'Actuators Overview: DC Motors, Servos, Steppers', topic: 'motors', tags: ['beginner', 'motors'], difficulty: 2, estimated_minutes: 10, prerequisites: ['basic_02'], follow_ups: ['basic_06', 'basic_07'], is_capstone: false },
  { id: 'basic_06', type: 'article', title: 'Powering Your Robot Safely', topic: 'power', tags: ['beginner', 'safety'], difficulty: 2, estimated_minutes: 8, prerequisites: ['basic_02'], follow_ups: ['basic_07'], is_capstone: false },
  { id: 'basic_07', type: 'article', title: 'Motor Drivers and H-Bridges', topic: 'motors', tags: ['beginner', 'drivers'], difficulty: 3, estimated_minutes: 12, prerequisites: ['basic_05', 'basic_06'], follow_ups: ['basic_08'], is_capstone: false },
  { id: 'basic_08', type: 'article', title: 'Pulse Width Modulation (PWM) Basics', topic: 'control', tags: ['beginner', 'pwm'], difficulty: 3, estimated_minutes: 10, prerequisites: ['basic_07'], follow_ups: ['basic_09'], is_capstone: false },
  { id: 'basic_09', type: 'article', title: 'Introduction to Microcontrollers (Arduino)', topic: 'programming', tags: ['beginner', 'arduino'], difficulty: 2, estimated_minutes: 12, prerequisites: ['basic_03'], follow_ups: ['basic_10'], is_capstone: false },
  { id: 'basic_10', type: 'article', title: 'Reading Sensors: Debounce & Filtering', topic: 'programming', tags: ['intermediate', 'sensors'], difficulty: 3, estimated_minutes: 10, prerequisites: ['basic_04', 'basic_09'], follow_ups: ['basic_11'], is_capstone: false },
  { id: 'basic_11', type: 'article', title: 'Encoders and Feedback', topic: 'sensors', tags: ['intermediate', 'feedback'], difficulty: 3, estimated_minutes: 12, prerequisites: ['basic_05', 'basic_10'], follow_ups: ['basic_12'], is_capstone: false },
  { id: 'basic_12', type: 'article', title: 'Basic Control Loops — On/Off and Proportional', topic: 'control', tags: ['intermediate', 'control'], difficulty: 3, estimated_minutes: 15, prerequisites: ['basic_11'], follow_ups: ['basic_13'], is_capstone: false },
  { id: 'basic_13', type: 'article', title: 'Introduction to PID', topic: 'control', tags: ['intermediate', 'pid'], difficulty: 4, estimated_minutes: 20, prerequisites: ['basic_12'], follow_ups: ['basic_15'], is_capstone: false },
  { id: 'basic_14', type: 'article', title: 'Sensors Placement & Mechanical Considerations', topic: 'design', tags: ['intermediate', 'mechanical'], difficulty: 3, estimated_minutes: 10, prerequisites: ['basic_04', 'basic_05'], follow_ups: ['basic_19'], is_capstone: false },
  { id: 'basic_15', type: 'article', title: 'Basic Navigation: Line Following', topic: 'navigation', tags: ['intermediate', 'project'], difficulty: 4, estimated_minutes: 18, prerequisites: ['basic_13', 'basic_04'], follow_ups: ['basic_20'], is_capstone: true },
  { id: 'basic_16', type: 'article', title: 'Communication: Serial, I2C, SPI', topic: 'communication', tags: ['intermediate', 'protocols'], difficulty: 3, estimated_minutes: 15, prerequisites: ['basic_09'], follow_ups: [], is_capstone: false },
  { id: 'basic_17', type: 'article', title: 'Safety & Testing Protocols', topic: 'safety', tags: ['beginner', 'safety'], difficulty: 2, estimated_minutes: 8, prerequisites: [], follow_ups: ['basic_18'], is_capstone: false },
  { id: 'basic_18', type: 'article', title: 'Debugging Strategies for Robotics', topic: 'debugging', tags: ['intermediate', 'troubleshooting'], difficulty: 3, estimated_minutes: 12, prerequisites: ['basic_17'], follow_ups: [], is_capstone: false },
  { id: 'basic_19', type: 'article', title: 'Mechanical Prototyping: Fast Iterations', topic: 'design', tags: ['intermediate', 'prototyping'], difficulty: 3, estimated_minutes: 10, prerequisites: ['basic_14'], follow_ups: ['basic_20'], is_capstone: false },
  { id: 'basic_20', type: 'article', title: 'Competition Mindset — Reliability over Complexity', topic: 'competition', tags: ['advanced', 'competition'], difficulty: 4, estimated_minutes: 12, prerequisites: ['basic_15', 'basic_19'], follow_ups: [], is_capstone: true },
];

export function useAINavigator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<NavigatorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getNavigatorGuidance = useCallback(async (
    eventType: string = 'manual_request',
    userMessage?: string
  ) => {
    if (!user) {
      setError('Please sign in to use the AI Navigator');
      return null;
    }

    setIsLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      const fallbackPlan = DEFAULT_CONTENT_GRAPH.slice(0, 3).map((item, index) => ({
        step_type: item.type,
        target_id: item.id,
        reason: index === 0
          ? 'Start with the basics while Supabase is offline'
          : 'Continue the guided path with local recommendations',
        expected_duration_minutes: item.estimated_minutes,
        difficulty: item.difficulty,
        prerequisites: item.prerequisites,
      }));

      const fallbackResponse: NavigatorResponse = {
        message: userMessage?.trim()
          ? `We cannot reach Supabase right now, so here is a local plan based on your request: ${userMessage}`
          : 'Supabase is not configured. Showing a local starter plan.',
        ui_action: 'SHOW_PLAN',
        ui_payload: {},
        tutor_intent: 'plan_created',
        plan: fallbackPlan,
        skill_update: {
          mechanics: 0.1,
          electronics: 0.1,
          programming: 0.1,
          logic: 0.1,
          robot_design: 0.1,
          confidence: 0.1,
        },
        spaced_repetition: {
          schedule: [],
        },
      };

      setResponse(fallbackResponse);
      toast({
        title: 'Running in offline mode',
        description: 'Supabase credentials are missing. Showing a demo learning path instead of failing.',
      });
      setIsLoading(false);
      return fallbackResponse;
    }

    try {
      // Fetch user profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch XP data
      const { data: xpData } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch quiz attempts for progress
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch streak data
      const { data: streakData } = await supabase
        .from('quiz_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      // Build user profile
      const userProfile: UserProfile = {
        id: user.id,
        age: null,
        self_description: profileData?.project_description || '',
        goal: 'learn basics',
        experience_level: (profileData?.level || 1) <= 3 ? 'beginner' : (profileData?.level || 1) <= 7 ? 'intermediate' : 'advanced',
        time_per_day_minutes: 30,
        returning_after_days: null,
      };

      // Calculate completed items and failed quizzes
      const completedItems: string[] = [];
      const failedQuizzes: Array<{quiz_id: string; attempts: number; last_score: number; last_attempt_days_ago: number}> = [];
      
      if (quizAttempts) {
        const quizGroups = quizAttempts.reduce((acc, attempt) => {
          if (!acc[attempt.question_id]) {
            acc[attempt.question_id] = [];
          }
          acc[attempt.question_id].push(attempt);
          return acc;
        }, {} as Record<string, typeof quizAttempts>);

        Object.entries(quizGroups).forEach(([questionId, attempts]) => {
          const correct = attempts.filter(a => a.is_correct).length;
          const total = attempts.length;
          const score = total > 0 ? correct / total : 0;
          
          if (score >= 0.6) {
            completedItems.push(`quiz:${questionId}`);
          } else {
            const lastAttempt = attempts[0];
            const daysSince = lastAttempt?.created_at 
              ? Math.floor((Date.now() - new Date(lastAttempt.created_at).getTime()) / (1000 * 60 * 60 * 24))
              : 0;
            failedQuizzes.push({
              quiz_id: questionId,
              attempts: total,
              last_score: score,
              last_attempt_days_ago: daysSince,
            });
          }
        });
      }

      // Build progress state
      const progressState: ProgressState = {
        completed_items: completedItems,
        failed_quizzes: failedQuizzes,
        current_skill_estimate: {
          mechanics: Math.min(1, (completedItems.length * 0.05)),
          electronics: Math.min(1, (completedItems.length * 0.04)),
          programming: Math.min(1, (completedItems.length * 0.05)),
          logic: Math.min(1, (completedItems.length * 0.04)),
          robot_design: Math.min(1, (completedItems.length * 0.03)),
          confidence: Math.min(1, 0.3 + (completedItems.length * 0.05)),
        },
        streak_days: streakData?.current_streak || 0,
        xp: xpData?.total_xp || 0,
        badges: badgesData?.map(b => b.badge_id) || [],
        last_active_days_ago: null,
      };

      const latestEvent = {
        event_type: eventType,
        payload: {},
        user_message: userMessage || '',
      };

      // Call the AI Navigator edge function
      const { data, error: fnError } = await supabase.functions.invoke('ai-navigator', {
        body: {
          userProfile,
          progressState,
          contentGraph: DEFAULT_CONTENT_GRAPH,
          latestEvent,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResponse(data as NavigatorResponse);
      return data as NavigatorResponse;

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
  }, [user, toast]);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return {
    getNavigatorGuidance,
    clearResponse,
    response,
    isLoading,
    error,
  };
}
