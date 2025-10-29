-- Fix: Ensure profiles are properly created with default XP values
-- Add trigger to create user_xp when profile is created
CREATE OR REPLACE FUNCTION public.initialize_user_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create user_xp entry
  INSERT INTO public.user_xp (user_id, total_xp, current_level)
  VALUES (NEW.id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Initialize default confidence levels
  INSERT INTO public.user_confidence (user_id, name, level)
  VALUES 
    (NEW.id, 'Programming', 0),
    (NEW.id, 'Electronics', 0),
    (NEW.id, 'Mechanical', 0),
    (NEW.id, 'Design', 0)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile creation
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_xp();

-- Add RLS policy to allow admins to manage badges
CREATE POLICY "Admins can insert badges"
ON public.badges
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update badges"
ON public.badges
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete badges"
ON public.badges
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));