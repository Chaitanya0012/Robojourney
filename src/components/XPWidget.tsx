import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Target } from "lucide-react";
import { useXP } from "@/hooks/useXP";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const XPWidget = () => {
  const { userXP, activities, currentLevelTitle, progressToNextLevel, nextLevelXP } = useXP();

  if (!userXP) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 border-primary/30 shadow-glow-cyan">
      <div className="space-y-4">
        {/* Level Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Level {userXP.current_level}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{currentLevelTitle}</p>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {userXP.total_xp.toLocaleString()} XP
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {userXP.current_level + 1}</span>
            <span className="font-medium">{Math.floor(progressToNextLevel)}%</span>
          </div>
          <Progress value={progressToNextLevel} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            {(nextLevelXP - userXP.total_xp).toLocaleString()} XP to next level
          </p>
        </div>

        {/* Recent Activities */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full border-primary/50">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Activity History
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Recent XP Activities</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No activities yet</p>
                ) : (
                  activities.map((activity) => (
                    <Card key={activity.id} className="p-3 bg-card/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm capitalize">
                            {activity.activity_type.replace(/_/g, ' ')}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {activity.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          +{activity.xp_earned} XP
                        </Badge>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};
