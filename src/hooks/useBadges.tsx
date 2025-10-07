import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserBadge {
  id: string;
  badge: Badge;
  earned_at: string;
}

export const useBadges = () => {
  const { user } = useAuth();

  const { data: allBadges, isLoading: badgesLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*');

      if (error) throw error;
      return data as Badge[];
    },
  });

  const { data: userBadges, isLoading: userBadgesLoading } = useQuery({
    queryKey: ['user_badges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select('id, earned_at, badge:badges(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const badges = allBadges?.map(badge => {
    const userBadge = userBadges?.find((ub: any) => ub.badge.id === badge.id);
    return {
      ...badge,
      earned: !!userBadge,
    };
  }) || [];

  return {
    badges,
    isLoading: badgesLoading || userBadgesLoading,
  };
};
