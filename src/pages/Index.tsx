import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Zap, Target, Users, TrendingUp, Sparkles, Rocket } from "lucide-react";
import heroImage from "@/assets/hero-robotics.jpg";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

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

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-up">
              <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2">
                <Rocket className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Your Robotics Journey Starts Here</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-glow">
                  RoboJourney
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Track progress, unlock achievements, and master robotics with an interactive learning platform designed for the future.
              </p>
              <div className="flex gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan">
                    <Zap className="mr-2 h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
                <Link to="/resources">
                  <Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    Explore Resources
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-3xl animate-float" />
              <img
                src={heroImage}
                alt="Robotics Lab"
                className="relative rounded-2xl shadow-glow-cyan border border-primary/30 w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Powerful Features for Your Growth</h2>
            <p className="text-xl text-muted-foreground">Everything you need to excel in robotics</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-border/50 transition-all hover:shadow-card-hover hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="p-12 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 backdrop-blur-sm border-primary/30 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Level Up?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join RoboJourney today and transform your robotics learning experience
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan">
                <Zap className="mr-2 h-5 w-5" />
                Create Account
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
