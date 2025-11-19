import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ReviewPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const { dueForReview, errorPatterns } = useSpacedRepetition();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalReviews = (dueForReview?.length || 0) + (errorPatterns?.length || 0);

  useEffect(() => {
    // Only check once per session and only if user is logged in
    if (user && !hasChecked && totalReviews > 0) {
      // Delay showing the prompt slightly to avoid blocking login
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasChecked(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, hasChecked, totalReviews]);

  const handleReviewNow = () => {
    setIsOpen(false);
    navigate("/adaptive-learning");
  };

  const handleReviewLater = () => {
    setIsOpen(false);
  };

  if (!user || totalReviews === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Review Time! 🎯</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            You have <Badge variant="secondary" className="mx-1">{totalReviews}</Badge> 
            question{totalReviews !== 1 ? 's' : ''} ready for review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {dueForReview && dueForReview.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm">Scheduled Reviews</p>
                <p className="text-sm text-muted-foreground">
                  {dueForReview.length} question{dueForReview.length !== 1 ? 's' : ''} due for spaced repetition
                </p>
              </div>
            </div>
          )}

          {errorPatterns && errorPatterns.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm">Practice Mistakes</p>
                <p className="text-sm text-muted-foreground">
                  {errorPatterns.length} question{errorPatterns.length !== 1 ? 's' : ''} you've struggled with
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Regular review helps strengthen your memory and prevent forgetting! 🧠
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleReviewLater} className="w-full sm:w-auto">
            Later
          </Button>
          <Button onClick={handleReviewNow} className="w-full sm:w-auto">
            Review Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
