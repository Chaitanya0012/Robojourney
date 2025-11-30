import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Compass,
  Workflow,
  BrainCircuit,
  ShieldCheck,
  Activity,
  Trophy,
} from "lucide-react";
import heroImage from "@/assets/hero-robotics.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useCollaboration } from "@/hooks/useCollaboration";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const Index = () => {
  const { user } = useAuth();
  const { collaborations, isLoading } = useCollaboration();
  const { stats: platformStats } = usePlatformStats();

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

  const blueprintSteps = [
    {
      icon: Compass,
      title: "Choose Your Mission",
      description: "Pick a robotics focus area and we’ll scaffold a personalized learning path with milestones.",
    },
    {
      icon: Workflow,
      title: "Build & Iterate",
      description: "Work through interactive lessons, simulations, and collaborative projects with mentor feedback.",
    },
    {
      icon: Trophy,
      title: "Earn & Showcase",
      description: "Collect XP, unlock badges, and share your robotics portfolio as you level up.",
    },
  ];

  const trustSignals = [
    {
      icon: BrainCircuit,
      title: "AI-Powered Guidance",
      description: "Adaptive hints and an AI tutor keep you unblocked while reinforcing robotics fundamentals.",
    },
    {
      icon: Activity,
      title: "Progress You Can See",
      description: "Dashboards, XP widgets, and level ladders make every learning win visible.",
    },
    {
      icon: ShieldCheck,
      title: "Reliable Community",
      description: "Moderated resources, verified projects, and safe collaboration spaces you can trust.",
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
                <Link to="/auth" className="group">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan glow-border"
                  >
                    <Zap className="mr-2 h-5 w-5 group-hover:animate-glow-pulse" />
                    Get Started Free
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

      {/* Blueprint Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 glass-card rounded-full mb-2">
                <span className="text-sm font-medium text-primary">How RoboJourney Works</span>
              </div>
              <h2 className="text-5xl font-bold leading-tight">
                A clear blueprint for becoming a robotics leader
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you are exploring sensors or shipping autonomous builds, we guide you through every phase with
                structure, accountability, and momentum you can actually feel in the product.
              </p>

              <div className="space-y-4">
                {blueprintSteps.map((step, index) => (
                  <Card
                    key={step.title}
                    className="p-6 glass-card glow-border flex gap-4 items-start animate-reveal"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-3 rounded-2xl premium-gradient">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-primary mb-1">Step {index + 1}</div>
                      <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="p-10 glass-card glow-border sticky top-10 animate-scale-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6">
                <Activity className="h-4 w-4" />
                Live platform momentum
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
                  <div className="text-sm text-muted-foreground">Learners building today</div>
                  <div className="text-3xl font-bold text-primary mt-1">
                    {platformStats?.totalLearners ?? 0}+
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Active profiles and counting</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10">
                  <div className="text-sm text-muted-foreground">Robotics projects shipped</div>
                  <div className="text-3xl font-bold text-secondary mt-1">
                    {platformStats?.totalProjects ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Documented builds on the platform</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10">
                  <div className="text-sm text-muted-foreground">Curated resources</div>
                  <div className="text-3xl font-bold text-accent mt-1">
                    {platformStats?.totalResources ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Mentor-approved learning assets</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-muted/20 to-primary/5">
                  <div className="text-sm text-muted-foreground">Weekly XP earned</div>
                  <div className="text-3xl font-bold text-foreground mt-1">25,000+</div>
                  <p className="text-sm text-muted-foreground mt-1">Learners progressing every week</p>
                </div>
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
              <Link to="/auth" className="inline-block group">
                <Button 
                  size="lg" 
                  className="text-xl px-12 py-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan glow-border"
                >
                  <Zap className="mr-3 h-6 w-6 group-hover:animate-glow-pulse" />
                  Create Free Account
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
