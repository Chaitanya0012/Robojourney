import { NextResponse } from "next/server";
import { chatCompletion, ChatMessage, ChatTool } from "../../../lib/openai";
import { recallMemory, saveMemory } from "../../../lib/memory";
import { supabaseClient } from "../../../lib/supabase";
import { getSimulatorStateTool } from "../../../tools/getSimulatorState";
import { webSearchTool } from "../../../tools/webSearch";

const SYSTEM_PROMPT = `<<<SYSTEM_PROMPT_START>>>

You are “Project Navigator”, an expert AI project mentor.  
You understand the user, diagnose their proficiency, research their tools, create a custom plan, and guide them live while preventing mistakes.  
You output ONLY valid JSON with:
{
  "mode": "",
  "message": "",
  "questions": [],
  "analysis": {},
  "plan": [],
  "guidance": {}
}

Your modes:
- assessment_questions
- assessment_feedback
- project_plan
- live_guidance

guidance contains:
- warnings[]
- best_practices[]
- meta_cognition_prompts[]
- next_priority

Think like a robotics expert with experience in Arduino, ESP32, sensors, motors, robotics logic, simulators, PID, line followers, obstacle bots, arm robots, etc.

<<<SYSTEM_PROMPT_END>>>`;

const toolsWithHandlers = [getSimulatorStateTool, webSearchTool];

async function callToolsIfNeeded(
  initialMessage: ChatMessage | undefined,
  messages: ChatMessage[],
  toolDefs: ChatTool[]
): Promise<ChatMessage | undefined> {
  let message = initialMessage;
  if (!message) return undefined;

  if (message.tool_calls?.length) {
    messages.push(message);

    for (const toolCall of message.tool_calls) {
      const tool = toolsWithHandlers.find((t) => t.name === toolCall.function.name);
      if (!tool) continue;
      try {
        const args = toolCall.function.arguments
          ? JSON.parse(toolCall.function.arguments)
          : {};
        const result = await tool.handler(args);
        messages.push({
          role: "tool",
          name: tool.name,
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      } catch (error) {
        messages.push({
          role: "tool",
          name: tool.name,
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: (error as Error).message }),
        });
      }
    }

    const followUp = await chatCompletion(messages, toolDefs);
    message = followUp.choices[0]?.message;
  }

  return message;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userMessage, projectId, mode } = body as {
      userMessage?: string;
      projectId?: string;
      mode?: string;
      userId?: string;
    };

    if (!userMessage || !projectId) {
      return NextResponse.json(
        { error: "userMessage and projectId are required" },
        { status: 400 }
      );
    }

    const userId = body.userId ?? "anonymous";

    let recalledMemory: string[] = [];
    try {
      recalledMemory = await recallMemory(projectId, userMessage);
    } catch (error) {
      console.error("Memory recall failed", error);
    }

    const planResult = await supabaseClient
      .from("project_plan")
      .select("title, description, prerequisites, resources")
      .eq("project_id", projectId)
      .order("order", { ascending: true });

    const plan =
      planResult.data?.map((row) => ({
        title: row.title,
        description: row.description,
        prerequisites: row.prerequisites ?? [],
        resources: row.resources ?? [],
      })) ?? [];

    const toolDefs: ChatTool[] = toolsWithHandlers.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          mode,
          projectId,
          userMessage,
          plan,
          recalledMemory,
        }),
      },
    ];

    const initialResponse = await chatCompletion(messages, toolDefs);
    let message = initialResponse.choices[0]?.message;

    message = await callToolsIfNeeded(message, messages, toolDefs);

    const content = message?.content ?? "";

    try {
      await saveMemory(userId, projectId, userMessage);
      if (content) {
        await saveMemory(userId, projectId, content);
      }
    } catch (error) {
      console.error("Failed to save memory", error);
    }

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      parsed = { message: content };
    }

    return NextResponse.json({
      ...parsed,
      plan: (parsed as { plan?: unknown[] }).plan ?? plan,
      memory: recalledMemory,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
