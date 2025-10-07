import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, BookOpen, Award, Activity, Target } from "lucide-react";

const Analytics = () => {
  const overallStats = [
    { title: "Total Students", value: "156", icon: Users, trend: "+12 this month", color: "primary" as const },
    { title: "Active Projects", value: "89", icon: Target, trend: "+8 this week", color: "secondary" as const },
    { title: "Resources Used", value: "342", icon: BookOpen, color: "success" as const },
    { title: "Badges Awarded", value: "234", icon: Award, trend: "+45 this month", color: "primary" as const },
  ];

  const topStudents = [
    { name: "Emma Wilson", projects: 24, badges: 15, rank: 1 },
    { name: "Liam Zhang", projects: 22, badges: 14, rank: 2 },
    { name: "Sophia Kumar", projects: 20, badges: 13, rank: 3 },
    { name: "Noah Patel", projects: 18, badges: 12, rank: 4 },
    { name: "Olivia Chen", projects: 17, badges: 11, rank: 5 },
  ];

  const popularResources = [
    { title: "Arduino Basics", views: 342, completion: 87 },
    { title: "Python for Robotics", views: 289, completion: 76 },
    { title: "Sensor Integration", views: 256, completion: 82 },
    { title: "AI & Machine Learning", views: 198, completion: 65 },
  ];

  const engagement = [
    { category: "Programming", students: 125, percentage: 80 },
    { category: "Electronics", students: 98, percentage: 63 },
    { category: "Mechanical", students: 87, percentage: 56 },
    { category: "AI", students: 76, percentage: 49 },
  ];

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold mb-2">Mentor Analytics</h1>
            <p className="text-muted-foreground">Track student engagement and club performance</p>
          </div>

          {/* Overall Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {overallStats.map((stat, index) => (
              <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                <StatsCard {...stat} />
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Top Students */}
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-4">Top Performing Students</h2>
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="space-y-4">
                  {topStudents.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-border/50 hover:shadow-card-hover transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? "bg-primary/20 text-primary" :
                          index === 1 ? "bg-secondary/20 text-secondary" :
                          "bg-muted/20 text-muted-foreground"
                        }`}>
                          #{student.rank}
                        </div>
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.projects} projects • {student.badges} badges
                          </p>
                        </div>
                      </div>
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Popular Resources */}
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-4">Most Popular Resources</h2>
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="space-y-4">
                  {popularResources.map((resource, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{resource.title}</span>
                        <span className="text-muted-foreground">{resource.views} views</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                          style={{ width: `${resource.completion}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {resource.completion}% completion rate
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Category Engagement */}
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">Category Engagement</h2>
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {engagement.map((category, index) => (
                  <div
                    key={index}
                    className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/5 border border-border/50"
                  >
                    <div className="inline-flex p-3 rounded-full bg-primary/20 text-primary mb-4">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">{category.category}</h3>
                    <p className="text-3xl font-bold text-primary mb-1">{category.students}</p>
                    <p className="text-sm text-muted-foreground">{category.percentage}% of students</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
