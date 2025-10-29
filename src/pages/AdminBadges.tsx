import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Award } from "lucide-react";
import { useBadgesAdmin } from "@/hooks/useBadgesAdmin";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AdminBadges = () => {
  const { badges, isLoading, createBadge, updateBadge, deleteBadge } = useBadgesAdmin();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBadge) {
      updateBadge({ id: editingBadge.id, updates: formData });
    } else {
      createBadge(formData);
    }
    
    setFormData({ name: "", description: "", icon: "" });
    setEditingBadge(null);
    setOpen(false);
  };

  const handleEdit = (badge: any) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this badge?")) {
      deleteBadge(id);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 flex justify-between items-center animate-slide-up">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Achievements</h1>
              <p className="text-muted-foreground">Create and edit badges for the XP system</p>
            </div>
            <Dialog open={open} onOpenChange={(o) => {
              setOpen(o);
              if (!o) {
                setEditingBadge(null);
                setFormData({ name: "", description: "", icon: "" });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Badge
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBadge ? "Edit Badge" : "Create New Badge"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Badge Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., First Spark"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      placeholder="How to earn this badge..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="icon">Icon (emoji)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      required
                      placeholder="⚙️"
                      maxLength={4}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingBadge ? "Update Badge" : "Create Badge"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading badges...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge, index) => (
                <Card 
                  key={badge.id} 
                  className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-glow-cyan transition-all animate-fade-in group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{badge.icon}</div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(badge)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(badge.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </Card>
              ))}
              
              {badges.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No badges yet. Create your first achievement!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBadges;