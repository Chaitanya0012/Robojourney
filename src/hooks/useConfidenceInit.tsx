import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_CONFIDENCE_CATEGORIES = [
  { name: 'Programming', color: 'primary' },
  { name: 'Electronics', color: 'secondary' },
  { name: 'Mechanical', color: 'success' },
  { name: 'Design', color: 'primary' },
];

export const useConfidenceInit = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: hasConfidence, isLoading } = useQuery({
    queryKey: ['has-confidence', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_confidence')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!user,
  });

  const initConfidence = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const confidenceData = DEFAULT_CONFIDENCE_CATEGORIES.map(cat => ({
        user_id: user.id,
        name: cat.name,
        level: 0,
        color: cat.color,
      }));

      const { error } = await supabase
        .from('user_confidence')
        .insert(confidenceData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confidence', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['has-confidence', user?.id] });
    },
  });

  useEffect(() => {
    if (!isLoading && user && hasConfidence === false) {
      initConfidence.mutate();
    }
  }, [hasConfidence, isLoading, user]);

  return { isInitialized: hasConfidence, isLoading };
};
