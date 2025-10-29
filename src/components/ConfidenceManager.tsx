import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useConfidence } from "@/hooks/useConfidence";
import { useXP, XP_REWARDS } from "@/hooks/useXP";
import { useState } from "react";

export const ConfidenceManager = () => {
  const { confidence, updateConfidence } = useConfidence();
  const { addXP } = useXP();
  const [localLevels, setLocalLevels] = useState<Record<string, number>>({});

  const handleSliderChange = (id: string, value: number[]) => {
    setLocalLevels(prev => ({ ...prev, [id]: value[0] }));
  };

  const handleUpdate = (id: string, name: string) => {
    const newLevel = localLevels[id];
    if (newLevel !== undefined) {
      updateConfidence({ id, level: newLevel });
      addXP({
        activityType: 'update_confidence',
        xpAmount: XP_REWARDS.update_confidence,
        description: `Updated ${name} confidence to ${newLevel}%`,
      });
      setLocalLevels(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <h3 className="text-lg font-semibold mb-4">Update Your Confidence Levels</h3>
      {confidence.length === 0 ? (
        <p className="text-muted-foreground text-center">No confidence levels tracked yet.</p>
      ) : (
        <div className="space-y-6">
          {confidence.map((item) => {
            const currentLevel = localLevels[item.id] ?? item.level;
            const hasChanged = localLevels[item.id] !== undefined;
            
            return (
              <div key={item.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">{currentLevel}%</span>
                </div>
                <Slider
                  value={[currentLevel]}
                  onValueChange={(value) => handleSliderChange(item.id, value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                {hasChanged && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(item.id, item.name)}
                    className="w-full"
                  >
                    Save {item.name} ({XP_REWARDS.update_confidence} XP)
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
