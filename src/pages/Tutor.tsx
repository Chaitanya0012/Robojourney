import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, Loader2 } from "lucide-react";
import { MistakesList } from "@/components/MistakesList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Tutor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (!user) {
      toast.error("Please sign in to use the AI Tutor");
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const coachingPrompt = `You are a robotics tutor who uses Socratic questioning and never gives the final answer outright. Ask short guiding questions, suggest approaches, and encourage the student to reason about their own code or math. Keep responses concise but inquisitive. Student message: ${input}`;

      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          prompt: coachingPrompt,
          userId: user.id,
          action: 'chat'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "I'm here to help with your robotics questions!"
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('AI Tutor error:', error);
      toast.error("Failed to get response from AI tutor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
            <Brain className="h-10 w-10 text-primary" />
            AI Robotics Tutor
          </h1>
          <p className="text-muted-foreground text-lg">
            Get personalized help with your mistakes and robotics concepts. The tutor won’t hand you answers — it will coach you to recall, test, and fix your own work.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chat Interface */}
          <Card className="p-6 flex flex-col h-[600px]">
            <h2 className="text-2xl font-bold mb-4">Chat with AI Tutor</h2>
            
            <ScrollArea className="flex-1 pr-4 mb-4">
              {!user ? (
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-semibold mb-2">Sign in to use AI Tutor</p>
                  <p className="text-sm">Please log in to chat with the AI tutor and get personalized help.</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Ask me anything about robotics!</p>
                  <p className="text-sm mt-2">I can help explain concepts, debug issues, or review your mistakes.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        msg.role === "user"
                          ? "bg-primary/10 ml-8"
                          : "bg-secondary mr-8"
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1 text-foreground">
                        {msg.role === "user" ? "You" : "AI Tutor"}
                      </p>
                      <p className="text-foreground whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>AI Tutor is thinking...</span>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a question or describe a problem..."
                className="resize-none"
                rows={2}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !user}
                size="icon"
                className="shrink-0"
                title={!user ? "Sign in to use AI Tutor" : "Send message"}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Mistakes List */}
          <Card className="p-6">
            <MistakesList />
          </Card>
        </div>
      </div>
    </div>
  );
}
