import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCollaboration } from "@/hooks/useCollaboration";
import { Users } from "lucide-react";

const CollaborationDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    project_description: "",
    skills: "",
  });

  const { createCollaboration } = useCollaboration();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.project_description) {
      return;
    }

    createCollaboration.mutate(formData, {
      onSuccess: () => {
        setFormData({
          name: "",
          email: "",
          project_description: "",
          skills: "",
        });
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground shadow-glow-cyan border border-primary/30"
        >
          <Users className="mr-2 h-5 w-5" />
          Post Collaboration Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] bg-card/95 backdrop-blur-xl border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl">Join the Collaboration Board</DialogTitle>
          <DialogDescription>
            Share what you're working on and connect with potential collaborators
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
              className="bg-background/50 border-border/50 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              required
              className="bg-background/50 border-border/50 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project">What are you working on? *</Label>
            <Textarea
              id="project"
              value={formData.project_description}
              onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
              placeholder="Building an autonomous robot that can navigate indoor environments..."
              required
              className="bg-background/50 border-border/50 focus:border-primary min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills you're looking for (optional)</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g., CAD modeling, Python, Circuit design"
              className="bg-background/50 border-border/50 focus:border-primary"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan"
            disabled={createCollaboration.isPending}
          >
            {createCollaboration.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationDialog;
