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
  isApproved?: boolean;
  submittedByYou?: boolean;
}

const ResourceCard = ({ title, description, category, difficulty, type, rating = 0, ratingCount = 0, url, isApproved = true, submittedByYou = false }: ResourceCardProps) => {
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

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 transition-all hover:shadow-glow-cyan hover:border-primary/50 animate-fade-in group h-full">
      {!isApproved && (
        <div className="mb-3 text-xs font-semibold text-amber-600 bg-amber-100/60 border border-amber-200 px-3 py-2 rounded-md">
          Pending admin approval {submittedByYou ? "• you will be notified when it's live" : ""}
        </div>
      )}
      {type.toLowerCase() === 'video' && (
        <div className="mb-3 text-xs text-muted-foreground bg-muted/60 border border-border/50 rounded-md px-3 py-2">
          Please copy this video link into your browser to view it without player errors.
        </div>
      )}
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
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
      {url && (
        <div className="mb-4 p-3 bg-muted/50 rounded-md border border-border/50 space-y-2">
          <p className="text-xs text-muted-foreground">Trusted external link</p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer noopener"
              referrerPolicy="no-referrer"
              className="text-sm font-semibold text-primary hover:underline break-all"
            >
              {url}
            </a>
            <Button asChild size="sm" variant="secondary" className="group">
              <a
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                referrerPolicy="no-referrer"
                className="inline-flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-1 group-hover:animate-glow-pulse" />
                Open
              </a>
            </Button>
          </div>
        </div>
      )}
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
  );
};

export default ResourceCard;
