import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import BadgeDisplay from "@/components/BadgeDisplay";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Mail, Calendar, Award, TrendingUp } from "lucide-react";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();

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

  const badges = [
    { id: "1", name: "Circuit Master", icon: "trophy", description: "Completed 10 circuits", earned: true },
    { id: "2", name: "Code Ninja", icon: "zap", description: "Wrote 1000 lines", earned: true },
    { id: "3", name: "AI Pioneer", icon: "star", description: "Built first AI model", earned: false },
    { id: "4", name: "Team Player", icon: "award", description: "Helped 5 students", earned: true },
    { id: "5", name: "Problem Solver", icon: "target", description: "Solved 50 challenges", earned: true },
    { id: "6", name: "Innovation Star", icon: "trophy", description: "Won hackathon", earned: false },
  ];

  const stats = [
    { label: "Total Points", value: profile.total_points.toLocaleString(), icon: Award, color: "primary" as const },
    { label: "Rank", value: profile.rank ? `#${profile.rank}` : "Unranked", icon: TrendingUp, color: "secondary" as const },
    { label: "Projects", value: profile.projects_count.toString(), icon: Calendar, color: "success" as const },
  ];

  const skills = [
    { name: "Arduino & Electronics", level: 85 },
    { name: "Python Programming", level: 75 },
    { name: "AI & Machine Learning", level: 60 },
    { name: "Mechanical Design", level: 45 },
    { name: "Circuit Design", level: 70 },
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
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{profile.email || user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Joined {joinedDate}</span>
                  </div>
                </div>
              </div>
              <EditProfileDialog 
                currentName={displayName}
                currentAvatarUrl={profile.avatar_url}
              />
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
          <div className="grid md:grid-cols-3 gap-6 mb-8">
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Skills Section */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Confidence Levels</h2>
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                  <div className="space-y-6">
                    {skills.map((skill, index) => (
                      <div key={index} className="space-y-2 animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
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

              <div>
                <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                  <div className="space-y-4">
                    {[
                      { action: "Completed project", title: "Line Following Robot", time: "2 hours ago" },
                      { action: "Earned badge", title: "Code Ninja", time: "1 day ago" },
                      { action: "Submitted feedback", title: "Arduino Workshop", time: "3 days ago" },
                      { action: "Started course", title: "Python for Robotics", time: "5 days ago" },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/50 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.title}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Badges Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Achievements</h2>
              <div className="grid grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <BadgeDisplay key={badge.id} badge={badge} />
                ))}
              </div>
              <Card className="mt-6 p-4 bg-gradient-to-br from-primary/20 to-secondary/10 border-primary/30 text-center">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">3 badges earned</p>
                <p className="text-xs text-muted-foreground">3 more to unlock</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
