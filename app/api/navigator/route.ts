import { NextResponse } from "next/server";
import { recallMemory, saveMemory } from "../../../lib/memory";
import { openai } from "../../../lib/openai";
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

type NavigatorRequest = {
  userMessage: string;
  projectId: string;
  mode?: string;
  userId?: string;
};

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as NavigatorRequest;
    const { userMessage, projectId, mode = "live_guidance", userId = "demo-user" } = body;

    if (!userMessage || !projectId) {
      return NextResponse.json({ error: "Missing userMessage or projectId" }, { status: 400 });
    }

    const recalled_memory = await recallMemory(projectId, userMessage);

    const baseMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
    ];

    if (recalled_memory.length > 0) {
      baseMessages.push({
        role: "system" as const,
        content: `Relevant project memory (highest first):\n${recalled_memory
          .map((m, idx) => `${idx + 1}. ${m.text}`)
          .join("\n")}`,
      });
    }

    baseMessages.push({ role: "user" as const, content: userMessage });

    const toolHandlers: Record<string, ToolHandler> = {
      [getSimulatorStateTool.definition.function.name]: getSimulatorStateTool.handler,
      [webSearchTool.definition.function.name]: webSearchTool.handler,
    };

    const firstCompletion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: baseMessages,
      tools: [getSimulatorStateTool.definition, webSearchTool.definition],
      tool_choice: "auto",
    });

    const firstMessage = firstCompletion.choices[0].message;
    const toolCalls = firstMessage.tool_calls ?? [];
    const chatHistory: typeof baseMessages = [...baseMessages, firstMessage as any];

    if (toolCalls.length > 0) {
      for (const call of toolCalls) {
        const handler = toolHandlers[call.function.name];
        if (!handler) continue;
        let parsedArgs: Record<string, unknown> = {};
        try {
          parsedArgs = JSON.parse(call.function.arguments ?? "{}") as Record<string, unknown>;
        } catch (err) {
          parsedArgs = {};
        }
        const toolResult = await handler(parsedArgs);
        chatHistory.push({
          role: "tool" as const,
          tool_call_id: call.id,
          content: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
        } as any);
      }
    }

    let finalMessage = firstMessage;
    if (toolCalls.length > 0) {
      const secondCompletion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: chatHistory,
      });
      finalMessage = secondCompletion.choices[0].message;
    }

    const content = typeof finalMessage.content === "string" ? finalMessage.content : JSON.stringify(finalMessage.content);
    let parsed: Record<string, any> = {};
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      parsed = {
        mode,
        message: content,
        questions: [],
        analysis: {},
        plan: [],
        guidance: {},
      };
    }

    const responsePayload = {
      mode: parsed.mode ?? mode,
      message: parsed.message ?? content,
      questions: parsed.questions ?? [],
      analysis: parsed.analysis ?? {},
      plan: parsed.plan ?? [],
      guidance: parsed.guidance ?? {},
      recalled_memory,
    };

    await saveMemory(userId, projectId, userMessage);
    await saveMemory("assistant", projectId, responsePayload.message);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Navigator route error", error);
    return NextResponse.json({ error: "Navigator failed" }, { status: 500 });
  }
}
