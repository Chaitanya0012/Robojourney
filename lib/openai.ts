export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
};

export type ChatTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

type ChatCompletionResponse = {
  choices: Array<{
    message: ChatMessage;
  }>;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

if (!OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. The navigator will not function.");
}

export async function chatCompletion(
  messages: ChatMessage[],
  tools?: ChatTool[]
): Promise<ChatCompletionResponse> {
  const payload: Record<string, unknown> = {
    model: OPENAI_MODEL,
    messages,
    temperature: 0.4,
  };

  if (tools?.length) {
    payload.tools = tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as ChatCompletionResponse;
  return json;
}

export async function embedText(text: string, model?: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: model ?? process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-large",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI embedding error: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };

  return json.data[0]?.embedding ?? [];
}
