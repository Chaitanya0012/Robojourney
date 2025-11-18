import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type AssessmentType = 'self' | 'diagnostic';

export interface SkillLevelData {
  id: string;
  user_id: string;
  category: string;
  skill_level: SkillLevel;
  assessed_at: string;
  last_updated: string;
}

export interface SkillAssessment {
  id: string;
  user_id: string;
  category: string;
  assessment_type: AssessmentType;
  result_level: SkillLevel;
  score?: number;
  completed_at: string;
}

export const useSkillAssessment = (category: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: currentLevel, isLoading: levelLoading } = useQuery({
    queryKey: ['skill-level', user?.id, category],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_skill_levels')
        .select('*')
        .eq('user_id', user!.id)
        .eq('category', category)
        .maybeSingle();
      
      if (error) throw error;
      return data as SkillLevelData | null;
    },
  });

  const { data: assessmentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['skill-assessments', user?.id, category],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skill_assessments')
        .select('*')
        .eq('user_id', user!.id)
        .eq('category', category)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      return data as SkillAssessment[];
    },
  });

  const saveAssessment = useMutation({
    mutationFn: async ({ 
      assessmentType, 
      resultLevel, 
      score 
    }: { 
      assessmentType: AssessmentType; 
      resultLevel: SkillLevel; 
      score?: number;
    }) => {
      if (!user) throw new Error("Must be logged in");

      // Save assessment record
      const { error: assessmentError } = await supabase
        .from('skill_assessments')
        .insert([{
          user_id: user.id,
          category,
          assessment_type: assessmentType,
          result_level: resultLevel,
          score,
        }]);

      if (assessmentError) throw assessmentError;

      // Update or insert skill level
      const { error: levelError } = await supabase
        .from('user_skill_levels')
        .upsert([{
          user_id: user.id,
          category,
          skill_level: resultLevel,
          last_updated: new Date().toISOString(),
        }]);

      if (levelError) throw levelError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-level', user?.id, category] });
      queryClient.invalidateQueries({ queryKey: ['skill-assessments', user?.id, category] });
      toast.success("Skill level updated successfully");
    },
    onError: (error) => {
      console.error('Error saving assessment:', error);
      toast.error("Failed to save assessment");
    },
  });

  const updateSkillLevel = useMutation({
    mutationFn: async (newLevel: SkillLevel) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from('user_skill_levels')
        .upsert([{
          user_id: user.id,
          category,
          skill_level: newLevel,
          last_updated: new Date().toISOString(),
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-level', user?.id, category] });
      toast.success("Skill level updated");
    },
  });

  return {
    currentLevel,
    assessmentHistory,
    isLoading: levelLoading || historyLoading,
    saveAssessment: saveAssessment.mutate,
    updateSkillLevel: updateSkillLevel.mutate,
    isSaving: saveAssessment.isPending || updateSkillLevel.isPending,
  };
};