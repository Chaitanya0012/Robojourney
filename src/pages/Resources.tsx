import { useState } from "react";
import Navigation from "@/components/Navigation";
import ResourceCard from "@/components/ResourceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResources } from "@/hooks/useResources";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { useXP, XP_REWARDS } from "@/hooks/useXP";

const Resources = () => {
  const { user } = useAuth();
  const { resources, isLoading, createResource, deleteResource, approveResource } = useResources({
    includePending: isModerator,
  });
  const { isModerator } = useUserRole();
  const { toast } = useToast();
  const { addXP } = useXP();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    category: "Programming",
    url: "",
    file_url: null,
    image_url: null,
    difficulty_level: "beginner",
    resource_type: "article",
  });

  const approvedResources = resources.filter((resource) => resource.is_approved);
  const pendingResources = resources.filter((resource) => !resource.is_approved);
  const baseResources = isModerator ? approvedResources : resources;

  const filteredResources = baseResources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (resource.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter;
    const matchesConfidence = confidenceFilter === "all" || resource.category === confidenceFilter;
    return matchesSearch && matchesCategory && matchesConfidence;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add resources",
        variant: "destructive",
      });
      return;
    }

    if (!newResource.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    createResource(newResource)
      .then(() => {
        addXP({
          activityType: 'create_resource',
          xpAmount: XP_REWARDS.create_resource,
          description: `Submitted resource: ${newResource.title}`,
        });
        setNewResource({
          title: "",
          description: "",
          category: "Programming",
          url: "",
          file_url: null,
          image_url: null,
          difficulty_level: "beginner",
          resource_type: "article",
        });
        toast({
          title: "Submitted for approval",
          description: "An admin will review and approve this resource before it is public.",
        });
        setOpen(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleApprove = async (resourceId: string) => {
    try {
      await approveResource(resourceId);
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Failed to approve resource", 
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8 animate-slide-up flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Resource Hub</h1>
              <p className="text-muted-foreground">
                Explore curated tutorials, guides, and tools to enhance your learning. Learners can share links and the admin will
                publish them once approved.
              </p>
            </div>
            {user && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add a New Resource</DialogTitle>
                    <DialogDescription>
                      Share a learning resource with the community. Submissions stay hidden until an admin approves them.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        required
                        maxLength={200}
                        placeholder="Resource title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newResource.description}
                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                        rows={3}
                        maxLength={1000}
                        placeholder="Brief description of the resource"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newResource.category} onValueChange={(value) => setNewResource({ ...newResource, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Programming">Programming</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="AI">AI</SelectItem>
                          <SelectItem value="Mechanical">Mechanical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select value={newResource.difficulty_level} onValueChange={(value) => setNewResource({ ...newResource, difficulty_level: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Resource Type</Label>
                      <Select value={newResource.resource_type} onValueChange={(value) => setNewResource({ ...newResource, resource_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="tutorial">Tutorial</SelectItem>
                          <SelectItem value="documentation">Documentation</SelectItem>
                          <SelectItem value="course">Course</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        type="url"
                        value={newResource.url}
                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                        placeholder="https://example.com/resource"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Link to the external resource
                      </p>
                    </div>
                    <Button type="submit" className="w-full">Add Resource</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4 animate-fade-in">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  className="pl-10 bg-card/50 border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="border-border/50">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 bg-card/50 border-border/50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Programming">Programming</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="AI">AI</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                <SelectTrigger className="w-48 bg-card/50 border-border/50">
                  <SelectValue placeholder="Confidence Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="Programming">Programming</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resources Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading resources...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => (
                  <div key={resource.id} className="relative group" style={{ animationDelay: `${index * 0.1}s` }}>
                    <ResourceCard
                      title={resource.title}
                      description={resource.description || ""}
                      category={resource.category}
                      type={resource.resource_type || "Resource"}
                      difficulty={(resource.difficulty_level as "beginner" | "intermediate" | "advanced") || "beginner"}
                      rating={resource.avg_rating}
                      ratingCount={resource.rating_count}
                      url={resource.url || undefined}
                      isApproved={resource.is_approved}
                    />
                    {isModerator && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteResource(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No resources found matching your filters</p>
                </div>
              )}
            </>
          )}

          {isModerator && pendingResources.length > 0 && (
            <div className="mt-12 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Pending approvals</h3>
                <p className="text-sm text-muted-foreground">
                  Review student submissions and approve the ones that fit.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingResources.map((resource) => (
                  <div key={resource.id} className="relative group">
                    <ResourceCard
                      title={resource.title}
                      description={resource.description || ""}
                      category={resource.category}
                      type={resource.resource_type || "Resource"}
                      difficulty={(resource.difficulty_level as "beginner" | "intermediate" | "advanced") || "beginner"}
                      rating={resource.avg_rating}
                      ratingCount={resource.rating_count}
                      url={resource.url || undefined}
                      isApproved={resource.is_approved}
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" onClick={() => handleApprove(resource.id)}>
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteResource(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resources;
