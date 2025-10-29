import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Star, Clock } from "lucide-react";
import { useFeedback } from "@/hooks/useFeedback";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useProjects } from "@/hooks/useProjects";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { feedback, approveFeedback, isLoading } = useFeedback();
  const { isModerator, isLoading: roleLoading } = useUserRole();
  const { projects } = useProjects();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isModerator) {
      navigate("/dashboard");
    }
  }, [isModerator, roleLoading, navigate]);

  if (authLoading || roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user || !isModerator) {
    return null;
  }

  const pendingFeedback = feedback.filter(f => !f.is_approved);
  const approvedFeedback = feedback.filter(f => f.is_approved);
  const projectsNeedingHelp = projects.filter(p => p.help_request && p.help_request.trim() !== '');

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 animate-slide-up">
            <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage feedback and moderate content</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Feedback</p>
                  <p className="text-3xl font-bold">{feedback.length}</p>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {feedback.length}
                </Badge>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold">{pendingFeedback.length}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold">{approvedFeedback.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Projects Needing Help */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🆘 Help Requests ({projectsNeedingHelp.length})
            </h2>
            {projectsNeedingHelp.length === 0 ? (
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <p className="text-muted-foreground text-center">No help requests at the moment</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {projectsNeedingHelp.map((project, index) => (
                  <Card
                    key={project.id}
                    className="p-6 bg-card/30 backdrop-blur-sm border-amber-500/50 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Help Request:</strong> {project.help_request}
                        </p>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Project Description:</strong> {project.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Progress: {project.progress}% • Created: {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pending Feedback */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-amber-500" />
              Pending Review ({pendingFeedback.length})
            </h2>
            {pendingFeedback.length === 0 ? (
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <p className="text-muted-foreground text-center">No pending feedback</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingFeedback.map((item, index) => (
                  <Card
                    key={item.id}
                    className="p-6 bg-card/30 backdrop-blur-sm border-border/50 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{item.type}</Badge>
                          <div className="flex">
                            {Array.from({ length: item.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                            ))}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{item.subject}</h3>
                        <p className="text-muted-foreground mb-2">{item.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveFeedback(item.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Approved Feedback */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Approved Feedback ({approvedFeedback.length})
            </h2>
            {approvedFeedback.length === 0 ? (
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <p className="text-muted-foreground text-center">No approved feedback yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvedFeedback.map((item, index) => (
                  <Card
                    key={item.id}
                    className="p-6 bg-card/30 backdrop-blur-sm border-border/50 opacity-60"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{item.type}</Badge>
                          <Badge variant="secondary" className="bg-green-600">Approved</Badge>
                          <div className="flex">
                            {Array.from({ length: item.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                            ))}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{item.subject}</h3>
                        <p className="text-muted-foreground mb-2">{item.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
