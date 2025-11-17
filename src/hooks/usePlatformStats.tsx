import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformStats {
  totalLearners: number;
  totalProjects: number;
  totalResources: number;
}

export const usePlatformStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      // Get total learners
      const { count: learners } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total projects
      const { count: projects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // Get approved resources
      const { count: resources } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true);

      return {
        totalLearners: learners || 0,
        totalProjects: projects || 0,
        totalResources: resources || 0,
      } as PlatformStats;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    stats,
    isLoading,
  };
};
