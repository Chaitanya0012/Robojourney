import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Badge } from './useBadges';

export const useBadgesAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: badges, isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Badge[];
    },
  });

  const createBadge = useMutation({
    mutationFn: async (newBadge: Omit<Badge, 'id'>) => {
      const { error } = await supabase
        .from('badges')
        .insert(newBadge);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      toast({
        title: "Success",
        description: "Badge created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBadge = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Badge> }) => {
      const { error } = await supabase
        .from('badges')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      toast({
        title: "Success",
        description: "Badge updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBadge = useMutation({
    mutationFn: async (badgeId: string) => {
      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', badgeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      toast({
        title: "Success",
        description: "Badge deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    badges: badges || [],
    isLoading,
    createBadge: createBadge.mutate,
    updateBadge: updateBadge.mutate,
    deleteBadge: deleteBadge.mutate,
  };
};