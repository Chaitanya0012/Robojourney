import { Card } from "@/components/ui/card";
import { Award, Zap, Target, Trophy, Star } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  award: Award,
  zap: Zap,
  target: Target,
  trophy: Trophy,
  star: Star,
};

const BadgeDisplay = ({ badge }: { badge: Badge }) => {
  const Icon = iconMap[badge.icon] || Award;
  
  return (
    <Card
      className={`p-4 text-center transition-all hover:scale-110 ${
        badge.earned
          ? "bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/50 shadow-glow-cyan"
          : "bg-muted/20 border-muted opacity-50"
      }`}
    >
      <div className={`inline-flex p-3 rounded-full mb-2 ${badge.earned ? "bg-primary/20" : "bg-muted"}`}>
        <Icon className={`h-6 w-6 ${badge.earned ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
      <p className="text-xs text-muted-foreground">{badge.description}</p>
    </Card>
  );
};

export default BadgeDisplay;
