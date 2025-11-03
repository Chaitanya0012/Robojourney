import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CheckCircle2, Lock } from "lucide-react";
import { Lesson } from "@/hooks/useLessons";

interface LessonCardProps {
  lesson: Lesson;
  isCompleted: boolean;
  isLocked: boolean;
  onStart: () => void;
}

const LessonCard = ({ lesson, isCompleted, isLocked, onStart }: LessonCardProps) => {
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

  return (
    <Card className={`p-6 glass-card transition-all hover-lift ${isLocked ? 'opacity-50' : ''} ${isCompleted ? 'glow-border' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isCompleted ? 'bg-success/20' : 'bg-primary/10'}`}>
            {isLocked ? (
              <Lock className="h-6 w-6 text-muted-foreground" />
            ) : isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-success" />
            ) : (
              <BookOpen className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold">{lesson.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {lesson.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="text-sm">
          {lesson.category}
        </Badge>
        <Badge className={`text-sm ${getDifficultyColor(lesson.difficulty)}`}>
          {lesson.difficulty}
        </Badge>
        <Badge variant="outline" className="text-sm flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {lesson.estimated_time} min
        </Badge>
        {isCompleted && (
          <Badge className="bg-success/20 text-success">
            ✓ Completed
          </Badge>
        )}
      </div>

      {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">You'll learn:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {lesson.learning_objectives.slice(0, 3).map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        onClick={onStart}
        disabled={isLocked}
        className="w-full"
        variant={isCompleted ? "outline" : "default"}
      >
        {isLocked ? "🔒 Locked" : isCompleted ? "Review Lesson" : "Start Learning"}
      </Button>
    </Card>
  );
};

export default LessonCard;
