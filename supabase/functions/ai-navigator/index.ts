import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are "AI Navigator", the master curriculum planner and guide for a robotics learning platform.
Your job is to design and adapt a personalized learning path for each learner over time.

You NEVER reply with free-form text.
You ALWAYS respond with a single valid JSON object with this structure:

{
  "message": "string: what you say to the learner in friendly, clear language",
  "ui_action": "string: one of [\"NAVIGATE\", \"SHOW_PLAN\", \"REVIEW\", \"ASK_CLARIFICATION\", \"IDLE\"]",
  "ui_payload": { ... },
  "tutor_intent": "string: high-level intent",
  "plan": [
    {
      "step_type": "string: one of [\"article\", \"quiz\", \"project\", \"simulation\", \"review\", \"checkpoint\"]",
      "target_id": "string or null",
      "reason": "string: short explanation",
      "expected_duration_minutes": "number",
      "difficulty": "integer 1-5",
      "prerequisites": []
    }
  ],
  "skill_update": {
    "mechanics": "float 0-1",
    "electronics": "float 0-1",
    "programming": "float 0-1",
    "logic": "float 0-1",
    "robot_design": "float 0-1",
    "confidence": "float 0-1"
  },
  "spaced_repetition": {
    "schedule": []
  }
}

DECISION POLICY:
1. SAFETY + MOTIVATION FIRST - Never shame or overwhelm. Encourage small wins.
2. ALWAYS ENSURE A NEXT STEP - The learner should NEVER be at a dead end.
3. MASTERY-BASED PROGRESSION - Do not advance if mastery < 0.7 in prerequisites.
4. SPACED REPETITION - Recently failed quizzes → review in 1–2 days.
5. FLOW + DIFFICULTY - Aim for tasks slightly above current skill.

BEHAVIOUR PATTERNS:
- NEW BEGINNER: Start with 1–2 very short articles, follow with tiny quiz.
- RETURNING AFTER BREAK (>7 days): Start with recap, suggest review before moving on.
- HIGH PERFORMER: If scores > 0.8, suggest challenge content.
- STRUGGLING LEARNER: Lower difficulty, add spaced repetition, reassure.

Always return VALID JSON only. Never include comments or extra text.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userProfile, progressState, contentGraph, latestEvent } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userContext = `
USER_PROFILE:
${JSON.stringify(userProfile, null, 2)}

PROGRESS_STATE:
${JSON.stringify(progressState, null, 2)}

CONTENT_GRAPH:
${JSON.stringify(contentGraph, null, 2)}

LATEST_EVENT:
${JSON.stringify(latestEvent, null, 2)}
`;

    console.log("AI Navigator request received");
    console.log("User profile:", userProfile?.id);
    console.log("Progress items:", progressState?.completed_items?.length || 0);

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
        max_tokens: 2000,
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

    // Parse the JSON response from the AI
    let navigatorResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      const jsonStr = jsonMatch[1] || content;
      navigatorResponse = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      // Return a safe fallback response
      navigatorResponse = {
        message: "I'm here to help guide your learning journey. Let me know what you'd like to focus on today!",
        ui_action: "ASK_CLARIFICATION",
        ui_payload: {
          question_type: "goal",
          options: ["Start from basics", "Continue where I left off", "Try a challenge", "Review weak areas"]
        },
        tutor_intent: "clarify_goal",
        plan: [],
        skill_update: progressState?.current_skill_estimate || {
          mechanics: 0.1,
          electronics: 0.1,
          programming: 0.1,
          logic: 0.1,
          robot_design: 0.1,
          confidence: 0.3
        },
        spaced_repetition: { schedule: [] }
      };
    }

    console.log("AI Navigator response generated:", navigatorResponse.tutor_intent);

    return new Response(JSON.stringify(navigatorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Navigator error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Something went wrong. Let's try a different approach.",
        ui_action: "IDLE",
        ui_payload: {},
        tutor_intent: "error_recovery",
        plan: [],
        skill_update: {},
        spaced_repetition: { schedule: [] }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
