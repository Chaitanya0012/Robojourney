import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserXP {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  created_at: string;
  updated_at: string;
}

export interface XPActivity {
  id: string;
  user_id: string;
  activity_type: string;
  xp_earned: number;
  description: string | null;
  created_at: string;
}

// XP thresholds for each level
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "Novice Robot Builder" },
  { level: 2, xp: 500, title: "Mechanic Apprentice" },
  { level: 3, xp: 1500, title: "Sensor Specialist" },
  { level: 4, xp: 3000, title: "Circuit Master" },
  { level: 5, xp: 6000, title: "Robotics Engineer" },
  { level: 6, xp: 12000, title: "AI Programmer" },
  { level: 7, xp: 25000, title: "Automation Architect" },
  { level: 8, xp: 50000, title: "Robotics Innovator" },
  { level: 9, xp: 100000, title: "Cybernetic Creator" },
  { level: 10, xp: 250000, title: "Grand Robotics Master" },
];

// XP rewards for different activities
export const XP_REWARDS = {
  watch_video: 100,
  complete_activity: 200,
  finish_project: 1000,
  pass_quiz: 500,
  upload_document: 300,
  help_others: 150,
  create_resource: 250,
  rate_resource: 50,
  update_confidence: 75,
  daily_login: 100,
};

export const calculateLevel = (totalXP: number): number => {
  let level = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXP >= threshold.xp) {
      level = threshold.level;
    } else {
      break;
    }
  }
  return level;
};

export const getLevelTitle = (level: number): string => {
  const levelData = LEVEL_THRESHOLDS.find(l => l.level === level);
  return levelData?.title || "Novice Robot Builder";
};

export const getNextLevelXP = (currentLevel: number): number => {
  const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === currentLevel + 1);
  return nextLevel?.xp || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].xp;
};

export const useXP = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userXP, isLoading } = useQuery({
    queryKey: ['user-xp', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If user doesn't have XP record, create one
        if (error.code === 'PGRST116') {
          const { data: newXP, error: createError } = await supabase
            .from('user_xp')
            .insert({ user_id: user.id, total_xp: 0, current_level: 1 })
            .select()
            .single();
          
          if (createError) throw createError;
          return newXP as UserXP;
        }
        throw error;
      }
      
      return data as UserXP;
    },
    enabled: !!user,
  });

  const { data: activities } = useQuery({
    queryKey: ['xp-activities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('xp_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as XPActivity[];
    },
    enabled: !!user,
  });

  const addXP = useMutation({
    mutationFn: async ({ activityType, xpAmount, description }: { 
      activityType: string; 
      xpAmount: number;
      description?: string;
    }) => {
      if (!user || !userXP) throw new Error('Not authenticated');

      const newTotalXP = userXP.total_xp + xpAmount;
      const newLevel = calculateLevel(newTotalXP);
      const leveledUp = newLevel > userXP.current_level;

      // Update user XP
      const { error: updateError } = await supabase
        .from('user_xp')
        .update({ 
          total_xp: newTotalXP, 
          current_level: newLevel 
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log activity
      const { error: logError } = await supabase
        .from('xp_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          xp_earned: xpAmount,
          description: description || null,
        });

      if (logError) throw logError;

      return { leveledUp, newLevel };
    },
    onSuccess: ({ leveledUp, newLevel }) => {
      queryClient.invalidateQueries({ queryKey: ['user-xp', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['xp-activities', user?.id] });
      
      if (leveledUp) {
        toast({
          title: "🎉 Level Up!",
          description: `Congratulations! You've reached Level ${newLevel}: ${getLevelTitle(newLevel)}`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentLevelXP = userXP ? LEVEL_THRESHOLDS.find(l => l.level === userXP.current_level)?.xp || 0 : 0;
  const nextLevelXP = userXP ? getNextLevelXP(userXP.current_level) : 500;
  const progressToNextLevel = userXP 
    ? ((userXP.total_xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 
    : 0;

  return {
    userXP,
    activities: activities || [],
    isLoading,
    addXP: addXP.mutate,
    currentLevelTitle: userXP ? getLevelTitle(userXP.current_level) : "Novice Robot Builder",
    progressToNextLevel,
    nextLevelXP,
    LEVEL_THRESHOLDS,
    XP_REWARDS,
  };
};
