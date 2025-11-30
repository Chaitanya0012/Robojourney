import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY ?? "";

if (!apiKey) {
  console.warn("OPENAI_API_KEY is not set. AI features will not function properly.");
}

export const openai = new OpenAI({ apiKey });
