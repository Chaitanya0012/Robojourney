import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";

export const NewProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const { createProject } = useProjects();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    roadmap: "",
    help_request: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createProject({
      title: formData.title,
      description: formData.description,
      progress: 0,
      icon: 'target',
      color: 'primary',
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      roadmap: formData.roadmap,
      help_request: formData.help_request,
    });

    setFormData({
      title: "",
      description: "",
      deadline: "",
      roadmap: "",
      help_request: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start border-border/50">
          <Target className="mr-2 h-4 w-4" />
          Start New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start a New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">What am I working on?</Label>
            <Input
              id="title"
              placeholder="Project title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your project..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">By when do I want to finish this?</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roadmap">What is my roadmap to completion?</Label>
            <Textarea
              id="roadmap"
              placeholder="List the steps or milestones you need to achieve..."
              value={formData.roadmap}
              onChange={(e) => setFormData({ ...formData, roadmap: e.target.value })}
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="help_request">How can we help you in your project?</Label>
            <Textarea
              id="help_request"
              placeholder="What kind of support or resources do you need?"
              value={formData.help_request}
              onChange={(e) => setFormData({ ...formData, help_request: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" className="w-full">
            Create Project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
