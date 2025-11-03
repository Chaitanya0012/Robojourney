import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  level: number;
  order_index: number;
  category: string;
  difficulty: string;
  estimated_time: number;
  prerequisites: string[];
  learning_objectives: string[];
  created_at?: string;
  updated_at?: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  time_spent: number;
  completed_at: string | null;
  created_at?: string;
}

export const useLessons = (level?: number) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch lessons
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', level],
    queryFn: async () => {
      let query = supabase
        .from('lessons')
        .select('*')
        .order('level', { ascending: true })
        .order('order_index', { ascending: true });

      if (level !== undefined) {
        query = query.eq('level', level);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Lesson[];
    },
  });

  // Fetch user's lesson progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['lesson-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as LessonProgress[];
    },
  });

  // Mark lesson as complete
  const completeLesson = useMutation({
    mutationFn: async ({ lessonId, timeSpent }: { lessonId: string; timeSpent: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          time_spent: timeSpent,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
      toast({
        title: "Lesson Completed! 🎉",
        description: "Great job! You're making progress.",
      });
    },
    onError: (error) => {
      console.error('Error completing lesson:', error);
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get completion status for a specific lesson
  const isLessonCompleted = (lessonId: string) => {
    return progress?.some(p => p.lesson_id === lessonId && p.completed) || false;
  };

  // Calculate level completion percentage
  const getLevelCompletion = (level: number) => {
    const levelLessons = lessons?.filter(l => l.level === level) || [];
    if (levelLessons.length === 0) return 0;

    const completed = levelLessons.filter(l => isLessonCompleted(l.id)).length;
    return Math.round((completed / levelLessons.length) * 100);
  };

  return {
    lessons,
    progress,
    isLoading: lessonsLoading || progressLoading,
    completeLesson,
    isLessonCompleted,
    getLevelCompletion,
  };
};
