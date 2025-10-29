import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Mail, Calendar, Award } from "lucide-react";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useProjects } from "@/hooks/useProjects";
import { EditProjectDialog } from "@/components/EditProjectDialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { projects: allProjects, updateProject } = useProjects();
  const navigate = useNavigate();
  
  // Show only completed projects (100%)
  const completedProjects = allProjects.filter(p => p.progress === 100);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <p className="text-lg">Profile not found</p>
      </div>
    );
  }

  const displayName = profile.full_name || "User";
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
  const joinedDate = new Date(profile.joined_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
  const levelProgress = (profile.xp % 1000) / 10; // Assuming 1000 XP per level
  const xpToNextLevel = 1000 - (profile.xp % 1000);

  const stats = [
    { label: "Total Points", value: profile.total_points.toLocaleString(), icon: Award, color: "primary" as const },
    { label: "Projects", value: profile.projects_count.toString(), icon: Calendar, color: "success" as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Profile Header */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 via-card/50 to-secondary/10 backdrop-blur-sm border-primary/30 animate-slide-up">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-32 w-32 border-4 border-primary/50 shadow-glow-cyan">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/20">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                <p className="text-muted-foreground mb-4">
                  Robotics Enthusiast | Level {profile.level} | {profile.xp.toLocaleString()} XP
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                  {profile.email_visible && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{profile.email || user?.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Joined {joinedDate}</span>
                  </div>
                </div>
              </div>
              <EditProfileDialog profile={profile} />
            </div>

            {/* Level Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Level {profile.level}</span>
                <span className="text-muted-foreground">{xpToNextLevel} XP to Level {profile.level + 1}</span>
              </div>
              <Progress value={levelProgress} className="h-3" />
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-border/50 transition-all hover:shadow-card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}/10 text-${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-sm text-muted-foreground text-center mb-8 p-4 bg-card/30 rounded-lg border border-border/50">
            💡 <strong>Earn XP</strong> by completing projects, earning badges, and participating in robotics activities. Level up as you gain more experience!
          </p>

          {/* Completed Projects */}
          {completedProjects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">🏆 Completed Projects</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {completedProjects.map((project) => (
                  <Card key={project.id} className="p-6 bg-card/50 backdrop-blur-sm border-primary/30 hover:shadow-glow-cyan transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-success">
                          <Award className="h-4 w-4" />
                          <span className="font-medium">100% Complete</span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditProjectDialog project={project} />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Delete this project?")) {
                              updateProject({ id: project.id, updates: { progress: 0 } });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Card className="p-12 bg-card/50 backdrop-blur-sm border-border/50">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold mb-2">No Achievements Yet</h2>
              <p className="text-muted-foreground">
                Complete projects and participate in activities to earn badges and track your progress!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
