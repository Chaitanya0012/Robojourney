import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, Brain } from "lucide-react";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const MistakesList = () => {
  const { errorPatterns } = useSpacedRepetition();
  const [selectedMistake, setSelectedMistake] = useState<any>(null);
  const [tutorResponse, setTutorResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGetHelp = async (mistake: any) => {
    setSelectedMistake(mistake);
    setIsLoading(true);
    setTutorResponse("");

    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          question: mistake.quiz_questions?.question,
          userAnswer: "N/A",
          correctAnswer: mistake.quiz_questions?.correct_answer,
          explanation: mistake.quiz_questions?.explanation,
          prompt: "Guide the student with questions and hints instead of giving the answer outright."
        }
      });

      if (error) throw error;
      setTutorResponse(data.response);
    } catch (error: any) {
      console.error("Error getting tutor help:", error);
      toast.error(error.message || "Failed to get help from AI tutor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeAll = async () => {
    if (!errorPatterns || errorPatterns.length === 0) return;
    
    setSelectedMistake({ category: "Pattern Analysis" });
    setIsLoading(true);
    setTutorResponse("");

    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          mistakes: errorPatterns,
          prompt: "Offer a plan with guiding questions and reflective prompts so the student can self-correct recurring mistakes."
        }
      });

      if (error) throw error;
      setTutorResponse(data.response);
    } catch (error: any) {
      console.error("Error analyzing patterns:", error);
      toast.error(error.message || "Failed to analyze mistakes");
    } finally {
      setIsLoading(false);
    }
  };

  if (!errorPatterns || errorPatterns.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Mistakes Yet!</h3>
        <p className="text-muted-foreground">
          You haven't made any mistakes. Keep up the great work!
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Mistakes</h2>
          <Button onClick={handleAnalyzeAll} variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            Analyze All
          </Button>
        </div>

        <div className="grid gap-4">
          {errorPatterns.map((mistake) => (
            <Card key={mistake.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{mistake.category}</Badge>
                    <Badge variant="secondary" className="gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {mistake.incorrect_count}x
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-2">
                    {mistake.quiz_questions?.question}
                  </p>
                  {mistake.last_incorrect && (
                    <p className="text-xs text-muted-foreground">
                      Last mistake: {new Date(mistake.last_incorrect).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleGetHelp(mistake)}
                  variant="outline"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Get Help
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedMistake} onOpenChange={() => setSelectedMistake(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Tutor Help
            </DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">AI tutor is analyzing...</p>
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{tutorResponse}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
