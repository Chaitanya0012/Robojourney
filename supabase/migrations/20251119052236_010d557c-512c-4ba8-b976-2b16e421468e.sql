-- Create RAG knowledge base tables for AI tutor context

-- Articles table for detailed robotics concepts
CREATE TABLE IF NOT EXISTS public.rag_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  topic text NOT NULL,
  level text NOT NULL,
  order_index integer NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Components table for hardware/component reference
CREATE TABLE IF NOT EXISTS public.rag_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  component_type text NOT NULL,
  description text NOT NULL,
  specifications jsonb,
  common_issues text[],
  usage_tips text[],
  related_topics text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Troubleshooting table for diagnostic trees
CREATE TABLE IF NOT EXISTS public.rag_troubleshooting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem text NOT NULL,
  category text NOT NULL,
  symptoms text[],
  diagnostic_steps jsonb NOT NULL,
  common_causes text[],
  solutions jsonb NOT NULL,
  related_components text[],
  difficulty_level text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rag_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_troubleshooting ENABLE ROW LEVEL SECURITY;

-- Public read access (knowledge base is public)
CREATE POLICY "Anyone can view RAG articles"
  ON public.rag_articles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view RAG components"
  ON public.rag_components FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view RAG troubleshooting"
  ON public.rag_troubleshooting FOR SELECT
  USING (true);

-- Moderators can manage knowledge base
CREATE POLICY "Moderators can insert RAG articles"
  ON public.rag_articles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can update RAG articles"
  ON public.rag_articles FOR UPDATE
  USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can insert RAG components"
  ON public.rag_components FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can update RAG components"
  ON public.rag_components FOR UPDATE
  USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can insert RAG troubleshooting"
  ON public.rag_troubleshooting FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can update RAG troubleshooting"
  ON public.rag_troubleshooting FOR UPDATE
  USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for faster search
CREATE INDEX idx_rag_articles_topic ON public.rag_articles(topic);
CREATE INDEX idx_rag_articles_level ON public.rag_articles(level);
CREATE INDEX idx_rag_components_type ON public.rag_components(component_type);
CREATE INDEX idx_rag_troubleshooting_category ON public.rag_troubleshooting(category);

-- Create trigger for updated_at
CREATE TRIGGER update_rag_articles_updated_at
  BEFORE UPDATE ON public.rag_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rag_components_updated_at
  BEFORE UPDATE ON public.rag_components
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rag_troubleshooting_updated_at
  BEFORE UPDATE ON public.rag_troubleshooting
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();