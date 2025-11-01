import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, TrendingUp, RotateCcw, Home } from "lucide-react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  xpEarned: number;
  accuracy: number;
  onRetry: () => void;
}

const QuizResults = ({ score, totalQuestions, xpEarned, accuracy, onRetry }: QuizResultsProps) => {
  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceLevel = () => {
    if (accuracy >= 90) return { title: "RoboMaster", color: "text-primary", icon: Trophy };
    if (accuracy >= 70) return { title: "Innovator", color: "text-secondary", icon: Target };
    if (accuracy >= 50) return { title: "Builder", color: "text-accent", icon: TrendingUp };
    return { title: "Beginner", color: "text-muted-foreground", icon: Zap };
  };

  const performance = getPerformanceLevel();
  const PerformanceIcon = performance.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-reveal">
      {/* Main Results Card */}
      <Card className="p-12 glass-card glow-border text-center">
        <div className="inline-flex p-6 rounded-full premium-gradient mb-6 animate-float">
          <PerformanceIcon className={`h-16 w-16 ${performance.color}`} />
        </div>
        
        <h2 className="text-4xl font-bold mb-2">Quiz Complete!</h2>
        <p className={`text-2xl mb-8 ${performance.color}`}>{performance.title}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-xl premium-gradient">
            <div className="text-4xl font-bold text-primary mb-2">{score}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="p-6 rounded-xl premium-gradient">
            <div className="text-4xl font-bold text-secondary mb-2">{totalQuestions}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="p-6 rounded-xl premium-gradient">
            <div className="text-4xl font-bold text-accent mb-2">{accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
          <div className="p-6 rounded-xl premium-gradient">
            <div className="text-4xl font-bold text-warning mb-2">+{xpEarned}</div>
            <div className="text-sm text-muted-foreground">XP Earned</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRetry}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan px-8"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Link to="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="glass-card border-primary/30 hover:bg-primary/10 px-8"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Card>

      {/* Encouragement Message */}
      <Card className="p-8 glass-card border-primary/30 text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <p className="text-lg text-muted-foreground">
          {accuracy >= 90 && "🎉 Outstanding performance! You're a robotics expert!"}
          {accuracy >= 70 && accuracy < 90 && "💪 Great job! Keep up the excellent work!"}
          {accuracy >= 50 && accuracy < 70 && "🌟 Good effort! Practice makes perfect!"}
          {accuracy < 50 && "📚 Keep learning! Review the concepts and try again!"}
        </p>
      </Card>
    </div>
  );
};

export default QuizResults;
