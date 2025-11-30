import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, type NavigatorModel } from "../../../lib/openaiClient";
import { supabaseClient } from "../../../lib/supabaseClient";
import { articles } from "../../../lib/articles";
import { quizzes } from "../../../lib/quizzes";

const SYSTEM_PROMPT = `<<<SYSTEM_PROMPT_START>>>
You are "AI Navigator", a robotics learning guide that controls the website layout and navigation.

Your goals:
- Understand the user’s goal and level.
- Build and maintain a personalized learning path (articles, quizzes, projects).
- Decide what the user should see NEXT.
- Reduce friction: minimize manual scrolling and searching for content.
- Make the site feel like it is tailored entirely to this one person.

You must ALWAYS respond with a single JSON object with the structure:

{
  "ui_action": "NAVIGATE | UPDATE_LAYOUT | UPDATE_PATH | ASK_USER | IDLE",
  "ui_payload": { ... },
  "message": "string to show in the chat bubble",
  "personalization": {
    "recommended_articles": [],
    "recommended_quizzes": [],
    "next_step": { "type": "", "id": "" }
  },
  "path_update": {
    "path": []
  }
}

Rules:
- NAVIGATE: choose which page/slug the frontend should route to next.
- UPDATE_LAYOUT: adjust which sections should be visible/emphasized.
- UPDATE_PATH: create or modify an ordered list of content (learning path).
- ASK_USER: ask clarifying questions if goal/level is unclear.
- IDLE: do nothing structural; just answer.

You have access to:
- A list of available articles (with difficulty, tags, prerequisites).
- A list of available quizzes (with difficulty, tags, linked article).
- The user’s preferences and recent results.

Behaviors:
- For beginners: start with “intro to robotics”, “what is a robot”, “motors basics”, simple quizzes.
- For intermediate: focus on projects (line follower, obstacle avoider) with supporting theory.
- For advanced: more projects, algorithms (PID, mapping, state machines), less hand-holding.

Personalization:
- "recommended_articles": 3–6 highly relevant next articles.
- "recommended_quizzes": up to 3 relevant quizzes.
- "next_step": single main recommended action.

You are responsible for making the website feel like it reconfigures itself based on your decisions.

Never output plain text. Only JSON.
<<<SYSTEM_PROMPT_END>>>`;

type NavigatorRequest = {
  userMessage?: string;
  mode?: string;
  projectId?: string;
  userId?: string;
};

const FALLBACK_OUTPUT: NavigatorModel = {
  ui_action: "UPDATE_LAYOUT",
  ui_payload: { showRecommendations: true },
  message: "I set up a starter path: begin with Intro to Robotics, then Motors Basics, followed by the Motors quiz.",
  personalization: {
    recommended_articles: [
      { id: "intro_robotics", reason: "Foundational overview" },
      { id: "motors_basics", reason: "Learn how robots move" },
      { id: "sensors_basics", reason: "Prep for projects" },
    ],
    recommended_quizzes: [{ id: "intro_robotics_quiz", reason: "Check understanding" }],
    next_step: { type: "article", id: "intro_robotics" },
  },
  path_update: {
    path: ["intro_robotics", "motors_basics", "motors_basics_quiz", "line_follower_concept"],
  },
};

async function fetchUserPreferences(userId: string) {
  try {
    const { data } = await supabaseClient
      .from("user_preferences")
      .select("experience_level, goal, preferred_pace")
      .eq("user_id", userId)
      .single();
    return data;
  } catch (error) {
    console.error("Failed to fetch preferences", error);
    return null;
  }
}

function buildContextBlob(preferences: unknown, mode?: string) {
  return {
    preferences,
    mode: mode || "live",
    catalog: {
      articles: articles.map((a) => ({
        id: a.id,
        title: a.title,
        difficulty: a.difficulty,
        tags: a.tags,
        prerequisites: a.prerequisites,
      })),
      quizzes: quizzes.map((q) => ({
        id: q.id,
        article_id: q.article_id,
        title: q.title,
        difficulty: q.difficulty,
      })),
    },
    recent_results: [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NavigatorRequest;
    const userId = body.userId || "demo-user";
    const preferences = await fetchUserPreferences(userId);
    const contextBlob = buildContextBlob(preferences, body.mode);

    const client = getOpenAIClient();
    const shouldCallOpenAI = Boolean(process.env.OPENAI_API_KEY);

    if (!shouldCallOpenAI) {
      return NextResponse.json(FALLBACK_OUTPUT);
    }

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            context: contextBlob,
            userMessage: body.userMessage || "Guide the learner.",
          }),
        },
      ],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content || "";
    let parsed: NavigatorModel | null = null;
    try {
      parsed = JSON.parse(raw) as NavigatorModel;
    } catch (error) {
      console.warn("Navigator JSON parse failed; returning fallback", error);
    }

    const responsePayload = parsed || FALLBACK_OUTPUT;

    if (responsePayload.path_update?.path?.length) {
      try {
        await supabaseClient
          .from("learning_paths")
          .upsert({ user_id: userId, path: responsePayload.path_update.path, active: true });
      } catch (error) {
        console.error("Failed to persist path", error);
      }
    }

    try {
      await supabaseClient
        .from("personalized_state")
        .upsert({
          user_id: userId,
          recommended_articles: responsePayload.personalization?.recommended_articles || [],
          recommended_quizzes: responsePayload.personalization?.recommended_quizzes || [],
          next_step: responsePayload.personalization?.next_step || null,
        });
    } catch (error) {
      console.error("Failed to persist personalization", error);
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
