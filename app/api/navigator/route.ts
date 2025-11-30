import { NextRequest, NextResponse } from "next/server";
import { articles, curriculumNodes } from "../../../lib/articles";
import { quizzes } from "../../../lib/quizzes";
import { glossary } from "../../../lib/glossary";
import { getOpenAIClient, type NavigatorModel } from "../../../lib/openaiClient";
import { recallMemory } from "../../../lib/memory";
import { supabaseClient } from "../../../lib/supabaseClient";

const NAVIGATOR_TONE =
  "You are an encouraging, curious guide. Celebrate effort, invite tiny experiments, and avoid shame.";

const FALLBACK: NavigatorModel = {
  ui_action: "UPDATE_PATH",
  ui_payload: {},
  message:
    "Let's keep the momentum! Start with 'What is Electricity', then try the Digital vs Analog quiz to unlock the next bubble.",
  personalization: {
    recommended_articles: [
      { id: "what_is_electricity", reason: "kickoff" },
      { id: "digital_vs_analog", reason: "next in sequence" },
      { id: "what_is_a_sensor", reason: "sensors power line followers" },
    ],
    recommended_quizzes: [{ id: "quiz_what_is_electricity", reason: "Check your spark" }],
    next_step: { type: "article", id: "what_is_electricity" },
  },
  path_update: { path: curriculumNodes },
};

type Body = {
  userId?: string;
  projectId?: string;
  userMessage?: string;
  simulatorState?: Record<string, unknown>;
  recentMistakeTags?: string[];
};

async function fetchProgress(userId: string) {
  const { data } = await supabaseClient
    .from("user_progress")
    .select("node_id, xp, level, completed, next_review_date")
    .eq("user_id", userId);
  return data || [];
}

function buildContextBlob(userMessage: string, simulatorState: Record<string, unknown> | undefined, progress: any[], memories: string[]) {
  const unlocked = progress.filter((p) => p.completed).map((p) => p.node_id);
  return {
    tone: NAVIGATOR_TONE,
    userMessage,
    simulatorState,
    glossary,
    catalog: { articles, quizzes },
    progress,
    unlocked,
    memories,
  };
}

function buildResponse(context: ReturnType<typeof buildContextBlob>): NavigatorModel {
  const nextNode = curriculumNodes.find((node) => !context.unlocked.includes(node)) || curriculumNodes[0];
  const nextQuiz = quizzes.find((q) => q.node_id === nextNode);
  const recommended_articles = articles
    .filter((a) => [nextNode, context.unlocked[context.unlocked.length - 1]].includes(a.id))
    .map((a) => ({ id: a.id, reason: "Fits your path" }));
  const recommended_quizzes = nextQuiz ? [{ id: nextQuiz.id, reason: "Unlocks the following bubble" }] : [];

  return {
    ui_action: "UPDATE_PATH",
    ui_payload: { openSimulator: nextNode === "build_a_line_follower" },
    message:
      context.userMessage?.length
        ? "I heard you! Let's tackle the next bubble and keep practicing."
        : "Ready to keep exploring? Let's follow the map together.",
    personalization: {
      recommended_articles,
      recommended_quizzes,
      next_step: { type: "article", id: nextNode },
    },
    path_update: { path: curriculumNodes },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const userId = body.userId || "demo-user";
    const projectId = body.projectId || "demo-project";

    const progress = await fetchProgress(userId);
    if (body.recentMistakeTags?.length) {
      await supabaseClient.from("mistake_log").insert({ user_id: userId, tags: body.recentMistakeTags });
    }

    const memories = await recallMemory(projectId, body.userMessage || "robotics learning");
    const context = buildContextBlob(body.userMessage || "", body.simulatorState, progress, memories);

    const client = getOpenAIClient();
    const shouldCall = Boolean(process.env.OPENAI_API_KEY);

    if (!shouldCall) {
      return NextResponse.json(buildResponse(context));
    }

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: `${NAVIGATOR_TONE}\nUse JSON only. Avoid shame.` },
        {
          role: "user",
          content: JSON.stringify({
            request: body.userMessage || "Guide me",
            context,
            instructions:
              "Respond with {ui_action, ui_payload, message, personalization, path_update}. ui_action allowed: NAVIGATE, UPDATE_LAYOUT, UPDATE_PATH, ASK_USER, OPEN_SIMULATOR, SHOW_FEEDBACK, IDLE.",
          }),
        },
      ],
      temperature: 0.4,
    });

    let parsed: NavigatorModel | null = null;
    const raw = completion.choices[0]?.message?.content || "";
    try {
      parsed = JSON.parse(raw) as NavigatorModel;
    } catch (error) {
      console.warn("Navigator parse failed", error, raw);
    }

    const payload = parsed || buildResponse(context);
    return NextResponse.json(payload);
  } catch (error) {
    console.error(error);
    return NextResponse.json(FALLBACK, { status: 200 });
  }
}
