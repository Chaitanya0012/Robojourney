import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SpacedRepetitionItem {
  id: string;
  user_id: string;
  question_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed?: string;
  consecutive_correct: number;
  total_attempts: number;
}

export interface ErrorPattern {
  id: string;
  user_id: string;
  question_id: string;
  category: string;
  incorrect_count: number;
  last_incorrect?: string;
  needs_review: boolean;
}

export const useSpacedRepetition = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get questions due for review today
  const { data: dueForReview, isLoading: reviewLoading } = useQuery({
    queryKey: ['spaced-repetition-due', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('spaced_repetition_items')
        .select('*, quiz_questions(*)')
        .eq('user_id', user!.id)
        .lte('next_review_date', today)
        .order('next_review_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Get error patterns (questions that need extra practice)
  const { data: errorPatterns, isLoading: errorsLoading } = useQuery({
    queryKey: ['error-patterns', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('question_error_patterns')
        .select('*, quiz_questions(*)')
        .eq('user_id', user!.id)
        .eq('needs_review', true)
        .order('incorrect_count', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate next review using SM-2 algorithm
  const calculateNextReview = (
    quality: number, // 0-5 rating (0=total blackout, 5=perfect recall)
    easeFactor: number,
    interval: number,
    repetitions: number
  ) => {
    let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < 1.3) newEaseFactor = 1.3;

    let newInterval: number;
    let newRepetitions: number;

    if (quality < 3) {
      newRepetitions = 0;
      newInterval = 1;
    } else {
      newRepetitions = repetitions + 1;
      if (newRepetitions === 1) {
        newInterval = 1;
      } else if (newRepetitions === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * newEaseFactor);
      }
    }

    return { newEaseFactor, newInterval, newRepetitions };
  };

  const recordAnswer = useMutation({
    mutationFn: async ({ 
      questionId, 
      isCorrect,
      category 
    }: { 
      questionId: string; 
      isCorrect: boolean;
      category: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      // Get or create spaced repetition item
      const { data: existing } = await supabase
        .from('spaced_repetition_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

      const quality = isCorrect ? 4 : 1; // Simplified: 4 for correct, 1 for incorrect
      
      if (existing) {
        const { newEaseFactor, newInterval, newRepetitions } = calculateNextReview(
          quality,
          existing.ease_factor,
          existing.interval_days,
          existing.repetitions
        );

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + newInterval);

        await supabase
          .from('spaced_repetition_items')
          .update({
            ease_factor: newEaseFactor,
            interval_days: newInterval,
            repetitions: newRepetitions,
            next_review_date: nextReview.toISOString().split('T')[0],
            last_reviewed: new Date().toISOString(),
            consecutive_correct: isCorrect ? existing.consecutive_correct + 1 : 0,
            total_attempts: existing.total_attempts + 1,
          })
          .eq('id', existing.id);
      } else {
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + 1);

        await supabase
          .from('spaced_repetition_items')
          .insert([{
            user_id: user.id,
            question_id: questionId,
            ease_factor: 2.5,
            interval_days: 1,
            repetitions: isCorrect ? 1 : 0,
            next_review_date: nextReview.toISOString().split('T')[0],
            last_reviewed: new Date().toISOString(),
            consecutive_correct: isCorrect ? 1 : 0,
            total_attempts: 1,
          }]);
      }

      // Update error patterns
      if (!isCorrect) {
        const { data: errorData } = await supabase
          .from('question_error_patterns')
          .select('*')
          .eq('user_id', user.id)
          .eq('question_id', questionId)
          .maybeSingle();

        if (errorData) {
          await supabase
            .from('question_error_patterns')
            .update({
              incorrect_count: errorData.incorrect_count + 1,
              last_incorrect: new Date().toISOString(),
              needs_review: true,
            })
            .eq('id', errorData.id);
        } else {
          await supabase
            .from('question_error_patterns')
            .insert([{
              user_id: user.id,
              question_id: questionId,
              category,
              incorrect_count: 1,
              last_incorrect: new Date().toISOString(),
              needs_review: true,
            }]);
        }
      } else {
        // Mark as reviewed if answered correctly
        await supabase
          .from('question_error_patterns')
          .update({ needs_review: false })
          .eq('user_id', user.id)
          .eq('question_id', questionId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaced-repetition-due', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['error-patterns', user?.id] });
    },
    onError: (error) => {
      console.error('Error recording answer:', error);
      toast.error("Failed to update review schedule");
    },
  });

  return {
    dueForReview: dueForReview || [],
    errorPatterns: errorPatterns || [],
    isLoading: reviewLoading || errorsLoading,
    recordAnswer: recordAnswer.mutate,
    isRecording: recordAnswer.isPending,
  };
};