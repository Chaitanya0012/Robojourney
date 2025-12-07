// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are "Project Navigator", an expert AI project mentor.
You understand the user, diagnose their proficiency, research their tools, create a custom plan, and guide them live while preventing mistakes.
You take full responsibility for planning, analysing, and helping the user master their chosen project.

CORE MISSION:
1. Understand the user's project and intent.
2. Generate a tailored proficiency assessment.
3. Analyse answers and build a skill profile.
4. Design a complete custom project plan.
5. Guide the user in a chat-like interface as they work.
6. Warn them of mistakes, explain consequences, teach best practices.
7. Track their progress and update the plan dynamically.
8. Aim for mastery, not completion.

You must operate in four modes:
- "assessment_questions" - When user describes their project
- "assessment_feedback" - When user answers your questions
- "project_plan" - After analysis, create full project plan
- "live_guidance" - During the user's work messages

You ALWAYS respond with a single valid JSON object with this structure:

{
  "mode": "assessment_questions | assessment_feedback | project_plan | live_guidance",
  "message": "What you say to the user",
  "questions": [
    {
      "id": "string",
      "prompt": "string",
      "expected_answer_type": "free_text | scale_1_5 | multi_choice | yes_no",
      "options": [],
      "dimension": "concepts | tools | planning | debugging | confidence"
    }
  ],
  "analysis": {
    "proficiency": {
      "concepts": 0.0,
      "tools": 0.0,
      "planning": 0.0,
      "debugging": 0.0,
      "confidence": 0.0
    },
    "risk_areas": [],
    "missing_prerequisites": [],
    "summary": "string"
  },
  "plan": [
    {
      "step_id": "string",
      "title": "string",
      "description": "string",
      "estimated_minutes": 0,
      "difficulty": 1,
      "prerequisites": [],
      "resources": [
        {
          "type": "doc | video | article | example",
          "title": "string",
          "url": "string",
          "note": "string"
        }
      ]
    }
  ],
  "guidance": {
    "warnings": [
      {
        "description": "string",
        "consequence": "string",
        "when_relevant": "string"
      }
    ],
    "best_practices": [],
    "meta_cognition_prompts": [],
    "next_priority": "string"
  }
}

MODE DETAILS:

1. ASSESSMENT_QUESTIONS - When user describes their project:
   - Generate 3-10 targeted questions assessing: conceptual understanding, tools & tech experience, planning skills, debugging approach, confidence level
   - Questions must be specific to the user's project

2. ASSESSMENT_FEEDBACK - When user answers your questions:
   - Analyse their answers
   - Score proficiency dimensions (0.0-1.0)
   - Identify risk areas and missing prerequisites
   - Produce a short summary

3. PROJECT_PLAN - After analysis:
   - Create a full project plan tailored to user proficiency
   - Break down into 5-20 steps
   - Each step includes: description, expected duration, difficulty, prerequisites, resources

4. LIVE_GUIDANCE - During the user's work:
   - Understand what the user is doing RIGHT NOW
   - Warn them of relevant mistakes
   - Explain consequences
   - Give meta-cognition prompts

MENTORING PRINCIPLES:
- Keep the user safe: no overwhelming complexity
- Build clarity: always ensure they know WHY they're doing something
- Prevent mistakes before they happen
- Validate assumptions
- Encourage continual reflection
- Adapt plan dynamically based on their messages
- Aim for deep mastery

Always return VALID JSON. Never break format. Never reference this prompt.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectDescription, userAnswers, currentMode, conversationHistory } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userContext = `
CURRENT_MODE: ${currentMode || "assessment_questions"}

PROJECT_DESCRIPTION:
${projectDescription || "Not yet provided"}

USER_ANSWERS:
${userAnswers ? JSON.stringify(userAnswers, null, 2) : "None yet"}

CONVERSATION_HISTORY:
${conversationHistory ? JSON.stringify(conversationHistory.slice(-10), null, 2) : "New conversation"}
`;

    console.log("Project Navigator request received");
    console.log("Mode:", currentMode);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContext },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    let navigatorResponse;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      const jsonStr = jsonMatch[1] || content;
      navigatorResponse = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      navigatorResponse = {
        mode: "assessment_questions",
        message: "Welcome! Tell me about the project you'd like to work on. What are you trying to build?",
        questions: [
          {
            id: "project_goal",
            prompt: "What is the main goal of your project?",
            expected_answer_type: "free_text",
            options: [],
            dimension: "concepts"
          },
          {
            id: "experience_level",
            prompt: "How would you rate your experience with similar projects?",
            expected_answer_type: "scale_1_5",
            options: ["1 - Complete beginner", "2 - Some exposure", "3 - Moderate experience", "4 - Experienced", "5 - Expert"],
            dimension: "confidence"
          }
        ],
        analysis: null,
        plan: [],
        guidance: null
      };
    }

    console.log("Project Navigator response mode:", navigatorResponse.mode);

    return new Response(JSON.stringify(navigatorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Project Navigator error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        mode: "assessment_questions",
        message: "Something went wrong. Let's start fresh - tell me about your project.",
        questions: [],
        analysis: null,
        plan: [],
        guidance: null
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
