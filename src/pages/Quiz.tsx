import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import QuizCard from "@/components/QuizCard";
import QuizResults from "@/components/QuizResults";
import { useQuiz, QuizQuestion } from "@/hooks/useQuiz";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Flame, TrendingUp, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Quiz = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { questions, questionsLoading, stats, streak, submitAttempt } = useQuiz();
  
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{ correct: boolean; xp: number }[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const startQuiz = (count: number = 10) => {
    if (!questions || questions.length === 0) return;
    
    // Shuffle and select questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, questions.length));
    
    setQuizQuestions(selected);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizStarted(true);
    setShowResults(false);
  };

  const handleAnswer = async (selectedAnswer: string, isCorrect: boolean, timeTaken: number) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    
    // Calculate XP based on difficulty and time
    let xpEarned = 0;
    if (isCorrect) {
      switch (currentQuestion.difficulty) {
        case "Easy":
          xpEarned = 10;
          break;
        case "Medium":
          xpEarned = 20;
          break;
        case "Hard":
          xpEarned = 30;
          break;
      }
      
      // Bonus for fast answers
      if (timeTaken < 10) xpEarned += 5;
    }

    // Submit to database
    await submitAttempt.mutateAsync({
      question_id: currentQuestion.id,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      xp_earned: xpEarned,
      time_taken: timeTaken,
    });

    setAnswers([...answers, { correct: isCorrect, xp: xpEarned }]);

    // Move to next question or show results
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 100);
    } else {
      setTimeout(() => {
        setShowResults(true);
      }, 100);
    }
  };

  const handleRetry = () => {
    startQuiz(quizQuestions.length);
  };

  if (!user) return null;

  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-cosmic">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto p-12 glass-card text-center">
            <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">No Quiz Questions Available</h2>
            <p className="text-muted-foreground mb-6">
              Check back later for new quiz questions!
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctCount = answers.filter(a => a.correct).length;
    const totalXP = answers.reduce((sum, a) => sum + a.xp, 0);
    const accuracy = Math.round((correctCount / answers.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-cosmic">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <QuizResults
            score={correctCount}
            totalQuestions={answers.length}
            xpEarned={totalXP}
            accuracy={accuracy}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  if (quizStarted) {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gradient-cosmic">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <QuizCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={quizQuestions.length}
            />
          </div>
        </div>
      </div>
    );
  }

  // Quiz start screen
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 animate-reveal">
            <div className="inline-block px-4 py-2 glass-card rounded-full mb-4">
              <span className="text-sm font-medium text-primary">Test Your Knowledge</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold">
              Robotics{" "}
              <span className="text-shimmer">Quiz Challenge</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Master robotics concepts through interactive questions and earn XP as you learn
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 glass-card glow-border hover-lift animate-scale-in">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl premium-gradient">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.total_attempts || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Attempts</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 glass-card glow-border hover-lift animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl premium-gradient">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.accuracy_percentage || 0}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 glass-card glow-border hover-lift animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl premium-gradient">
                  <Flame className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{streak?.current_streak || 0}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 glass-card glow-border hover-lift animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl premium-gradient">
                  <Brain className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.total_quiz_xp || 0}</div>
                  <div className="text-sm text-muted-foreground">Quiz XP</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quiz Options */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-8 glass-card glow-border hover-lift cursor-pointer group animate-scale-in" style={{ animationDelay: '0.4s' }} onClick={() => startQuiz(5)}>
              <Badge className="bg-success/20 text-success mb-4">Quick</Badge>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">5 Questions</h3>
              <p className="text-muted-foreground mb-6">Perfect for a quick knowledge check</p>
              <Button className="w-full bg-success hover:bg-success/90">
                <Play className="mr-2 h-4 w-4" />
                Start Quiz
              </Button>
            </Card>

            <Card className="p-8 glass-card glow-border hover-lift cursor-pointer group animate-scale-in border-primary/50" style={{ animationDelay: '0.5s' }} onClick={() => startQuiz(10)}>
              <Badge className="bg-primary/20 text-primary mb-4">Standard</Badge>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">10 Questions</h3>
              <p className="text-muted-foreground mb-6">Recommended for balanced practice</p>
              <Button className="w-full bg-primary hover:bg-primary/90 shadow-glow-cyan">
                <Play className="mr-2 h-4 w-4" />
                Start Quiz
              </Button>
            </Card>

            <Card className="p-8 glass-card glow-border hover-lift cursor-pointer group animate-scale-in" style={{ animationDelay: '0.6s' }} onClick={() => startQuiz(20)}>
              <Badge className="bg-destructive/20 text-destructive mb-4">Challenge</Badge>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">20 Questions</h3>
              <p className="text-muted-foreground mb-6">Ultimate test of your knowledge</p>
              <Button className="w-full bg-destructive hover:bg-destructive/90">
                <Play className="mr-2 h-4 w-4" />
                Start Quiz
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
