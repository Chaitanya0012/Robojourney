import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import CollaborationDialog from "@/components/CollaborationDialog";
import { Zap, Target, Users, TrendingUp, Sparkles, Rocket, Mail, ArrowRight, Star, Gauge, Brain, Shield, Medal } from "lucide-react";
import heroImage from "@/assets/hero-robotics.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useCollaboration } from "@/hooks/useCollaboration";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { LEVEL_THRESHOLDS, XP_REWARDS } from "@/hooks/useXP";

const Index = () => {
  const { user } = useAuth();
  const { collaborations, isLoading } = useCollaboration();
  const { stats: platformStats } = usePlatformStats();
  const isLoggedIn = Boolean(user);

  const features = [
    {
      icon: Target,
      title: "Track Your Progress",
      description: "Visualize your learning journey with interactive dashboards and milestone tracking.",
    },
    {
      icon: Sparkles,
      title: "Earn Badges",
      description: "Unlock achievements and collect digital badges as you master new skills.",
    },
    {
      icon: Users,
      title: "Collaborate & Learn",
      description: "Connect with mentors, share feedback, and grow together as a robotics community.",
    },
    {
      icon: TrendingUp,
      title: "Level Up Skills",
      description: "Monitor your competencies in coding, electronics, and engineering with skill meters.",
    },
  ];

  const masteryPillars = [
    {
      icon: Gauge,
      title: "XP Momentum",
      description: "Unlock new robotics titles as you progress from Novice to Grand Robotics Master.",
      accent: "Live leveling",
    },
    {
      icon: Brain,
      title: "AI Tutor Guidance",
      description: "Personalized study plans and quiz feedback keep your learning on track.",
      accent: "Adaptive feedback",
    },
    {
      icon: Shield,
      title: "Confidence Coaching",
      description: "Skill sliders help you assess strengths, close gaps, and earn bonus XP.",
      accent: "Skill mapping",
    },
  ];

  const sampleXP = {
    currentXP: 2450,
    currentLevel: LEVEL_THRESHOLDS.find(level => level.level === 4),
    nextLevel: LEVEL_THRESHOLDS.find(level => level.level === 5),
  };

  const currentLevelXP = sampleXP.currentLevel?.xp || 0;
  const nextLevelXP = sampleXP.nextLevel?.xp || currentLevelXP;
  const levelRange = Math.max(1, nextLevelXP - currentLevelXP);
  const progressToNextLevel = Math.min(100, Math.max(0, ((sampleXP.currentXP - currentLevelXP) / levelRange) * 100));

  return (
    <div className="min-h-screen bg-gradient-cosmic overflow-hidden">
      <Navigation />
      
      {/* Hero Section - Premium */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-parallax-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-parallax-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div className="space-y-8 animate-reveal">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 glass-card rounded-full px-5 py-2.5 glow-border">
                <Rocket className="h-4 w-4 text-primary animate-glow-pulse" />
                <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Your Robotics Journey Starts Here
                </span>
                <Star className="h-3 w-3 text-secondary fill-secondary animate-glow-pulse" />
              </div>

              {/* Main Heading */}
              <h1 className="text-6xl lg:text-8xl font-bold leading-[1.1] tracking-tight">
                Welcome to{" "}
                <span className="text-shimmer block mt-2">
                  RoboJourney
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Track progress, unlock achievements, and master robotics with an interactive learning platform designed for the future.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to={isLoggedIn ? "/dashboard" : "/auth"} className="group">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan glow-border"
                  >
                    <Zap className="mr-2 h-5 w-5 group-hover:animate-glow-pulse" />
                    {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/resources">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto text-lg px-8 py-6 glass-card hover:bg-primary/10 border-primary/30"
                  >
                    Explore Resources
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {platformStats?.totalLearners || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Learners</div>
                </div>
                <div className="h-12 w-px bg-border/50" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">
                    {platformStats?.totalProjects || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Projects Built</div>
                </div>
                <div className="h-12 w-px bg-border/50" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">
                    {platformStats?.totalResources || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Resources</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur-3xl animate-float" />
              <div className="relative glow-border rounded-3xl overflow-hidden hover-lift">
                <img
                  src={heroImage}
                  alt="Robotics Lab - Students working on innovative projects"
                  className="relative rounded-3xl w-full shadow-glow-cyan"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium Grid */}
      <section className="py-32 px-4 relative">
        <div className="container mx-auto">
          {/* AI Navigation Planner */}
          <div className="glass-card glow-border mb-16 p-8 lg:p-10 rounded-3xl animate-reveal space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm uppercase tracking-widest text-muted-foreground">AI Navigation</p>
                <h2 className="text-3xl font-bold">Drop your goal, get a guided path</h2>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[2fr,1fr] items-start">
              <div className="space-y-4">
                <label className="text-sm text-muted-foreground">What do you want to do today?</label>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <input
                    value={planInput}
                    onChange={(e) => setPlanInput(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border bg-background/60 focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Build an ESP32 weather logger"
                  />
                  <Button size="lg" className="w-full md:w-auto" onClick={handlePlan}>
                    Generate my path
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <button
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                        trainingConsent ? "border-primary/60 bg-primary/10" : "border-border"
                      }`}
                      onClick={() => setTrainingConsent((prev) => !prev)}
                      aria-pressed={trainingConsent}
                    >
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      {consentLabel}
                    </button>
                    <span className="text-muted-foreground">Toggle whether your activity trains the LLM.</span>
                  </div>
                  <div className="text-xs px-3 py-2 rounded-full bg-primary/10 text-primary font-semibold">
                    Navigator confidence: {navConfidence}%
                  </div>
                </div>

                <Card className="p-4 border border-primary/20 bg-background/70">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-primary">Navigator route</p>
                      <h3 className="text-lg font-semibold">Live guidance to your goal</h3>
                    </div>
                    <div className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-300/40 text-emerald-100">
                      Connected
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {dailyPlan.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={item.action}
                        className="w-full text-left p-3 rounded-lg border border-border/60 hover:border-primary/60 hover:bg-primary/5 transition"
                      >
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
              <Card className="p-4 border-dashed border-primary/30 bg-primary/5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">AI Navigator plan</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">vNext</span>
                </div>
                <div className="space-y-3">
                  {navPlan.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border/60 bg-background/60 flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{step.title}</p>
                          <span className="text-[10px] px-2 py-1 rounded-full border border-border/70">
                            {step.eta}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full ${
                              step.status === "ready"
                                ? "bg-emerald-500/10 text-emerald-200 border border-emerald-400/40"
                                : "bg-amber-500/10 text-amber-100 border border-amber-400/40"
                            }`}
                          >
                            {step.status === "ready" ? "Active" : "Queued"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-background/70 border border-border/60 p-3">
                  <p className="text-xs uppercase text-muted-foreground tracking-[0.2em]">Flight log</p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {navLog.slice(-4).map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-reveal">
            <Card className="p-4 glass-card flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary">
                <Compass className="h-4 w-4" />
                <span className="text-sm font-semibold">AI Navigator Signal</span>
              </div>
              <p className="text-sm text-muted-foreground">{navSignal}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">Synthetic planning</span>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs">Ready to route</span>
              </div>
            </Card>

            <Card className="p-4 glass-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-secondary">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-semibold">Next 3 plays</span>
                </div>
                <span className="text-xs text-muted-foreground">Auto-refreshed</span>
              </div>
              <div className="space-y-3">
                {navActions.map((action, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border/50 bg-background/60">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{action.title}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{action.eta}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{action.detail}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 glass-card">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertOctagon className="h-4 w-4" />
                <span className="text-sm font-semibold">Risk radar</span>
              </div>
              <div className="space-y-2">
                {navRisks.map((risk, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-destructive">{risk.label}</span>
                      <span className="px-2 py-0.5 rounded-full bg-background/80 text-foreground">{risk.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Section Header */}
          <div className="text-center mb-20 space-y-4 animate-reveal">
            <div className="inline-block px-4 py-2 glass-card rounded-full mb-4">
              <span className="text-sm font-medium text-primary">Features</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold">
              Powerful Tools for{" "}
              <span className="text-shimmer">Your Growth</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to excel in robotics, beautifully designed
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group p-8 glass-card glow-border hover-lift animate-scale-in cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex p-4 rounded-2xl premium-gradient mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-primary group-hover:animate-glow-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* XP & Mastery Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 premium-gradient opacity-40" />
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
            <Card className="p-10 glass-card glow-border animate-reveal space-y-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary mb-2">RoboJourney XP Engine</p>
                  <h3 className="text-4xl font-bold">Track your mastery in real time</h3>
                  <p className="text-muted-foreground mt-2">A preview of what learners see on the dashboard.</p>
                </div>
                <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
                  Level {sampleXP.currentLevel?.level}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-card/60 border border-border/40">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current XP</p>
                      <p className="text-3xl font-bold">{sampleXP.currentXP.toLocaleString()} XP</p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {sampleXP.currentLevel?.title}
                    </Badge>
                  </div>
                  <Progress value={progressToNextLevel} className="h-3 mb-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{currentLevelXP.toLocaleString()} XP</span>
                    <span>Next: {nextLevelXP.toLocaleString()} XP</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/15 to-primary/10 border border-secondary/40">
                  <div className="flex items-center gap-3 mb-4">
                    <Medal className="h-10 w-10 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">XP rewards preview</p>
                      <p className="text-lg font-semibold">Earn XP with every action</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(XP_REWARDS).slice(0, 6).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-xl bg-card/70 border border-border/40">
                        <p className="font-semibold capitalize">{key.replace(/_/g, " ")}</p>
                        <p className="text-sm text-primary font-medium">+{value} XP</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {LEVEL_THRESHOLDS.slice(0, 6).map((level) => (
                  <div key={level.level} className="p-4 rounded-xl bg-card/70 border border-border/40">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Level {level.level}</p>
                    <p className="font-semibold">{level.title}</p>
                    <p className="text-sm text-primary font-medium mt-2">{level.xp.toLocaleString()} XP</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/15 border border-primary/30">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Designed for clarity</p>
                  <h4 className="text-2xl font-bold">What learners see first</h4>
                </div>
              </div>

              <div className="grid gap-4">
                {masteryPillars.map((pillar, index) => (
                  <Card
                    key={pillar.title}
                    className="p-6 glass-card glow-border animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl premium-gradient">
                        <pillar.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h5 className="text-xl font-bold">{pillar.title}</h5>
                          <Badge variant="outline" className="border-border/40 text-xs">
                            {pillar.accent}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Section - Premium */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0 premium-gradient" />
        <div className="container mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4 animate-reveal">
            <div className="inline-block px-4 py-2 glass-card rounded-full mb-4">
              <span className="text-sm font-medium text-primary">Collaborate</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold">
              Find Your Next{" "}
              <span className="text-shimmer">Collaborator</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Connect with fellow robotics enthusiasts working on exciting projects
            </p>
            <CollaborationDialog />
          </div>
          
          {/* Collaboration Grid */}
          {!isLoading && collaborations && collaborations.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {collaborations.slice(0, 6).map((collab, index) => (
                <Card 
                  key={collab.id}
                  className="group p-6 glass-card glow-border hover-lift animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="inline-flex p-3 rounded-xl premium-gradient">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    {collab.skills && (
                      <div className="text-xs px-3 py-1 glass-card rounded-full text-muted-foreground">
                        {collab.skills}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {collab.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                    {collab.project_description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-border/30">
                    <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                    <a 
                      href={`mailto:${collab.email}`}
                      className="hover:text-primary transition-colors truncate font-medium"
                    >
                      {collab.email}
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {(!collaborations || collaborations.length === 0) && !isLoading && (
            <Card className="p-16 glass-card glow-border text-center mt-12 animate-scale-in">
              <Users className="h-16 w-16 text-primary mx-auto mb-4 animate-float" />
              <h3 className="text-2xl font-bold mb-2">Be the First</h3>
              <p className="text-muted-foreground text-lg">
                No one is currently looking for collaborators. Start the conversation!
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* Final CTA Section - Premium */}
      <section className="py-32 px-4 relative">
        <div className="container mx-auto">
          <Card className="relative overflow-hidden p-16 lg:p-24 glass-card glow-border text-center animate-reveal">
            {/* Background decoration */}
            <div className="absolute inset-0 premium-gradient opacity-50" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-parallax-float" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-parallax-float" style={{ animationDelay: '1s' }} />
            
            {/* Content */}
            <div className="relative z-10 space-y-8">
              <div className="inline-block px-4 py-2 glass-card rounded-full">
                <span className="text-sm font-medium text-primary">Ready to Start?</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-bold">
                Level Up Your
                <span className="text-shimmer block mt-2">Robotics Journey</span>
              </h2>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Join thousands of learners transforming their robotics skills with RoboJourney
              </p>
              <Link to={isLoggedIn ? "/dashboard" : "/auth"} className="inline-block group">
                <Button
                  size="lg"
                  className="text-xl px-12 py-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan glow-border"
                >
                  <Zap className="mr-3 h-6 w-6 group-hover:animate-glow-pulse" />
                  {isLoggedIn ? "Open Dashboard" : "Create Free Account"}
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                No credit card required • Start learning in seconds
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer - Minimal & Premium */}
      <footer className="py-12 px-4 border-t border-border/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">RoboJourney</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 RoboJourney. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link 
                to="/terms" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/resources" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Resources
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
