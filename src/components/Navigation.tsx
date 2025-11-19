import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, MessageSquare, User, BarChart3, Zap, LogOut, Shield, FileText, Brain, GraduationCap, Box } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isModerator, isAdmin } = useUserRole();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: Zap },
    { path: "/resources", label: "Resources", icon: BookOpen },
    { path: "/learn", label: "Learn", icon: GraduationCap },
    { path: "/simulator", label: "Simulator", icon: Box },
    { path: "/quiz", label: "Quiz", icon: Brain },
    { path: "/tutor", label: "AI Tutor", icon: Brain },
    { path: "/feedback", label: "Feedback", icon: MessageSquare },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/credits" className="group">
              <div className="relative">
                <Zap className="h-8 w-8 text-primary transition-all group-hover:animate-glow" />
              </div>
            </Link>
            <Link to="/" className="group">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                RoboJourney
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant="ghost"
                  className={`${
                    isActive(path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  } transition-all hover:bg-primary/5`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              </Link>
            ))}
            {isModerator && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  className={`${
                    isActive("/admin")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  } transition-all hover:bg-primary/5`}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin/terms">
                <Button
                  variant="ghost"
                  className={`${
                    isActive("/admin/terms")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  } transition-all hover:bg-primary/5`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Terms
                </Button>
              </Link>
            )}
          </div>
          
          {user ? (
            <Button 
              onClick={() => signOut()} 
              variant="outline" 
              className="border-primary/50 hover:bg-primary/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan transition-all hover:shadow-glow-cyan">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
