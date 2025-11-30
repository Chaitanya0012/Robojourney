import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import CollaborationDialog from "@/components/CollaborationDialog";
import {
  Zap,
  Target,
  Users,
  TrendingUp,
  Sparkles,
  Rocket,
  Mail,
  ArrowRight,
  Star,
  Brain,
  ShieldCheck,
  Compass,
  Activity,
  MessageSquare,
} from "lucide-react";
import heroImage from "@/assets/hero-robotics.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useCollaboration } from "@/hooks/useCollaboration";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

  const accelerators = [
    {
      icon: Brain,
      title: "AI Tutor Guidance",
      description: "Personalized mentor-style responses that break down complex robotics concepts with examples.",
      badge: "New",
    },
    {
      icon: Compass,
      title: "Adaptive Paths",
      description: "Smart learning routes that react to your confidence levels and quiz results in real-time.",
      badge: "Guided",
    },
    {
      icon: ShieldCheck,
      title: "Safety-First Projects",
      description: "Checklists, gate reviews, and reminders baked into every build so nothing gets overlooked.",
      badge: "Trusted",
    },
    {
      icon: MessageSquare,
      title: "Collaboration Signals",
      description: "Spot peers who are building similar bots and jump into focused conversations instantly.",
      badge: "Live",
    },
  ];

  const journeyPreview = [
    {
      title: "Foundations Sprint",
      focus: "Coding & Control Systems",
      progress: 72,
      tags: ["Python", "PID", "Sensors"],
    },
    {
      title: "Hardware Builder",
      focus: "Electronics & Safety",
      progress: 58,
      tags: ["PCB", "Power", "Testing"],
    },
    {
      title: "Autonomy Lab",
      focus: "AI & Vision",
      progress: 41,
      tags: ["CV", "ROS", "Mapping"],
    },
  ];

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

      {/* Accelerator Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            <Card className="p-8 lg:col-span-1 glass-card glow-border space-y-6 animate-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Momentum boosters</span>
              </div>
              <h2 className="text-4xl font-bold leading-tight">
                Ship robotics projects faster with focused guidance
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                These premium tools are live in the workspace experience and show up instantly in the preview.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">Safety checks and wiring reminders built into every template</p>
                </div>
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-secondary mt-0.5" />
                  <p className="text-sm text-muted-foreground">Tutor answers grounded in your project context and goals</p>
                </div>
                <div className="flex items-start gap-3">
                  <Compass className="h-5 w-5 text-accent mt-0.5" />
                  <p className="text-sm text-muted-foreground">Auto-generated next steps so you always know what to do next</p>
                </div>
              </div>
              <div className="pt-4 flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary">Live in preview</Badge>
                <Badge variant="outline" className="px-3 py-1">No setup required</Badge>
              </div>
            </Card>

            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
              {accelerators.map((item, index) => (
                <Card
                  key={item.title}
                  className="p-6 glass-card glow-border hover-lift animate-scale-in space-y-4"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="inline-flex p-3 rounded-2xl premium-gradient">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge className="bg-secondary/20 text-secondary-foreground">{item.badge}</Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Auto-enabled</span>
                    <span className="text-primary font-medium">Instant updates</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey Preview Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex p-3 rounded-xl glass-card">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-primary font-semibold">Learning preview</p>
                  <h2 className="text-4xl font-bold">See your roadmap before you sign in</h2>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                The Lovable preview mirrors what students see after onboarding—adaptive sprints, XP targets, and badges ready to unlock.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {journeyPreview.map((stage) => (
                  <Card key={stage.title} className="p-5 glass-card glow-border space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{stage.title}</h3>
                      <Badge variant="outline" className="text-xs">{stage.focus}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span className="text-primary font-semibold">{stage.progress}%</span>
                      </div>
                      <Progress value={stage.progress} className="h-2" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stage.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="p-6 glass-card glow-border animate-reveal space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary font-medium">Live pulse</p>
                  <h3 className="text-2xl font-bold">Platform momentum</h3>
                </div>
                <Sparkles className="h-6 w-6 text-secondary" />
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Active learners</span>
                  <span className="font-semibold text-primary">{platformStats?.totalLearners || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Projects built</span>
                  <span className="font-semibold text-secondary">{platformStats?.totalProjects || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resources shared</span>
                  <span className="font-semibold text-accent">{platformStats?.totalResources || 0}</span>
                </div>
              </div>
              <div className="pt-2 space-y-2">
                <Button asChild className="w-full">                    
                  <Link to="/dashboard">Explore dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-border/50">
                  <Link to="/tutor">Ask the AI tutor</Link>
                </Button>
              </div>
            </Card>
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

      {/* Trust Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-14 space-y-4">
            <div className="inline-block px-4 py-2 glass-card rounded-full">
              <span className="text-sm font-medium text-primary">Built for real progress</span>
            </div>
            <h2 className="text-5xl font-bold">Why learners stick with RoboJourney</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine community, coaching, and a transparent XP system so you always know what to do next.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {trustSignals.map((signal, index) => (
              <Card
                key={signal.title}
                className="p-8 glass-card glow-border hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex p-4 rounded-2xl premium-gradient mb-5">
                  <signal.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">{signal.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{signal.description}</p>
              </Card>
            ))}
          </div>
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
