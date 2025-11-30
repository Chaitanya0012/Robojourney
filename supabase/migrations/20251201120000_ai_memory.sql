create extension if not exists vector;

create table if not exists ai_memory (
  id bigint generated always as identity primary key,
  user_id uuid,
  project_id uuid,
  content text,
  embedding vector(1536),
  created_at timestamptz default now()
);

create index if not exists ai_memory_project_id_idx on ai_memory(project_id);
create index if not exists ai_memory_embedding_idx on ai_memory using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create or replace function match_memories(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  query_project_id uuid
)
returns table (
  id bigint,
  content text,
  similarity float
)
language sql
as $$
  select
    ai_memory.id,
    ai_memory.content,
    1 - (ai_memory.embedding <=> query_embedding) as similarity
  from ai_memory
  where project_id = query_project_id
    and 1 - (ai_memory.embedding <=> query_embedding) >= match_threshold
  order by ai_memory.embedding <=> query_embedding
  limit match_count;
$$;
