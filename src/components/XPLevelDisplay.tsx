import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star } from "lucide-react";
import { LEVEL_THRESHOLDS } from "@/hooks/useXP";

interface XPLevelDisplayProps {
  totalXP: number;
  currentLevel: number;
  compact?: boolean;
}

export const XPLevelDisplay = ({ totalXP, currentLevel, compact = false }: XPLevelDisplayProps) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="font-semibold">Lvl {currentLevel}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-secondary" />
          <span className="text-sm text-muted-foreground">{totalXP.toLocaleString()} XP</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/5 border-primary/20">
      <h3 className="text-lg font-semibold mb-4">Level Progression</h3>
      <div className="space-y-3">
        {LEVEL_THRESHOLDS.map((level) => {
          const isUnlocked = totalXP >= level.xp;
          const isCurrent = currentLevel === level.level;
          
          return (
            <div
              key={level.level}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-primary/20 border border-primary/40'
                  : isUnlocked
                  ? 'bg-card/50'
                  : 'bg-muted/20 opacity-50'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isUnlocked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {level.level}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${isCurrent ? 'text-primary' : ''}`}>
                  {level.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {level.xp.toLocaleString()} XP
                </p>
              </div>
              {isCurrent && (
                <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
              )}
              {isUnlocked && !isCurrent && (
                <Star className="h-5 w-5 text-secondary flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
