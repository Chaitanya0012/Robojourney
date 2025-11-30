import { supabaseServerClient } from './supabase';
import { openai, EMBEDDING_MODEL } from './openai';

export type MemoryRow = {
  id: string;
  content: string;
  user_id?: string;
  project_id?: string;
  created_at?: string;
  similarity?: number;
};

export const embed = async (text: string) => {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
};

export const saveMemory = async (userId: string, projectId: string, text: string) => {
  const embedding = await embed(text);
  const { error } = await supabaseServerClient.from('ai_memory').insert({
    user_id: userId,
    project_id: projectId,
    content: text,
    embedding,
  });
  if (error) {
    throw error;
  }
};

export const recallMemory = async (projectId: string, query: string, matchCount = 6) => {
  const embedding = await embed(query);
  const { data, error } = await supabaseServerClient.rpc('match_memories', {
    query_embedding: embedding,
    match_count: matchCount,
    project_id: projectId,
  });
  if (error) {
    throw error;
  }
  return (data as MemoryRow[] | null) ?? [];
};

