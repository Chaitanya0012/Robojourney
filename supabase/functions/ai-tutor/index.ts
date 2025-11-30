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
    
    // Enhanced keyword extraction - both specific terms and broader topics
    const keywordMatches = inputText.match(/\b(motor|sensor|ultrasonic|servo|stepper|arduino|circuit|led|resistor|breadboard|power|battery|gear|encoder|driver|actuator|microcontroller|programming|debugging|h-bridge|pwm|analog|digital|voltage|current|wiring|multimeter|imu|gyroscope|accelerometer|bluetooth|wifi|wireless|communication|i2c|spi|uart|serial|lcd|display|button|switch|potentiometer|joystick|buzzer|speaker|relay|transistor|diode|capacitor|inductor|soldering|pcb|schematic|ground|vcc|gnd|pin|output|input)\b/g);
    if (keywordMatches) {
      searchTerms = [...new Set(keywordMatches)] as string[];
    }

    console.log('RAG Search terms:', searchTerms);

    // Get user's weak topics from SRS to personalize context
    let weakTopics: string[] = [];
    if (userId) {
      const { data: srsData } = await supabase
        .from('question_error_patterns')
        .select('category')
        .eq('user_id', userId)
        .eq('needs_review', true)
        .limit(5);
      
      if (srsData && srsData.length > 0) {
        weakTopics = [...new Set(srsData.map(d => d.category))];
        console.log('User weak topics:', weakTopics);
      }
    }

    // Query RAG knowledge base for relevant context
    let ragContext = '';

    if (searchTerms.length > 0 || weakTopics.length > 0) {
      // Build search filter for articles - prioritize weak topics
      let articlesQuery = supabase
        .from('rag_articles')
        .select('title, content, topic, level, tags');
      
      // Use text search on topic OR tags
      const searchPattern = [...searchTerms, ...weakTopics].join('|');
      if (searchPattern) {
        articlesQuery = articlesQuery.or(`topic.ilike.%${searchPattern}%,tags.cs.{${searchTerms.join(',')}}`);
      }
      
      const { data: articles, error: articlesError } = await articlesQuery.limit(4);
      
      if (!articlesError && articles && articles.length > 0) {
        ragContext += '\n\n=== REFERENCE MATERIAL ===\n';
        articles.forEach(article => {
          const isWeakTopic = weakTopics.includes(article.topic.toLowerCase());
          const badge = isWeakTopic ? '⭐' : '📚';
          ragContext += `\n${badge} ${article.title} (${article.level})\nTopic: ${article.topic}\n${article.content.substring(0, 500)}...\n`;
        });
      }

      // Query components if hardware terms mentioned
      const componentTerms = searchTerms.filter(term => 
        ['motor', 'sensor', 'servo', 'ultrasonic', 'led', 'resistor', 'battery', 'encoder', 'stepper', 'h-bridge', 'imu'].includes(term)
      );
      
      if (componentTerms.length > 0) {
        // Use text search on component names
        const componentPattern = componentTerms.join('|');
        const { data: components, error: componentsError } = await supabase
          .from('rag_components')
          .select('name, description, common_issues, usage_tips, specifications')
          .or(`name.ilike.%${componentPattern}%,component_type.ilike.%${componentPattern}%`)
          .limit(3);
        
        if (!componentsError && components && components.length > 0) {
          ragContext += '\n\n=== COMPONENT INFORMATION ===\n';
          components.forEach(comp => {
            ragContext += `\n🔧 ${comp.name}\n${comp.description}\n`;
            if (comp.specifications) {
              ragContext += `📐 Specs: ${JSON.stringify(comp.specifications).substring(0, 150)}\n`;
            }
            if (comp.common_issues?.length) {
              ragContext += `⚠️ Common Issues: ${comp.common_issues.slice(0, 3).join('; ')}\n`;
            }
            if (comp.usage_tips?.length) {
              ragContext += `💡 Tips: ${comp.usage_tips.slice(0, 3).join('; ')}\n`;
            }
          });
        }
      }

      // Query troubleshooting if problem-related terms mentioned
      const isProblemQuery = inputText.includes('not working') || inputText.includes('error') || 
          inputText.includes('problem') || inputText.includes('issue') || 
          inputText.includes('fix') || inputText.includes('debug') ||
          inputText.includes('help') || inputText.includes('wrong') || inputText.includes('broken');
          
      if (isProblemQuery) {
        // Search troubleshooting by category or related components
        let troubleQuery = supabase
          .from('rag_troubleshooting')
          .select('problem, category, common_causes, diagnostic_steps, solutions');
        
        if (searchTerms.length > 0) {
          const searchPattern = searchTerms.join('|');
          troubleQuery = troubleQuery.or(`category.ilike.%${searchPattern}%,related_components.cs.{${searchTerms.join(',')}}`);
        }
        
        const { data: troubleshooting, error: troubleshootingError } = await troubleQuery.limit(3);
        
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

    // Build enhanced system prompt with personalization
    const personalization = weakTopics.length > 0 
      ? `\n\n🎯 STUDENT CONTEXT: This student needs extra support with: ${weakTopics.join(', ')}. Provide additional encouragement and detail in these areas.`
      : '';

    let systemPrompt = `You are an expert robotics tutor helping a 6th grade student learn robotics and engineering. Your teaching style is:
- Patient, encouraging, and enthusiastic
- Focused on hands-on learning and experimentation
- Clear explanations with real-world examples
- Step-by-step problem-solving approach

${ragContext ? `📚 KNOWLEDGE BASE CONTEXT:\n${ragContext}\n` : ''}${personalization}

🎓 TEACHING GUIDELINES:
1. **Language**: Use 6th grade level vocabulary. Define technical terms simply.
2. **Structure**: Break complex topics into 3-4 bite-sized steps
3. **Examples**: Relate concepts to everyday objects (toys, kitchen appliances, sports)
4. **Debugging**: Ask 2-3 diagnostic questions *before* suggesting any solution.
5. **Socratic Flow**: Never give the final answer immediately. Instead:
   - Restate the problem in your own words.
   - Ask guiding questions that help the student reason it out.
   - Offer hints or checkpoints, not solutions.
6. **Encouragement**: Celebrate attempts and normalize mistakes as learning opportunities
7. **Safety**: Always mention safety when relevant (electricity, sharp tools, hot parts)
8. **Experiments**: Suggest simple tests they can do to verify understanding
9. **Citations**: Reference specific knowledge base articles when used (e.g., "According to our Power Systems guide...")

⚠️ IMPORTANT:
- If the student asks for a direct answer (even simple math), respond with questions that lead them to derive it.
- If information isn't in the knowledge base, say "I don't have that specific information, but here's what I know..."
- Never make up technical specifications or component details
- When unsure, guide them to test and observe rather than guess
- Keep responses concise (3-5 paragraphs) but thorough
- End with 1-2 reflection questions to keep the student thinking.`;

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
