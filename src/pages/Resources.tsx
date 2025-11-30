import { useState } from "react";
import Navigation from "@/components/Navigation";
import ResourceCard from "@/components/ResourceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, Trash2, Shield } from "lucide-react";
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
  const { resources, isLoading, createResource, deleteResource, approveResource } = useResources();
  const { isModerator, isAdmin } = useUserRole();
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

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (resource.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter;
    const matchesConfidence = confidenceFilter === "all" || resource.category === confidenceFilter;
    return matchesSearch && matchesCategory && matchesConfidence;
  });

  const approvedResources = filteredResources.filter((resource) => resource.is_approved);
  const pendingResources = filteredResources.filter((resource) => !resource.is_approved);

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

    createResource({ ...newResource, isApproved: isAdmin });
    addXP({
      activityType: 'create_resource',
      xpAmount: XP_REWARDS.create_resource,
      description: `Created resource: ${newResource.title}`,
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
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8 animate-slide-up flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Resource Hub</h1>
              <p className="text-muted-foreground">Explore curated tutorials, guides, and tools to enhance your learning</p>
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
                      Students can share inspiring videos or articles. Admin approval is required before links go live.
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
                    <Button type="submit" className="w-full">
                      {isAdmin ? "Publish Resource" : "Submit for Approval"}
                    </Button>
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
          ) : approvedResources.length === 0 ? (
            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-border/50">
              <h3 className="text-xl font-semibold mb-2">No approved resources yet</h3>
              <p className="text-muted-foreground">Submit a link to get started. Admin will approve before it shows up.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedResources.map((resource, index) => (
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
          )}

          {isAdmin && pendingResources.length > 0 && (
            <div className="mt-10 space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" /> Pending Approval
              </h2>
              <p className="text-sm text-muted-foreground">Review student-submitted links before they go live.</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingResources.map((resource) => (
                  <Card key={resource.id} className="p-4 space-y-3 bg-amber-500/5 border border-amber-200/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase text-amber-500 font-semibold">Pending</p>
                        <h3 className="text-lg font-semibold">{resource.title}</h3>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => approveResource(resource.id)}>
                        Approve
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                    {resource.url && (
                      <p className="text-xs font-mono break-all text-foreground">{resource.url}</p>
                    )}
                  </Card>
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
