import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { QuizQuestion } from "./useQuiz";

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export const useAdaptiveLearning = (category: string) => {
  const { user } = useAuth();

  // Get user's current skill level
  const { data: skillLevel } = useQuery({
    queryKey: ['skill-level', user?.id, category],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_skill_levels')
        .select('skill_level')
        .eq('user_id', user!.id)
        .eq('category', category)
        .maybeSingle();
      
      if (error) throw error;
      return data?.skill_level || 'beginner';
    },
  });

  // Get user's recent performance
  const { data: recentPerformance } = useQuery({
    queryKey: ['recent-performance', user?.id, category],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quiz_questions(category, difficulty)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;

      // Calculate accuracy for recent attempts
      const categoryAttempts = data.filter(
        (a: any) => a.quiz_questions?.category === category
      );
      
      const correct = categoryAttempts.filter(a => a.is_correct).length;
      const total = categoryAttempts.length;
      const accuracy = total > 0 ? (correct / total) * 100 : 0;

      return {
        attempts: data,
        accuracy,
        totalAttempts: total,
        correctAnswers: correct,
      };
    },
  });

  // Determine appropriate difficulty based on skill level and performance
  const getAdaptiveDifficulty = (): DifficultyLevel => {
    if (!skillLevel || !recentPerformance) return 'Easy';

    const { accuracy } = recentPerformance;

    // Adjust difficulty based on performance
    if (skillLevel === 'beginner') {
      if (accuracy >= 80) return 'Medium';
      return 'Easy';
    } else if (skillLevel === 'intermediate') {
      if (accuracy >= 85) return 'Hard';
      if (accuracy < 60) return 'Easy';
      return 'Medium';
    } else { // advanced
      if (accuracy < 70) return 'Medium';
      return 'Hard';
    }
  };

  // Filter questions based on adaptive difficulty
  const filterQuestionsByDifficulty = (questions: QuizQuestion[], targetDifficulty?: DifficultyLevel) => {
    const difficulty = targetDifficulty || getAdaptiveDifficulty();
    
    // Get mix of current and adjacent difficulties for better learning curve
    const difficulties: DifficultyLevel[] = [];
    
    if (difficulty === 'Easy') {
      difficulties.push('Easy', 'Medium');
    } else if (difficulty === 'Medium') {
      difficulties.push('Easy', 'Medium', 'Hard');
    } else {
      difficulties.push('Medium', 'Hard');
    }

    return questions.filter(q => difficulties.includes(q.difficulty));
  };

  return {
    skillLevel,
    recentPerformance,
    getAdaptiveDifficulty,
    filterQuestionsByDifficulty,
    isLoading: !skillLevel || !recentPerformance,
  };
};