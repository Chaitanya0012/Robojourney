import OpenAI from 'openai';

export const CHAT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small';

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

