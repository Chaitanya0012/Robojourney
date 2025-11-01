-- Create collaboration_requests table for public collaboration board
CREATE TABLE IF NOT EXISTS public.collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project_description TEXT NOT NULL,
  skills TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can read collaboration requests
CREATE POLICY "Anyone can view collaboration requests"
  ON public.collaboration_requests
  FOR SELECT
  USING (true);

-- Anyone can create collaboration requests
CREATE POLICY "Anyone can create collaboration requests"
  ON public.collaboration_requests
  FOR INSERT
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_collaboration_requests_created_at ON public.collaboration_requests(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_collaboration_requests_updated_at
  BEFORE UPDATE ON public.collaboration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();