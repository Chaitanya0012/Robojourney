import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Feedback {
  id: string;
  user_id: string;
  type: string;
  subject: string;
  message: string;
  rating: number;
  is_approved: boolean;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export const useFeedback = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    },
  });

  const createFeedback = useMutation({
    mutationFn: async (newFeedback: Omit<Feedback, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_approved'>) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('feedback')
        .insert({ ...newFeedback, user_id: user.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast({
        title: "Success",
        description: "Feedback submitted successfully! It will be reviewed before being displayed.",
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

  const approveFeedback = useMutation({
    mutationFn: async (feedbackId: string) => {
      const { error } = await supabase
        .from('feedback')
        .update({ is_approved: true })
        .eq('id', feedbackId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast({
        title: "Success",
        description: "Feedback approved",
      });
    },
  });

  return {
    feedback: feedback || [],
    isLoading,
    createFeedback: createFeedback.mutate,
    approveFeedback: approveFeedback.mutate,
  };
};
