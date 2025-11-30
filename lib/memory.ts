import { openai } from "./openai";
import { supabaseAdmin } from "./supabase";

type MemoryRow = {
  id?: string;
  user_id?: string;
  project_id?: string;
  content: string;
  embedding?: number[];
};

export async function embed(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding as number[];
}

export async function saveMemory(userId: string, projectId: string, text: string) {
  const embedding = await embed(text);
  const payload: MemoryRow = {
    user_id: userId,
    project_id: projectId,
    content: text,
    embedding,
  };

  const { error } = await supabaseAdmin.from("ai_memory").insert(payload);
  if (error) {
    console.error("Failed to save memory", error);
  }
}

export async function recallMemory(projectId: string, query: string) {
  const embedding = await embed(query);
  const { data, error } = await supabaseAdmin.rpc("match_memories", {
    query_embedding: embedding,
    match_threshold: 0.2,
    match_count: 8,
    project_id: projectId,
  });

  if (error) {
    console.error("Failed to recall memory", error);
    return [] as { text: string; score?: number }[];
  }

  return (data ?? []).map((row: any) => ({
    text: row.content ?? row.text ?? "",
    score: row.similarity ?? row.score,
  }));
}
