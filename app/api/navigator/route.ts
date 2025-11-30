import { NextResponse } from 'next/server';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { CHAT_MODEL, openai } from '../../../lib/openai';
import { recallMemory, saveMemory, MemoryRow } from '../../../lib/memory';
import { supabaseServerClient } from '../../../lib/supabase';
import { getSimulatorStateTool } from '../../../tools/getSimulatorState';
import { webSearchTool } from '../../../tools/webSearch';

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

type NavigatorBody = {
  userMessage?: string;
  projectId: string;
  mode?: string;
  userId?: string;
};

type PlanStep = {
  title: string;
  description: string;
  prerequisites?: string[];
  resources?: string[];
};

const toolDefinitions = [getSimulatorStateTool, webSearchTool];

const loadProjectPlan = async (projectId: string): Promise<PlanStep[]> => {
  const { data, error } = await supabaseServerClient
    .from('project_plans')
    .select('plan')
    .eq('project_id', projectId)
    .single();

  if (error || !data?.plan) {
    return [
      {
        title: 'Clarify goals and hardware',
        description: 'Confirm the target behavior, hardware bill of materials, and constraints.',
        prerequisites: ['List motors, drivers, sensors, and controller'],
      },
      {
        title: 'Build minimal control loop',
        description: 'Bring up motor control with safety limits, then add sensor streaming.',
        prerequisites: ['Motor driver wiring validated', 'Power budget checked'],
      },
      {
        title: 'Implement closed-loop behavior',
        description: 'Tune PID/logic and add fail-safes using telemetry from simulator or bench tests.',
        resources: ['Link to controller datasheet', 'Simulator state viewer'],
      },
    ];
  }

  return data.plan as PlanStep[];
};

const serializeMemories = (memories: MemoryRow[]) => {
  if (!memories || memories.length === 0) return 'No prior memory available.';
  return memories
    .map((m, idx) => `(${idx + 1}) score=${m.similarity?.toFixed(3) ?? 'n/a'} :: ${m.content}`)
    .join('\n');
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as NavigatorBody;
    const { userMessage, projectId, mode = 'live_guidance', userId = 'demo-user' } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const [plan, memories] = await Promise.all([
      loadProjectPlan(projectId),
      recallMemory(projectId, userMessage || 'project context').catch(() => [] as MemoryRow[]),
    ]);

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `Project ID: ${projectId}` },
      { role: 'system', content: `Project plan: ${JSON.stringify(plan)}` },
      { role: 'system', content: `Relevant memory:\n${serializeMemories(memories)}` },
      { role: 'user', content: userMessage ?? 'Continue guidance' },
    ];

    const toolChoice = toolDefinitions.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));

    let completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages,
      tools: toolChoice,
      tool_choice: 'auto',
    });

    let choice = completion.choices[0];
    const toolMessages: ChatCompletionMessageParam[] = [];

    if (choice.message.tool_calls?.length) {
      for (const toolCall of choice.message.tool_calls) {
        const tool = toolDefinitions.find((t) => t.name === toolCall.function.name);
        let args: Record<string, unknown> = {};
        try {
          args = toolCall.function.arguments ? JSON.parse(toolCall.function.arguments) : {};
        } catch {
          args = { _raw: toolCall.function.arguments } as Record<string, unknown>;
        }
        let result: unknown;
        if (!tool) {
          result = { error: `Tool ${toolCall.function.name} not implemented` };
        } else {
          try {
            result = await tool.handler(args);
          } catch (error) {
            result = { error: error instanceof Error ? error.message : 'Tool execution failed' };
          }
        }
        toolMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      const followUpMessages: ChatCompletionMessageParam[] = [...messages, choice.message, ...toolMessages];
      completion = await openai.chat.completions.create({
        model: CHAT_MODEL,
        messages: followUpMessages,
      });
      choice = completion.choices[0];
    }

    const finalMessage = choice.message.content ?? '';
    const parsed = (() => {
      try {
        return JSON.parse(finalMessage as string);
      } catch {
        return null;
      }
    })();

    if (userMessage) {
      await saveMemory(userId, projectId, userMessage);
    }
    if (finalMessage) {
      await saveMemory(userId, projectId, finalMessage);
    }

    return NextResponse.json({
      mode: parsed?.mode ?? mode,
      message: parsed?.message ?? finalMessage,
      plan: parsed?.plan ?? plan,
      guidance: parsed?.guidance,
      analysis: parsed?.analysis,
      questions: parsed?.questions,
      memories,
    });
  } catch (error) {
    console.error('Navigator API error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Navigator failed' },
      { status: 500 },
    );
  }
}

