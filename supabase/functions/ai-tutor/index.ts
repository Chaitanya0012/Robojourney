import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userAnswer, correctAnswer, explanation, mistakes, prompt, userId, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client for RAG queries
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract keywords for RAG context search
    let searchTerms: string[] = [];
    const inputText = (prompt || question || '').toLowerCase();
    
    // Common robotics keywords to search for
    const keywordMatches = inputText.match(/\b(motor|sensor|ultrasonic|servo|stepper|arduino|circuit|led|resistor|breadboard|power|battery|gear|encoder|driver|actuator|microcontroller|programming|debugging|h-bridge|pwm|analog|digital|voltage|current|wiring|multimeter|imu|gyroscope|accelerometer)\b/g);
    if (keywordMatches) {
      searchTerms = [...new Set(keywordMatches)] as string[];
    }

    console.log('RAG Search terms:', searchTerms);

    // Query RAG knowledge base for relevant context
    let ragContext = '';

    if (searchTerms.length > 0) {
      // Query articles for conceptual knowledge
      const { data: articles, error: articlesError } = await supabase
        .from('rag_articles')
        .select('title, content, topic, level')
        .limit(2);
      
      if (!articlesError && articles && articles.length > 0) {
        ragContext += '\n\n=== REFERENCE MATERIAL ===\n';
        articles.forEach(article => {
          ragContext += `\n📚 ${article.title} (${article.level})\nTopic: ${article.topic}\n${article.content.substring(0, 600)}...\n`;
        });
      }

      // Query components if hardware terms mentioned
      const componentTerms = searchTerms.filter(term => 
        ['motor', 'sensor', 'servo', 'ultrasonic', 'led', 'resistor', 'battery', 'encoder', 'stepper', 'h-bridge', 'imu'].includes(term)
      );
      
      if (componentTerms.length > 0) {
        const { data: components, error: componentsError } = await supabase
          .from('rag_components')
          .select('name, description, common_issues, usage_tips')
          .limit(2);
        
        if (!componentsError && components && components.length > 0) {
          ragContext += '\n\n=== COMPONENT INFORMATION ===\n';
          components.forEach(comp => {
            ragContext += `\n🔧 ${comp.name}\n${comp.description}\n`;
            if (comp.common_issues?.length) {
              ragContext += `⚠️ Common Issues: ${comp.common_issues.slice(0, 3).join('; ')}\n`;
            }
            if (comp.usage_tips?.length) {
              ragContext += `💡 Tips: ${comp.usage_tips.slice(0, 2).join('; ')}\n`;
            }
          });
        }
      }

      // Query troubleshooting if problem-related terms mentioned
      if (inputText.includes('not working') || inputText.includes('error') || 
          inputText.includes('problem') || inputText.includes('issue') || 
          inputText.includes('fix') || inputText.includes('debug') ||
          inputText.includes('help')) {
        const { data: troubleshooting, error: troubleshootingError } = await supabase
          .from('rag_troubleshooting')
          .select('problem, category, common_causes, diagnostic_steps')
          .limit(2);
        
        if (!troubleshootingError && troubleshooting && troubleshooting.length > 0) {
          ragContext += '\n\n=== TROUBLESHOOTING GUIDES ===\n';
          troubleshooting.forEach(guide => {
            ragContext += `\n🔍 ${guide.problem}\nCategory: ${guide.category}\n`;
            if (guide.common_causes?.length) {
              ragContext += `Common Causes: ${guide.common_causes.slice(0, 3).join(', ')}\n`;
            }
          });
        }
      }
    }

    console.log('RAG context length:', ragContext.length, 'characters');

    let systemPrompt = `You are a friendly, expert robotics tutor for smart 6th graders. Your goal is to help students understand robotics concepts clearly and fix their mistakes with patience and encouragement.

${ragContext ? 'Use the following reference material from the robotics knowledge base to provide accurate, detailed answers:' + ragContext : ''}

Guidelines:
- Be warm and encouraging
- Use simple language suitable for 6th graders
- Break down complex concepts into numbered steps
- Use analogies and real-world examples when helpful
- Point out specific mistakes kindly and explain WHY they occurred
- When available, reference the knowledge base material above
- Provide concrete, practical next steps
- Suggest hands-on experiments when appropriate
- Keep explanations concise but thorough (aim for 3-5 paragraphs)`;

    let userPrompt = "";

    // Handle different types of requests
    if (action === 'chat' && prompt) {
      // General chat question
      userPrompt = prompt;
    } else if (mistakes && mistakes.length > 0) {
      // Analyzing mistake patterns
      userPrompt = `The student has been struggling with these robotics concepts:

${mistakes.map((m: any, i: number) => `${i + 1}. Category: ${m.category}
   Times incorrect: ${m.incorrect_count}
   Question: ${m.quiz_questions?.question || 'N/A'}`).join('\n\n')}

Please analyze their mistake patterns and provide:
1. Common themes or concepts they're struggling with
2. Specific advice for each weak area
3. Study recommendations and resources to review
4. Encouragement and actionable next steps

Keep it concise but helpful for a 6th grader.`;
    } else if (question) {
      // Explaining a specific mistake
      userPrompt = `The student answered a robotics question incorrectly:

Question: ${question}
Their Answer: ${userAnswer || 'Unknown'}
Correct Answer: ${correctAnswer}
Explanation: ${explanation}

Please help them understand:
1. Why their answer was incorrect
2. The correct reasoning step-by-step
3. Common misconceptions about this topic
4. A practical tip or memory trick for next time

Be encouraging and supportive!`;
    } else {
      userPrompt = "Hello! I'm here to help you with robotics. What would you like to learn about?";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway Error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const tutorResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: tutorResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-tutor function:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
