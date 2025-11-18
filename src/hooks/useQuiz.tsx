import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useXP } from "./useXP";

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface QuizAttempt {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  xp_earned: number;
  time_taken?: number;
}

export interface QuizStats {
  total_attempts: number;
  correct_answers: number;
  accuracy_percentage: number;
  total_quiz_xp: number;
  days_active: number;
}

export const useQuiz = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addXP } = useXP();

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as QuizQuestion[];
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['quiz-stats', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_stats')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as QuizStats | null;
    },
  });

  const { data: streak, isLoading: streakLoading } = useQuery({
    queryKey: ['quiz-streak', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_streaks')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const submitAttempt = useMutation({
    mutationFn: async (attempt: QuizAttempt & { category?: string }) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from('quiz_attempts')
        .insert([{
          user_id: user.id,
          question_id: attempt.question_id,
          selected_answer: attempt.selected_answer,
          is_correct: attempt.is_correct,
          xp_earned: attempt.xp_earned,
          time_taken: attempt.time_taken,
        }]);
      
      if (error) throw error;

      // Add XP to user's total
      if (attempt.is_correct && attempt.xp_earned > 0) {
        await addXP({
          activityType: 'quiz_completion',
          xpAmount: attempt.xp_earned,
          description: `Answered quiz question correctly`
        });
      }

      // Update streak
      await updateStreak();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-stats', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['quiz-streak', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-xp', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['spaced-repetition-due', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['error-patterns', user?.id] });
    },
    onError: (error) => {
      console.error('Error submitting quiz attempt:', error);
      toast.error("Failed to submit answer");
    },
  });

  const updateStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingStreak } = await supabase
      .from('quiz_streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingStreak) {
      const lastDate = existingStreak.last_quiz_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = existingStreak.current_streak;
      
      if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else if (lastDate !== today) {
        newStreak = 1;
      }

      const longestStreak = Math.max(existingStreak.longest_streak, newStreak);

      await supabase
        .from('quiz_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_quiz_date: today
        })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('quiz_streaks')
        .insert([{
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_quiz_date: today
        }]);
    }
  };

  return {
    questions,
    questionsLoading,
    stats,
    statsLoading,
    streak,
    streakLoading,
    submitAttempt,
  };
};
