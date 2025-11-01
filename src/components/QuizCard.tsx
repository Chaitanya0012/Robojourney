import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Lightbulb, Clock } from "lucide-react";
import { QuizQuestion } from "@/hooks/useQuiz";

interface QuizCardProps {
  question: QuizQuestion;
  onAnswer: (selectedAnswer: string, isCorrect: boolean, timeTaken: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

const QuizCard = ({ question, onAnswer, questionNumber, totalQuestions }: QuizCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    const isCorrect = selectedAnswer === question.correct_answer;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    setShowResult(true);
    
    setTimeout(() => {
      onAnswer(selectedAnswer, isCorrect, timeTaken);
    }, 2500);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success/20 text-success";
      case "Medium":
        return "bg-warning/20 text-warning";
      case "Hard":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted";
    }
  };

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      if (selectedAnswer === option) {
        return "border-primary bg-primary/10 scale-[1.02]";
      }
      return "border-border/50 hover:border-primary/50 hover:bg-primary/5";
    }

    if (option === question.correct_answer) {
      return "border-success bg-success/10 scale-[1.02]";
    }
    
    if (selectedAnswer === option && option !== question.correct_answer) {
      return "border-destructive bg-destructive/10";
    }

    return "border-border/30 opacity-50";
  };

  return (
    <Card className="p-8 glass-card glow-border animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {question.category}
          </Badge>
          <Badge className={`text-sm ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{timeElapsed}s</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {questionNumber} of {totalQuestions}</span>
          <span>{Math.round((questionNumber / totalQuestions) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-2xl font-bold mb-8 leading-relaxed">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            disabled={showResult}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-300 ${getOptionStyle(option)} ${!showResult && 'hover-lift cursor-pointer'}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                {String.fromCharCode(65 + index)}
              </div>
              <span className="text-lg">{option}</span>
              {showResult && option === question.correct_answer && (
                <CheckCircle2 className="ml-auto h-6 w-6 text-success animate-scale-in" />
              )}
              {showResult && selectedAnswer === option && option !== question.correct_answer && (
                <XCircle className="ml-auto h-6 w-6 text-destructive animate-scale-in" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className="p-5 rounded-xl premium-gradient border border-primary/30 animate-reveal">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-2">Explanation</h4>
              <p className="text-muted-foreground leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!showResult && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          size="lg"
          className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan text-lg py-6"
        >
          Submit Answer
        </Button>
      )}
    </Card>
  );
};

export default QuizCard;
