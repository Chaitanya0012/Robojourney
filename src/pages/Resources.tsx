import { useState } from "react";
import Navigation from "@/components/Navigation";
import ResourceCard from "@/components/ResourceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const resources = [
    {
      title: "Arduino Basics for Beginners",
      description: "Learn the fundamentals of Arduino programming and circuit building with hands-on examples.",
      category: "Electronics",
      difficulty: "beginner" as const,
      type: "Tutorial",
    },
    {
      title: "Python for Robotics",
      description: "Master Python programming concepts specifically for robotics applications and automation.",
      category: "Programming",
      difficulty: "intermediate" as const,
      type: "Course",
    },
    {
      title: "Advanced AI & Machine Learning",
      description: "Dive deep into neural networks, computer vision, and machine learning algorithms.",
      category: "AI",
      difficulty: "advanced" as const,
      type: "Guide",
    },
    {
      title: "Sensor Integration Workshop",
      description: "Learn how to integrate various sensors with microcontrollers and process sensor data.",
      category: "Electronics",
      difficulty: "intermediate" as const,
      type: "Workshop",
    },
    {
      title: "3D Design for Robotics",
      description: "Create custom robot parts and enclosures using CAD software and 3D printing.",
      category: "Mechanical",
      difficulty: "beginner" as const,
      type: "Video",
    },
    {
      title: "ROS (Robot Operating System)",
      description: "Explore the Robot Operating System framework for building complex robotic systems.",
      category: "Programming",
      difficulty: "advanced" as const,
      type: "Documentation",
    },
  ];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || resource.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold mb-2">Resource Hub</h1>
            <p className="text-muted-foreground">Explore curated tutorials, guides, and tools to enhance your learning</p>
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

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-48 bg-card/50 border-border/50">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                <ResourceCard {...resource} />
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No resources found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resources;
