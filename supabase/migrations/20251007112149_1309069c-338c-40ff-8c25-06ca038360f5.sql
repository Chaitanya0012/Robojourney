-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Add columns to resources table
ALTER TABLE public.resources
ADD COLUMN difficulty_level text,
ADD COLUMN resource_type text,
ADD COLUMN is_approved boolean DEFAULT false;

-- Update resources RLS policies to allow only moderators to insert
DROP POLICY IF EXISTS "Users can insert their own resources" ON public.resources;

CREATE POLICY "Moderators can insert resources"
ON public.resources
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Moderators can update any resource
CREATE POLICY "Moderators can update resources"
ON public.resources
FOR UPDATE
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Create feedback table
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  is_approved boolean DEFAULT false,
  is_anonymous boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for feedback
CREATE POLICY "Users can insert their own feedback"
ON public.feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view approved feedback"
ON public.feedback
FOR SELECT
USING (is_approved = true);

CREATE POLICY "Moderators can view all feedback"
ON public.feedback
FOR SELECT
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can update feedback"
ON public.feedback
FOR UPDATE
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Add columns to projects table
ALTER TABLE public.projects
ADD COLUMN deadline timestamp with time zone,
ADD COLUMN roadmap text,
ADD COLUMN help_request text;

-- Trigger for feedback updated_at
CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Rename user_skills to user_confidence
ALTER TABLE public.user_skills RENAME TO user_confidence;

-- Update RLS policies for renamed table
DROP POLICY IF EXISTS "Users can insert their own skills" ON public.user_confidence;
DROP POLICY IF EXISTS "Users can update their own skills" ON public.user_confidence;
DROP POLICY IF EXISTS "Users can view their own skills" ON public.user_confidence;

CREATE POLICY "Users can insert their own confidence"
ON public.user_confidence
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own confidence"
ON public.user_confidence
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own confidence"
ON public.user_confidence
FOR SELECT
USING (auth.uid() = user_id);