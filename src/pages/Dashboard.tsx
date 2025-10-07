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

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const badges = [
    { id: "1", name: "Circuit Master", icon: "trophy", description: "Completed 10 circuits", earned: true },
    { id: "2", name: "Code Ninja", icon: "zap", description: "Wrote 1000 lines", earned: true },
    { id: "3", name: "AI Pioneer", icon: "star", description: "Built first AI model", earned: false },
    { id: "4", name: "Team Player", icon: "award", description: "Helped 5 students", earned: true },
  ];

  const skills = [
    { name: "Programming", level: 75, color: "primary" as const },
    { name: "Electronics", level: 60, color: "secondary" as const },
    { name: "Mechanical", level: 45, color: "success" as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold mb-2">Welcome back, Student! 👋</h1>
            <p className="text-muted-foreground">Here's your learning progress</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Projects Completed"
              value="12"
              icon={CheckCircle2}
              trend="+3 this week"
              color="success"
            />
            <StatsCard
              title="Active Tasks"
              value="5"
              icon={Clock}
              color="primary"
            />
            <StatsCard
              title="Badges Earned"
              value="8"
              icon={Trophy}
              trend="+2 new"
              color="secondary"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Progress */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Current Projects</h2>
                <div className="grid gap-4">
                  <ProgressCard
                    title="Line Following Robot"
                    progress={85}
                    icon={<Target className="h-5 w-5" />}
                    color="primary"
                  />
                  <ProgressCard
                    title="Arduino Temperature Sensor"
                    progress={60}
                    icon={<Cpu className="h-5 w-5" />}
                    color="secondary"
                  />
                  <ProgressCard
                    title="Python AI Chatbot"
                    progress={35}
                    icon={<Code className="h-5 w-5" />}
                    color="success"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Skill Levels</h2>
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                  <div className="space-y-6">
                    {skills.map((skill) => (
                      <div key={skill.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-muted-foreground">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column - Badges & Quick Actions */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Achievements</h2>
                <div className="grid grid-cols-2 gap-4">
                  {badges.map((badge) => (
                    <BadgeDisplay key={badge.id} badge={badge} />
                  ))}
                </div>
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
