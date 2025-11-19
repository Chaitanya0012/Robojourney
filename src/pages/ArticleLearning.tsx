import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Trophy, ArrowLeft } from "lucide-react";
import { ArticleQuizCard } from "@/components/ArticleQuizCard";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  description: string;
  level: number;
  order_index: number;
}

interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
}

export default function ArticleLearning() {
  const [selectedArticle, setSelectedArticle] = useState<Lesson | null>(null);
  const [completedArticles, setCompletedArticles] = useState<Set<string>>(new Set());

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['robotics-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('robotics_articles')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data.map(article => ({
        ...article,
        difficulty: article.difficulty_level,
        description: article.content.substring(0, 150) + '...',
        level: 1 // Default level for articles
      })) as Lesson[];
    },
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['article-questions', selectedArticle?.title],
    enabled: !!selectedArticle,
    queryFn: async () => {
      const articlePrefix = `Article ${selectedArticle!.order_index}:`;
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .like('category', `${articlePrefix}%`);
      
      if (error) throw error;
      return data.map(q => ({
        ...q,
        options: JSON.parse(q.options as any)
      })) as QuizQuestion[];
    },
  });

  const handleArticleComplete = () => {
    if (selectedArticle) {
      setCompletedArticles(prev => new Set([...prev, selectedArticle.id]));
      toast.success(`Completed: ${selectedArticle.title}`);
      setSelectedArticle(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-500';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'Hard': return 'bg-red-500/10 text-red-500';
      default: return 'bg-primary/10 text-primary';
    }
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setSelectedArticle(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          
          {questionsLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading questions...</p>
            </Card>
          ) : questions && questions.length > 0 ? (
            <ArticleQuizCard
              article={selectedArticle}
              questions={questions}
              onComplete={handleArticleComplete}
            />
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No questions available for this article yet.</p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">
            Diagnostic Robotics Tutor
          </h1>
          <p className="text-muted-foreground text-lg">
            Learn robotics through real-world troubleshooting scenarios. Master component diagnosis and problem-solving.
          </p>
        </div>

        {/* Progress Stats */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {completedArticles.size} / {lessons?.length || 0}
                </h3>
                <p className="text-muted-foreground">Articles Completed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <p className="text-2xl font-bold">{(lessons?.length || 0) * 5}</p>
            </div>
          </div>
        </Card>

        {/* Article Grid */}
        {lessonsLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lessons?.map((lesson, idx) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card 
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    completedArticles.has(lesson.id) ? 'border-green-500/50 bg-green-500/5' : ''
                  }`}
                  onClick={() => setSelectedArticle(lesson)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    {completedArticles.has(lesson.id) && (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-sm font-mono text-muted-foreground">
                      Article {lesson.order_index}
                    </span>
                    <h3 className="text-lg font-bold mt-1">{lesson.title}</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {lesson.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(lesson.difficulty)}>
                      {lesson.difficulty}
                    </Badge>
                    <Badge variant="outline">5 Questions</Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
