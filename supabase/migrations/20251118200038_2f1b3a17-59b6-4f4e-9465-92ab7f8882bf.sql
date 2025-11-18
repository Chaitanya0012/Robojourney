-- Create skill assessment and adaptive learning tables

-- User skill levels per category
CREATE TABLE public.user_skill_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, category)
);

ALTER TABLE public.user_skill_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skill levels"
  ON public.user_skill_levels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill levels"
  ON public.user_skill_levels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill levels"
  ON public.user_skill_levels FOR UPDATE
  USING (auth.uid() = user_id);

-- Spaced repetition items (questions that need review)
CREATE TABLE public.spaced_repetition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  ease_factor NUMERIC DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  consecutive_correct INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.spaced_repetition_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spaced repetition items"
  ON public.spaced_repetition_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spaced repetition items"
  ON public.spaced_repetition_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spaced repetition items"
  ON public.spaced_repetition_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Error patterns and weak areas tracking
CREATE TABLE public.question_error_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  incorrect_count INTEGER DEFAULT 0,
  last_incorrect TIMESTAMP WITH TIME ZONE,
  needs_review BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.question_error_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own error patterns"
  ON public.question_error_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own error patterns"
  ON public.question_error_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own error patterns"
  ON public.question_error_patterns FOR UPDATE
  USING (auth.uid() = user_id);

-- Skill assessment results
CREATE TABLE public.skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('self', 'diagnostic')),
  result_level TEXT NOT NULL CHECK (result_level IN ('beginner', 'intermediate', 'advanced')),
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessments"
  ON public.skill_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON public.skill_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_spaced_repetition_next_review ON public.spaced_repetition_items(user_id, next_review_date);
CREATE INDEX idx_error_patterns_needs_review ON public.question_error_patterns(user_id, needs_review);
CREATE INDEX idx_skill_levels_user_category ON public.user_skill_levels(user_id, category);