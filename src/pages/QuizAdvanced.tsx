import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";

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

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className="flex gap-4 text-sm">
              <div>XP: {stats.xp}</div>
              <div>Streak: {stats.streak}</div>
              <div className="text-green-500">✓ {stats.correct}</div>
              <div className="text-red-500">✗ {stats.incorrect}</div>
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
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
