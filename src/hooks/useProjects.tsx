import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useXP, useXPConfig, DEFAULT_XP_REWARDS } from '@/hooks/useXP';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  progress: number;
  icon: string | null;
  color: string | null;
  deadline: string | null;
  roadmap: string | null;
  help_request: string | null;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addXP } = useXP();
  const { data: xpConfig } = useXPConfig();
  const xpRewards = xpConfig?.xp_rewards ?? DEFAULT_XP_REWARDS;

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      if (!user) throw new Error('Not authenticated');

      const oldProject = projects?.find(p => p.id === id);
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Award XP if project completed
      if (oldProject && oldProject.progress < 100 && updates.progress === 100) {
        addXP({
          activityType: 'finish_project',
          xpAmount: xpRewards.finish_project,
          description: `Completed project: ${oldProject.title}`,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({
        title: "Success",
        description: "Project updated successfully",
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

  const createProject = useMutation({
    mutationFn: async (newProject: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('projects')
        .insert({ ...newProject, user_id: user.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({
        title: "Success",
        description: "Project created successfully",
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
    projects: projects || [],
    isLoading,
    updateProject: updateProject.mutate,
    createProject: createProject.mutate,
  };
};
