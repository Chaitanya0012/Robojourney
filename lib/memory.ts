import { supabaseClient } from "./supabase";
import { embedText } from "./openai";

type MemoryRow = {
  content: string;
};

export async function saveMemory(userId: string, projectId: string, text: string) {
  const embedding = await embedText(text);
  const { error } = await supabaseClient.from("ai_memory").insert({
    user_id: userId,
    project_id: projectId,
    content: text,
    embedding,
  });

  if (error) {
    throw new Error(`Failed to save memory: ${error.message}`);
  }
}

export async function recallMemory(projectId: string, query: string) {
  const embedding = await embedText(query);
  const { data, error } = await supabaseClient.rpc("match_memories", {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5,
    query_project_id: projectId,
  });

  if (error) {
    throw new Error(`Failed to recall memory: ${error.message}`);
  }

  return (data as MemoryRow[] | null)?.map((row) => row.content) ?? [];
}
