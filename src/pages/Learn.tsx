import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, ArrowLeft, GraduationCap } from "lucide-react";
import { useLessons } from "@/hooks/useLessons";
import LessonCard from "@/components/LessonCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LEVELS = [
  { level: 0, title: "Level 0: Absolute Basics", description: "Start your robotics journey" },
  { level: 1, title: "Level 1: Mechatronics Foundations", description: "Master the fundamentals" },
  { level: 2, title: "Level 2: Control Systems", description: "Learn feedback and control" },
  { level: 3, title: "Level 3: Embedded Programming", description: "Code for real-time systems" },
  { level: 4, title: "Level 4: AI & Perception", description: "Autonomous decision making" },
  { level: 5, title: "Level 5: Advanced Research", description: "MIT graduate level topics" },
];

const Learn = () => {
  const navigate = useNavigate();
  const { lessons, isLoading, completeLesson, isLessonCompleted, getLevelCompletion } = useLessons();
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [lessonStartTime, setLessonStartTime] = useState<number>(0);

  const levelLessons = lessons?.filter(l => l.level === selectedLevel) || [];

  const handleStartLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setLessonStartTime(Date.now());
  };

  const handleCompleteLesson = () => {
    if (selectedLesson) {
      const timeSpent = Math.floor((Date.now() - lessonStartTime) / 1000);
      completeLesson.mutate({ lessonId: selectedLesson.id, timeSpent });
      setSelectedLesson(null);
    }
  };

  const isLessonLocked = (lesson: any) => {
    // First lesson of level 0 is always unlocked
    if (lesson.level === 0 && lesson.order_index === 0) return false;
    
    // Check if previous lesson is completed
    const prevLesson = lessons?.find(
      l => l.level === lesson.level && l.order_index === lesson.order_index - 1
    );
    
    if (prevLesson && !isLessonCompleted(prevLesson.id)) return true;

    // Check if previous level is completed (at least 80%)
    if (lesson.order_index === 0 && lesson.level > 0) {
      const prevLevelCompletion = getLevelCompletion(lesson.level - 1);
      return prevLevelCompletion < 80;
    }

    return false;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="premium-gradient border-b border-border/50">
        <div className="container mx-auto p-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Learning Path</h1>
              <p className="text-lg text-muted-foreground">
                Master robotics from basics to MIT research level
              </p>
            </div>
          </div>

          {/* Level Progress Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {LEVELS.map((level) => {
              const completion = getLevelCompletion(level.level);
              return (
                <Card
                  key={level.level}
                  className={`p-4 cursor-pointer transition-all hover-lift ${
                    selectedLevel === level.level ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedLevel(level.level)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Level {level.level}</Badge>
                    {completion === 100 && (
                      <Trophy className="h-4 w-4 text-warning" />
                    )}
                  </div>
                  <Progress value={completion} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">{completion}% Complete</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lessons for Selected Level */}
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {LEVELS[selectedLevel].title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {LEVELS[selectedLevel].description}
          </p>
        </div>

        {levelLessons.length === 0 ? (
          <Card className="p-12 text-center glass-card">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Lessons Coming Soon</h3>
            <p className="text-muted-foreground">
              We're preparing amazing content for this level. Check back soon!
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {levelLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={isLessonCompleted(lesson.id)}
                isLocked={isLessonLocked(lesson)}
                onStart={() => handleStartLesson(lesson)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lesson Content Dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedLesson?.title}</DialogTitle>
            <DialogDescription className="text-base">
              {selectedLesson?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Learning Objectives */}
            {selectedLesson?.learning_objectives?.length > 0 && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Learning Objectives
                </h4>
                <ul className="space-y-2">
                  {selectedLesson.learning_objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">✓</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lesson Content */}
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedLesson?.content || '' }} />
            </div>

            {/* Complete Button */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleCompleteLesson}
                className="flex-1"
                size="lg"
              >
                Mark as Complete
              </Button>
              <Button
                onClick={() => navigate('/quiz')}
                variant="outline"
                size="lg"
              >
                Test Your Knowledge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Learn;
