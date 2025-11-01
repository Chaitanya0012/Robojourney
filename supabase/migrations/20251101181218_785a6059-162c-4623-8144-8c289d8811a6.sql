-- Fix security definer view by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.quiz_stats;

CREATE OR REPLACE VIEW public.quiz_stats 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
  ROUND(AVG(CASE WHEN is_correct THEN 100 ELSE 0 END), 2) as accuracy_percentage,
  SUM(xp_earned) as total_quiz_xp,
  COUNT(DISTINCT DATE(created_at)) as days_active
FROM public.quiz_attempts
GROUP BY user_id;