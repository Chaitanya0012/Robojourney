import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen, Star, Video, FileText, GraduationCap } from "lucide-react";

interface ResourceCardProps {
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  type: string;
  rating?: number;
  ratingCount?: number;
  url?: string;
}

const ResourceCard = ({ title, description, category, difficulty, type, rating = 0, ratingCount = 0, url }: ResourceCardProps) => {
  const difficultyColors = {
    beginner: "bg-success/20 text-success",
    intermediate: "bg-warning/20 text-warning",
    advanced: "bg-destructive/20 text-destructive",
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'course':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div onClick={handleClick} className={url ? "cursor-pointer" : ""}>
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 transition-all hover:shadow-glow-cyan hover:border-primary/50 hover:-translate-y-1 animate-fade-in group h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="text-primary group-hover:animate-glow-pulse">
            {getTypeIcon(type)}
          </div>
          <Badge variant="outline" className="text-xs">
            {type}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold flex-1">{title}</h3>
          {url && <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        {ratingCount > 0 && (
          <div className="flex items-center gap-1 mb-3 text-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({ratingCount} reviews)</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
            <Badge className={`text-xs ${difficultyColors[difficulty]}`}>
              {difficulty}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResourceCard;
