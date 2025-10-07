import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  title: string;
  progress: number;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "success";
}

const ProgressCard = ({ title, progress, icon, color = "primary" }: ProgressCardProps) => {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 border-primary/30",
    secondary: "from-secondary/20 to-secondary/5 border-secondary/30",
    success: "from-success/20 to-success/5 border-success/30",
  };

  return (
    <Card className={`p-6 bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border transition-all hover:shadow-card-hover hover:scale-105 animate-slide-up`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground text-right">{progress}% complete</p>
      </div>
    </Card>
  );
};

export default ProgressCard;
