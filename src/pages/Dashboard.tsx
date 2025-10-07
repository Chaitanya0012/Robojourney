import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ProgressCard from "@/components/ProgressCard";
import BadgeDisplay from "@/components/BadgeDisplay";
import StatsCard from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Code, Cpu, CheckCircle2, Clock, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useProjects } from "@/hooks/useProjects";
import { useBadges } from "@/hooks/useBadges";
import { useSkills } from "@/hooks/useSkills";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { badges, isLoading: badgesLoading } = useBadges();
  const { skills, isLoading: skillsLoading } = useSkills();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading || projectsLoading || badgesLoading || skillsLoading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const completedProjects = projects.filter(p => p.progress === 100).length;
  const activeProjects = projects.filter(p => p.progress < 100).length;
  const earnedBadges = badges.filter(b => b.earned).length;
  
  const getIconComponent = (iconName: string | null) => {
    switch (iconName) {
      case 'target': return Target;
      case 'cpu': return Cpu;
      case 'code': return Code;
      default: return Target;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.full_name || 'Student'}! 👋</h1>
            <p className="text-muted-foreground">Here's your learning progress</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Projects Completed"
              value={completedProjects.toString()}
              icon={CheckCircle2}
              color="success"
            />
            <StatsCard
              title="Active Projects"
              value={activeProjects.toString()}
              icon={Clock}
              color="primary"
            />
            <StatsCard
              title="Badges Earned"
              value={earnedBadges.toString()}
              icon={Trophy}
              color="secondary"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Progress */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Current Projects</h2>
                {projects.length === 0 ? (
                  <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                    <p className="text-muted-foreground text-center">No projects yet. Start a new project to track your progress!</p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {projects.map((project) => {
                      const IconComponent = getIconComponent(project.icon);
                      return (
                        <ProgressCard
                          key={project.id}
                          title={project.title}
                          progress={project.progress}
                          icon={<IconComponent className="h-5 w-5" />}
                          color={(project.color as "primary" | "secondary" | "success") || "primary"}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Skill Levels</h2>
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                  {skills.length === 0 ? (
                    <p className="text-muted-foreground text-center">No skills tracked yet.</p>
                  ) : (
                    <div className="space-y-6">
                      {skills.map((skill) => (
                        <div key={skill.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{skill.name}</span>
                            <span className="text-muted-foreground">{skill.level}%</span>
                          </div>
                          <Progress value={skill.level} className="h-2" />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Right Column - Badges & Quick Actions */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Achievements</h2>
                {badges.length === 0 ? (
                  <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                    <p className="text-muted-foreground text-center">No badges available yet.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {badges.map((badge) => (
                      <BadgeDisplay key={badge.id} badge={badge} />
                    ))}
                  </div>
                )}
              </div>

              <Card className="p-6 bg-gradient-to-br from-primary/20 to-secondary/10 border-primary/30">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start border-border/50">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Task Complete
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-border/50">
                    <Target className="mr-2 h-4 w-4" />
                    Start New Project
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
