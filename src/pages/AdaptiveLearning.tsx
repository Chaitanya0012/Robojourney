import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, TrendingUp, Clock, Award, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSkillAssessment } from "@/hooks/useSkillAssessment";
import { useAdaptiveLearning } from "@/hooks/useAdaptiveLearning";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { SkillAssessmentDialog } from "@/components/SkillAssessmentDialog";
import { SpacedRepetitionReview } from "@/components/SpacedRepetitionReview";
import { motion } from "framer-motion";

const AdaptiveLearning = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAssessment, setShowAssessment] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedCategory] = useState("Robotics");

  const { currentLevel, isLoading: levelLoading } = useSkillAssessment(selectedCategory);
  const { 
    skillLevel, 
    recentPerformance, 
    getAdaptiveDifficulty,
    isLoading: adaptiveLoading 
  } = useAdaptiveLearning(selectedCategory);
  const { dueForReview, errorPatterns } = useSpacedRepetition();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Show assessment if user hasn't been assessed yet
    if (!levelLoading && !currentLevel && user) {
      setShowAssessment(true);
    }
  }, [currentLevel, levelLoading, user]);

  if (!user) return null;

  const isLoading = levelLoading || adaptiveLoading;
  const recommendedDifficulty = getAdaptiveDifficulty();
  const totalReviewItems = dueForReview.length + errorPatterns.length;

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-500';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500';
      case 'advanced': return 'bg-red-500/10 text-red-500';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Adaptive Learning Dashboard</h1>
          <p className="text-muted-foreground">
            Personalized learning experience based on your skill level and performance
          </p>
        </div>

        {showReview ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SpacedRepetitionReview onComplete={() => setShowReview(false)} />
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Level Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Your Skill Level</h2>
                      <p className="text-sm text-muted-foreground">{selectedCategory}</p>
                    </div>
                  </div>
                  {currentLevel && (
                    <Badge className={getLevelColor(currentLevel.skill_level)}>
                      {currentLevel.skill_level.charAt(0).toUpperCase() + currentLevel.skill_level.slice(1)}
                    </Badge>
                  )}
                </div>

                {!currentLevel ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      Complete a skill assessment to get started with personalized learning
                    </p>
                    <Button onClick={() => setShowAssessment(true)}>
                      Start Assessment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground mb-1">Recommended Level</div>
                        <div className="text-2xl font-bold">{recommendedDifficulty}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground mb-1">Recent Accuracy</div>
                        <div className="text-2xl font-bold">
                          {recentPerformance?.accuracy.toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => setShowAssessment(true)}
                      className="w-full"
                    >
                      Retake Assessment
                    </Button>
                  </div>
                )}
              </Card>

              {/* Performance Overview */}
              {recentPerformance && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-secondary/10">
                      <TrendingUp className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Recent Performance</h2>
                      <p className="text-sm text-muted-foreground">Last 10 attempts</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span className="font-medium">
                          {recentPerformance.correctAnswers} / {recentPerformance.totalAttempts}
                        </span>
                      </div>
                      <Progress value={recentPerformance.accuracy} className="h-3" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="text-xs text-green-500 mb-1">Correct</div>
                        <div className="text-xl font-bold text-green-500">
                          {recentPerformance.correctAnswers}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="text-xs text-red-500 mb-1">Incorrect</div>
                        <div className="text-xl font-bold text-red-500">
                          {recentPerformance.totalAttempts - recentPerformance.correctAnswers}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="text-xs text-primary mb-1">Accuracy</div>
                        <div className="text-xl font-bold text-primary">
                          {recentPerformance.accuracy.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid gap-3">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-4"
                    onClick={() => navigate('/quiz-dashboard')}
                  >
                    <Zap className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Start Adaptive Quiz</div>
                      <div className="text-sm text-muted-foreground">
                        Questions tailored to your {recommendedDifficulty} level
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-4"
                    onClick={() => navigate('/learn')}
                  >
                    <Target className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Browse Lessons</div>
                      <div className="text-sm text-muted-foreground">
                        Explore curated learning content
                      </div>
                    </div>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Spaced Repetition */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Review Due</h3>
                    <p className="text-xs text-muted-foreground">Spaced repetition</p>
                  </div>
                </div>

                {totalReviewItems > 0 ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                      <div className="text-3xl font-bold text-yellow-500 mb-1">
                        {totalReviewItems}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        question{totalReviewItems !== 1 ? 's' : ''} ready for review
                      </div>
                    </div>

                    {errorPatterns.length > 0 && (
                      <div className="p-3 rounded-lg bg-muted/50 text-sm">
                        <span className="font-medium">{errorPatterns.length}</span> question
                        {errorPatterns.length !== 1 ? 's' : ''} need extra practice
                      </div>
                    )}

                    <Button onClick={() => setShowReview(true)} className="w-full">
                      Start Review Session
                    </Button>
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No reviews due today. Keep learning!
                  </div>
                )}
              </Card>

              {/* Achievement Preview */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Award className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Your Progress</h3>
                    <p className="text-xs text-muted-foreground">Keep it up!</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Questions Answered</span>
                    <span className="font-bold">{recentPerformance?.totalAttempts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Current Streak</span>
                    <span className="font-bold">-</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      <SkillAssessmentDialog
        open={showAssessment}
        onOpenChange={setShowAssessment}
        category={selectedCategory}
        onComplete={() => {
          setShowAssessment(false);
        }}
      />
    </div>
  );
};

export default AdaptiveLearning;