import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, TrendingUp } from "lucide-react";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { motion, AnimatePresence } from "framer-motion";

interface SpacedRepetitionReviewProps {
  onComplete?: () => void;
}

export const SpacedRepetitionReview = ({ onComplete }: SpacedRepetitionReviewProps) => {
  const { dueForReview, errorPatterns, recordAnswer } = useSpacedRepetition();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const allReviewItems = [
    ...dueForReview,
    ...errorPatterns.filter(ep => 
      !dueForReview.find(dr => dr.question_id === ep.question_id)
    )
  ];

  if (allReviewItems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
        <p className="text-muted-foreground mb-6">
          No questions are due for review right now. Great job staying on top of your learning!
        </p>
        <Button onClick={onComplete}>Continue Learning</Button>
      </Card>
    );
  }

  const currentItem = allReviewItems[currentIndex];
  const question = (currentItem as any).quiz_questions;
  const progress = ((reviewedCount + 1) / allReviewItems.length) * 100;

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === question.correct_answer;
    
    recordAnswer({
      questionId: question.id,
      isCorrect,
      category: question.category,
    });

    setShowResult(true);
  };

  const handleNext = () => {
    setReviewedCount(reviewedCount + 1);
    
    if (currentIndex < allReviewItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      onComplete?.();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-500';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'Hard': return 'bg-red-500/10 text-red-500';
      default: return 'bg-primary/10 text-primary';
    }
  };

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return option === selectedAnswer
        ? 'border-primary bg-primary/10'
        : 'border-border hover:border-primary/50';
    }

    const isCorrect = option === question.correct_answer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) return 'border-green-500 bg-green-500/10';
    if (isSelected && !isCorrect) return 'border-red-500 bg-red-500/10';
    return 'border-border opacity-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Spaced Repetition Review</h3>
            <p className="text-sm text-muted-foreground">
              {allReviewItems.length} question{allReviewItems.length !== 1 ? 's' : ''} due for review
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {reviewedCount + 1} / {allReviewItems.length}
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{question.category}</Badge>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                  </div>
                  <h4 className="text-lg font-medium">{question.question}</h4>
                </div>
              </div>

              <div className="space-y-3">
                {(JSON.parse(question.options) as string[]).map((option, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className={`w-full justify-start text-left h-auto py-3 px-4 ${getOptionStyle(option)}`}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                  >
                    <span className="flex items-center gap-3 w-full">
                      <span className="font-mono text-sm w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {showResult && option === question.correct_answer && (
                        <span className="text-green-500">✓</span>
                      )}
                      {showResult && option === selectedAnswer && option !== question.correct_answer && (
                        <span className="text-red-500">✗</span>
                      )}
                    </span>
                  </Button>
                ))}
              </div>

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg bg-muted/50"
                >
                  <h5 className="font-semibold mb-2">Explanation</h5>
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                </motion.div>
              )}
            </div>

            {showResult && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleNext}>
                  {currentIndex < allReviewItems.length - 1 ? 'Next Question' : 'Complete Review'}
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {(currentItem as any).incorrect_count > 0 && (
        <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-yellow-500" />
            <div className="text-sm">
              <span className="font-medium">Needs Extra Practice: </span>
              <span className="text-muted-foreground">
                You've missed this question {(currentItem as any).incorrect_count} time(s) before
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};