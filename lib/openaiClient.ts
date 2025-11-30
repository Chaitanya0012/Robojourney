import OpenAI from "openai";

let client: OpenAI | null = null;

export const getOpenAIClient = () => {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY is not set; Navigator will return fallback responses.");
    client = new OpenAI({ apiKey: "" });
    return client;
  }
  client = new OpenAI({ apiKey });
  return client;
};

export type NavigatorModel = {
  ui_action: "NAVIGATE" | "UPDATE_LAYOUT" | "UPDATE_PATH" | "ASK_USER" | "IDLE";
  ui_payload?: Record<string, unknown>;
  message: string;
  personalization: {
    recommended_articles: { id: string; reason?: string }[];
    recommended_quizzes: { id: string; reason?: string }[];
    next_step: { type: string; id: string } | null;
  };
  path_update?: { path: string[] } | null;
};
