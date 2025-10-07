import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  level: number;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export const useSkills = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skills, isLoading } = useQuery({
    queryKey: ['user_skills', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data as Skill[];
    },
    enabled: !!user,
  });

  const updateSkill = useMutation({
    mutationFn: async ({ id, level }: { id: string; level: number }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_skills')
        .update({ level })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_skills', user?.id] });
      toast({
        title: "Success",
        description: "Skill updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    skills: skills || [],
    isLoading,
    updateSkill: updateSkill.mutate,
  };
};
