import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Progress } from "@/components/ui/progress";

interface QuizQuestion {
  id: string;
  articleId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  wrong_vs_right: { wrong: string; right: string };
}

const defaultStats = () => ({ xp: 0, correct: 0, incorrect: 0, streak: 0 });

export default function QuizAdvanced() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const articleId = searchParams.get('article');

  const [stats, setStats] = useState(defaultStats);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showArticle, setShowArticle] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const bankRaw = localStorage.getItem('robotics_generated_quiz_bank');
    const articlesRaw = localStorage.getItem('robotics_basic_articles');
    
    if (bankRaw && articlesRaw) {
      const bank: QuizQuestion[] = JSON.parse(bankRaw);
      const articles: Article[] = JSON.parse(articlesRaw);
      
      if (articleId) {
        const filtered = bank.filter(q => q.articleId === articleId);
        setQuestions(filtered);
        const foundArticle = articles.find(a => a.id === articleId);
        setArticle(foundArticle || null);
      } else {
        setQuestions(bank);
      }
    }
  }, [articleId]);

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  const handleAnswer = (idx: number) => {
    if (!currentQ || feedback) return;
    const correct = idx === currentQ.correctIndex;
    setSelected(idx);
    setFeedback(correct ? "correct" : "incorrect");
    setStats(st => ({ 
      ...st, 
      xp: st.xp + (correct ? 10 : 0), 
      correct: st.correct + (correct ? 1 : 0), 
      incorrect: st.incorrect + (correct ? 0 : 1),
      streak: correct ? st.streak + 1 : 0
    }));
    setTimeout(() => setShowArticle(true), 400);
  };

  const nextQuestion = () => {
    setShowArticle(false);
    setSelected(null);
    setFeedback(null);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      navigate('/quiz-dashboard');
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No questions found</h2>
            <button onClick={() => navigate('/quiz-dashboard')} className="px-6 py-3 rounded-full bg-primary text-primary-foreground">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="min-h-screen p-6 text-foreground">
        <div className="max-w-4xl mx-auto">
          {article && (
            <div className="mb-6 p-4 rounded-xl bg-card border border-border">
              <h2 className="text-xl font-bold">{article.title}</h2>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{article.content}</p>
            </div>
          )}

          <div className="mb-6 grid gap-4 md:grid-cols-[1.4fr,1fr]">
            <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-[0.2em]">Question {currentIndex + 1} / {questions.length}</p>
                  <h2 className="text-xl font-semibold">Session Pulse</h2>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/40">
                  {currentQ?.difficulty || "adaptive"}
                </div>
              </div>
              <div className="mt-3">
                <Progress value={progressPercent} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Progress</span>
                  <span>{progressPercent}% complete</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground">XP</p>
                  <p className="text-lg font-semibold">{stats.xp}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-200/30">
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="text-lg font-semibold text-emerald-400">{stats.streak}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-200/30">
                  <p className="text-xs text-muted-foreground">Correct</p>
                  <p className="text-lg font-semibold text-emerald-300">{stats.correct}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-200/30">
                  <p className="text-xs text-muted-foreground">Missed</p>
                  <p className="text-lg font-semibold text-red-300">{stats.incorrect}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-background border border-border/60 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">AI Quiz Coach</p>
              <h3 className="text-lg font-semibold">Stay accurate & fast</h3>
              <p className="text-sm text-muted-foreground mt-2">
                The coach watches your streak and nudges you to review when accuracy dips. Keep momentum by pausing to scan explanations.
              </p>
              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Adaptive difficulty adjusts every two correct answers.
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> Finish strong by hitting 90%+ in the next two items.
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentQ && (
              <motion.div 
                key={currentQ.id} 
                initial={{ opacity: 0, y: 12 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -12 }}
                className="p-6 rounded-2xl bg-card border border-border shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{currentQ.difficulty}</div>
                    <h3 className="text-xl font-medium">{currentQ.question}</h3>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {currentQ.options.map((opt, i) => {
                    const isSel = selected === i;
                    const isCorrect = currentQ.correctIndex === i;
                    const showResult = feedback;
                    
                    let className = "w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all border ";
                    if (showResult) {
                      if (isCorrect) {
                        className += "border-green-500 bg-green-500/10";
                      } else if (isSel) {
                        className += "border-red-500 bg-red-500/10";
                      } else {
                        className += "border-border bg-card opacity-50";
                      }
                    } else {
                      className += isSel 
                        ? "border-primary bg-primary/10" 
                        : "border-border bg-card hover:border-primary/50";
                    }

                    return (
                      <motion.button 
                        key={i}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(i)}
                        className={className}
                        disabled={!!feedback}
                      >
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div className="flex-1 text-left">{opt}</div>
                        {showResult && isCorrect && (
                          <div className="text-sm text-green-500 font-medium">✓</div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {feedback && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className={`text-sm font-medium ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                      {feedback === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
                    </div>
                    <button 
                      onClick={nextQuestion}
                      className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {showArticle && currentQ && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-card border border-border"
            >
              <h4 className="font-semibold mb-2">Explanation</h4>
              <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
              {article?.wrong_vs_right && (
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-200/30">
                    <p className="text-xs uppercase tracking-wide text-red-200">Common mistake</p>
                    <p className="text-sm text-muted-foreground">{article.wrong_vs_right.wrong}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-200/30">
                    <p className="text-xs uppercase tracking-wide text-emerald-200">Do this instead</p>
                    <p className="text-sm text-muted-foreground">{article.wrong_vs_right.right}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
