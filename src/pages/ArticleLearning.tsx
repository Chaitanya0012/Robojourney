import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Trophy, ArrowLeft, Edit3, Save, AlertCircle } from "lucide-react";
import { ArticleQuizCard } from "@/components/ArticleQuizCard";
import { MistakesList } from "@/components/MistakesList";
import { RichTextEditor } from "@/components/RichTextEditor";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { generateConceptQuestions } from "@/lib/questionGenerator";

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
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [completedArticles, setCompletedArticles] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

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
      const articleNum = selectedArticle!.order_index;
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .ilike('category', `Article ${articleNum}:%`);
      
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
      setShowQuiz(false);
    }
  };

  const handleBackToArticles = () => {
    setSelectedArticle(null);
    setShowQuiz(false);
    setIsEditing(false);
  };

  const mapToQuizBankFormat = (qs: QuizQuestion[], article: Lesson) =>
    qs.map((q, idx) => {
      const options = q.options || [];
      const correctIndex = Math.max(options.findIndex(opt => opt === q.correct_answer), 0);

      return {
        id: q.id || `${article.id}-db-${idx}`,
        articleId: article.id,
        question: q.question,
        options,
        correctIndex,
        explanation: q.explanation,
        difficulty: q.difficulty || "Medium",
      };
    });

  const persistArticleQuiz = (article: Lesson, bankEntries: ReturnType<typeof mapToQuizBankFormat>) => {
    const existingBankRaw = localStorage.getItem('robotics_generated_quiz_bank');
    const existingArticlesRaw = localStorage.getItem('robotics_basic_articles');

    const existingBank = existingBankRaw ? (JSON.parse(existingBankRaw) as any[]) : [];
    const filteredBank = existingBank.filter(q => q.articleId !== article.id);

    const existingArticles = existingArticlesRaw ? (JSON.parse(existingArticlesRaw) as any[]) : [];
    const updatedArticles = [
      ...existingArticles.filter((a: any) => a.id !== article.id),
      {
        id: article.id,
        title: article.title,
        content: article.content,
        category: article.category,
        difficulty: article.difficulty,
        wrong_vs_right: {
          wrong: `Skipping checks for ${article.category || 'robotics basics'}.`,
          right: `Reviewing ${article.category || 'robotics'} ideas carefully before building.`,
        },
      },
    ];

    localStorage.setItem('robotics_generated_quiz_bank', JSON.stringify([...filteredBank, ...bankEntries]));
    localStorage.setItem('robotics_basic_articles', JSON.stringify(updatedArticles));
  };

  const handleStartQuiz = () => {
    if (!selectedArticle) return;

    const availableQuestions =
      questions && questions.length > 0
        ? mapToQuizBankFormat(questions, selectedArticle)
        : generateConceptQuestions(selectedArticle).map((q) => ({
            ...q,
            articleId: selectedArticle.id,
          }));

    persistArticleQuiz(selectedArticle, availableQuestions);
    navigate(`/quiz?article=${selectedArticle.id}`, { state: { article: selectedArticle } });
  };

  const handleSaveArticle = async () => {
    if (!selectedArticle) return;
    
    try {
      const { error } = await supabase
        .from('robotics_articles')
        .update({ content: editedContent })
        .eq('id', selectedArticle.id);

      if (error) throw error;
      
      toast.success("Article saved successfully!");
      setIsEditing(false);
      setSelectedArticle({ ...selectedArticle, content: editedContent });
    } catch (error: any) {
      toast.error("Failed to save article");
      console.error(error);
    }
  };

  const handleStartEditing = () => {
    if (selectedArticle) {
      setEditedContent(selectedArticle.content);
      setIsEditing(true);
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
    if (showQuiz) {
      const generatedFallback = generateConceptQuestions(selectedArticle).map((q) => ({
        ...q,
        category: selectedArticle.category,
        correct_answer: q.options[q.correctIndex],
      }));

      return (
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => setShowQuiz(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Article
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
              <ArticleQuizCard
                article={selectedArticle}
                questions={generatedFallback}
                onComplete={handleArticleComplete}
              />
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={handleBackToArticles}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          
          <Card className="p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <Badge className={getDifficultyColor(selectedArticle.difficulty)} variant="secondary">
                  {selectedArticle.difficulty}
                </Badge>
                <h1 className="text-3xl font-bold mt-4 mb-2">{selectedArticle.title}</h1>
                <p className="text-muted-foreground">Article {selectedArticle.order_index} · {selectedArticle.category}</p>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleStartEditing}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="mb-8">
                <RichTextEditor 
                  content={editedContent}
                  onChange={setEditedContent}
                  editable={true}
                />
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSaveArticle}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                <div className="whitespace-pre-wrap">{selectedArticle.content}</div>
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t">
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="flex-1"
              >
                Start Quiz
              </Button>
              <Button 
                onClick={handleBackToArticles} 
                variant="outline"
                size="lg"
              >
                Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (showMistakes) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setShowMistakes(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          <MistakesList />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">
              Diagnostic Robotics Tutor
            </h1>
            <p className="text-muted-foreground text-lg">
              Learn through articles and test your knowledge
            </p>
          </div>
          <Button onClick={() => setShowMistakes(true)} variant="outline" size="lg">
            <AlertCircle className="h-5 w-5 mr-2" />
            View My Mistakes
          </Button>
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
