import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFeedback } from "@/hooks/useFeedback";
import { useAuth } from "@/contexts/AuthContext";

const Feedback = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { feedback, createFeedback, isLoading } = useFeedback();
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    type: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFeedback({
      type: formData.type,
      subject: formData.subject,
      message: formData.message,
      rating: rating,
      is_anonymous: true,
    });
    setFormData({ type: "", subject: "", message: "" });
    setRating(0);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const approvedFeedback = feedback.filter(f => f.is_approved);

  const StarRating = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className="transition-all hover:scale-110"
        >
          <Star
            className={`h-6 w-6 ${
              star <= rating ? "fill-primary text-primary" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8 animate-slide-up text-center">
            <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Share Your Feedback</h1>
            <p className="text-muted-foreground">Help us improve your RoboJourney experience</p>
          </div>

          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">Feedback Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type" className="bg-background/50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop Feedback</SelectItem>
                    <SelectItem value="project">Project Feedback</SelectItem>
                    <SelectItem value="mentor">Mentor Feedback</SelectItem>
                    <SelectItem value="general">General Suggestion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What's this about?"
                  className="bg-background/50"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <StarRating />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Feedback</Label>
                <Textarea
                  id="message"
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  className="min-h-[150px] bg-background/50"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan"
                size="lg"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </form>
          </Card>

          {/* Recent Feedback Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Recent Community Feedback</h2>
            {approvedFeedback.length === 0 ? (
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <p className="text-muted-foreground text-center">No approved feedback yet.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvedFeedback.slice(0, 5).map((item, index) => (
                  <Card
                    key={item.id}
                    className="p-4 bg-card/30 backdrop-blur-sm border-border/50 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold">{item.is_anonymous ? "Anonymous" : "Community Member"}</p>
                      <div className="flex">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-medium mb-1">{item.subject}</p>
                    <p className="text-sm text-muted-foreground">{item.message}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
