import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Confidence {
  id: string;
  user_id: string;
  name: string;
  level: number;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export const useConfidence = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: confidence, isLoading } = useQuery({
    queryKey: ['confidence', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // @ts-ignore - Table was renamed to user_confidence but types haven't updated yet
      const { data, error } = await supabase
        .from('user_confidence')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data as Confidence[];
    },
    enabled: !!user,
  });

  const updateConfidence = useMutation({
    mutationFn: async ({ id, level }: { id: string; level: number }) => {
      if (!user) throw new Error('Not authenticated');

      // @ts-ignore - Table was renamed to user_confidence but types haven't updated yet
      const { error } = await supabase
        .from('user_confidence')
        .update({ level })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confidence', user?.id] });
      toast({
        title: "Success",
        description: "Confidence level updated successfully",
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
    confidence: confidence || [],
    isLoading,
    updateConfidence: updateConfidence.mutate,
  };
};
