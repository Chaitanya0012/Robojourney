-- Fix resource_stats view to include created_at from resources table
DROP VIEW IF EXISTS public.resource_stats;

CREATE VIEW public.resource_stats
WITH (security_invoker=true)
AS
SELECT 
  r.id,
  r.user_id,
  r.title,
  r.category,
  r.created_at,
  r.description,
  r.url,
  r.file_url,
  r.image_url,
  r.difficulty_level,
  r.resource_type,
  r.is_approved,
  r.updated_at,
  COUNT(rr.id) as rating_count,
  COALESCE(AVG(rr.rating), 0) as avg_rating
FROM public.resources r
LEFT JOIN public.resource_ratings rr ON r.id = rr.resource_id
GROUP BY r.id, r.user_id, r.title, r.category, r.created_at, r.description, r.url, r.file_url, r.image_url, r.difficulty_level, r.resource_type, r.is_approved, r.updated_at;

-- Create XP system tables
CREATE TABLE IF NOT EXISTS public.user_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_xp integer NOT NULL DEFAULT 0,
  current_level integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_xp
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own XP"
ON public.user_xp FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP"
ON public.user_xp FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own XP"
ON public.user_xp FOR UPDATE
USING (auth.uid() = user_id);

-- Create XP activities log
CREATE TABLE IF NOT EXISTS public.xp_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  xp_earned integer NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on xp_activities
ALTER TABLE public.xp_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities"
ON public.xp_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
ON public.xp_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for user_xp updated_at
CREATE TRIGGER update_user_xp_updated_at
BEFORE UPDATE ON public.user_xp
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Initialize default confidence levels for existing users (if not exists)
-- This will be handled in the application code

-- Add profile_visibility column to profiles for sharing preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'friends'));

-- Add confidence_visible column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS confidence_visible boolean DEFAULT true;