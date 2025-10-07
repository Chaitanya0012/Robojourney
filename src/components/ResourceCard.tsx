import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen } from "lucide-react";

interface ResourceCardProps {
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  type: string;
}

const ResourceCard = ({ title, description, category, difficulty, type }: ResourceCardProps) => {
  const difficultyColors = {
    beginner: "bg-success/20 text-success",
    intermediate: "bg-warning/20 text-warning",
    advanced: "bg-destructive/20 text-destructive",
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 transition-all hover:shadow-card-hover hover:border-primary/50 hover:-translate-y-1 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <BookOpen className="h-5 w-5 text-primary" />
        <Badge variant="outline" className="text-xs">
          {type}
        </Badge>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          <Badge className={`text-xs ${difficultyColors[difficulty]}`}>
            {difficulty}
          </Badge>
        </div>
        <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ResourceCard;
