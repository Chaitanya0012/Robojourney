import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Brain, Target, Zap } from "lucide-react";
import { useSkillAssessment, SkillLevel } from "@/hooks/useSkillAssessment";
import { motion, AnimatePresence } from "framer-motion";

interface SkillAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  onComplete?: () => void;
}

const diagnosticQuestions = [
  {
    id: 1,
    question: "How comfortable are you with basic programming concepts?",
    options: [
      { value: 1, label: "Never programmed before" },
      { value: 2, label: "Understand basic concepts" },
      { value: 3, label: "Can write simple programs" },
    ],
  },
  {
    id: 2,
    question: "Have you worked with electronics or circuits before?",
    options: [
      { value: 1, label: "No experience" },
      { value: 2, label: "Basic understanding" },
      { value: 3, label: "Built several projects" },
    ],
  },
  {
    id: 3,
    question: "How familiar are you with robotics competitions?",
    options: [
      { value: 1, label: "Never participated" },
      { value: 2, label: "Participated once" },
      { value: 3, label: "Regular competitor" },
    ],
  },
];

export const SkillAssessmentDialog = ({ 
  open, 
  onOpenChange, 
  category,
  onComplete 
}: SkillAssessmentDialogProps) => {
  const [assessmentType, setAssessmentType] = useState<'choice' | 'self' | 'diagnostic'>('choice');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('beginner');
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const { saveAssessment, isSaving } = useSkillAssessment(category);

  const handleSelfAssessment = () => {
    saveAssessment(
      { assessmentType: 'self', resultLevel: selectedLevel },
      {
        onSuccess: () => {
          onComplete?.();
          onOpenChange(false);
        },
      }
    );
  };

  const handleDiagnosticNext = () => {
    if (currentQuestion < diagnosticQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const totalScore = Object.values(diagnosticAnswers).reduce((sum, val) => sum + val, 0);
      const avgScore = totalScore / diagnosticQuestions.length;
      
      let resultLevel: SkillLevel = 'beginner';
      if (avgScore >= 2.5) resultLevel = 'advanced';
      else if (avgScore >= 1.7) resultLevel = 'intermediate';
      
      saveAssessment(
        { assessmentType: 'diagnostic', resultLevel, score: Math.round(avgScore * 100) },
        {
          onSuccess: () => {
            onComplete?.();
            onOpenChange(false);
          },
        }
      );
    }
  };

  const progress = ((currentQuestion + 1) / diagnosticQuestions.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Skill Assessment - {category}</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {assessmentType === 'choice' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              <p className="text-muted-foreground mb-6">
                Let's determine your current skill level to personalize your learning experience.
              </p>

              <div className="grid gap-4">
                <Card 
                  className="p-6 cursor-pointer hover:border-primary transition-all"
                  onClick={() => setAssessmentType('self')}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Self Assessment</h3>
                      <p className="text-sm text-muted-foreground">
                        Quick! Choose your experience level based on your own judgment.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-6 cursor-pointer hover:border-primary transition-all"
                  onClick={() => setAssessmentType('diagnostic')}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-secondary/10">
                      <Brain className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Diagnostic Quiz</h3>
                      <p className="text-sm text-muted-foreground">
                        Answer a few questions to accurately determine your level.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {assessmentType === 'self' && (
            <motion.div
              key="self"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 py-4"
            >
              <RadioGroup value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as SkillLevel)}>
                <div className="space-y-3">
                  <Card className="p-4 cursor-pointer hover:border-primary transition-all">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner" className="flex-1 cursor-pointer">
                        <div className="font-medium">Beginner</div>
                        <div className="text-sm text-muted-foreground">
                          New to robotics and programming
                        </div>
                      </Label>
                    </div>
                  </Card>

                  <Card className="p-4 cursor-pointer hover:border-primary transition-all">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
                        <div className="font-medium">Intermediate</div>
                        <div className="text-sm text-muted-foreground">
                          Some experience with projects and competitions
                        </div>
                      </Label>
                    </div>
                  </Card>

                  <Card className="p-4 cursor-pointer hover:border-primary transition-all">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="flex-1 cursor-pointer">
                        <div className="font-medium">Advanced</div>
                        <div className="text-sm text-muted-foreground">
                          Experienced competitor, strong technical skills
                        </div>
                      </Label>
                    </div>
                  </Card>
                </div>
              </RadioGroup>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setAssessmentType('choice')}>
                  Back
                </Button>
                <Button 
                  onClick={handleSelfAssessment} 
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? "Saving..." : "Continue"}
                </Button>
              </div>
            </motion.div>
          )}

          {assessmentType === 'diagnostic' && (
            <motion.div
              key="diagnostic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 py-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Question {currentQuestion + 1} of {diagnosticQuestions.length}</span>
                  <span className="text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  {diagnosticQuestions[currentQuestion].question}
                </h3>

                <RadioGroup
                  value={diagnosticAnswers[diagnosticQuestions[currentQuestion].id]?.toString()}
                  onValueChange={(v) => 
                    setDiagnosticAnswers({
                      ...diagnosticAnswers,
                      [diagnosticQuestions[currentQuestion].id]: parseInt(v)
                    })
                  }
                >
                  <div className="space-y-3">
                    {diagnosticQuestions[currentQuestion].options.map((option) => (
                      <Card key={option.value} className="p-4 cursor-pointer hover:border-primary transition-all">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={option.value.toString()} id={`opt-${option.value}`} />
                          <Label htmlFor={`opt-${option.value}`} className="flex-1 cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      </Card>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (currentQuestion > 0) {
                      setCurrentQuestion(currentQuestion - 1);
                    } else {
                      setAssessmentType('choice');
                    }
                  }}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleDiagnosticNext}
                  disabled={!diagnosticAnswers[diagnosticQuestions[currentQuestion].id] || isSaving}
                  className="flex-1"
                >
                  {currentQuestion === diagnosticQuestions.length - 1 
                    ? (isSaving ? "Calculating..." : "Complete Assessment")
                    : "Next"
                  }
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};