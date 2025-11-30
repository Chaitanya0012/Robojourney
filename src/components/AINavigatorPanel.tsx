import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  HelpCircle, 
  Rocket, 
  Target,
  Clock,
  Zap,
  RefreshCw,
  X,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAINavigator, NavigatorResponse, PlanStep } from '@/hooks/useAINavigator';
import { useAuth } from '@/contexts/AuthContext';

interface AINavigatorPanelProps {
  onClose?: () => void;
  initialEvent?: string;
  className?: string;
}

const stepTypeIcons: Record<string, React.ReactNode> = {
  article: <BookOpen className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
  project: <Rocket className="h-4 w-4" />,
  simulation: <Target className="h-4 w-4" />,
  review: <RefreshCw className="h-4 w-4" />,
  checkpoint: <Zap className="h-4 w-4" />,
};

const difficultyColors = [
  'bg-emerald-500/20 text-emerald-400',
  'bg-green-500/20 text-green-400',
  'bg-yellow-500/20 text-yellow-400',
  'bg-orange-500/20 text-orange-400',
  'bg-red-500/20 text-red-400',
];

export function AINavigatorPanel({ onClose, initialEvent = 'manual_request', className = '' }: AINavigatorPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getNavigatorGuidance, response, isLoading, error, clearResponse } = useAINavigator();
  const [userInput, setUserInput] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Auto-fetch guidance on mount if user is logged in
  useEffect(() => {
    if (user && !hasInitialized && !response) {
      setHasInitialized(true);
      getNavigatorGuidance(initialEvent);
    }
  }, [user, hasInitialized, response, initialEvent, getNavigatorGuidance]);

  const handleAskNavigator = async () => {
    if (!userInput.trim()) return;
    await getNavigatorGuidance('manual_request', userInput);
    setUserInput('');
  };

  const handleNavigate = (step: PlanStep) => {
    if (!step.target_id) return;
    
    // Navigate based on step type
    if (step.step_type === 'article') {
      navigate(`/quiz?article=${step.target_id}`);
    } else if (step.step_type === 'quiz') {
      navigate(`/quiz?article=${step.target_id.replace('quiz:', '')}`);
    } else if (step.step_type === 'simulation') {
      navigate('/simulator');
    } else if (step.step_type === 'project') {
      navigate('/simulator');
    } else {
      navigate('/quiz-dashboard');
    }
  };

  const handleUIAction = (response: NavigatorResponse) => {
    const { ui_action, ui_payload } = response;
    
    switch (ui_action) {
      case 'NAVIGATE':
        const payload = ui_payload as { target_type?: string; target_id?: string };
        if (payload.target_type === 'article' && payload.target_id) {
          navigate(`/quiz?article=${payload.target_id}`);
        } else if (payload.target_type === 'quiz') {
          navigate('/quiz');
        } else if (payload.target_type === 'simulation') {
          navigate('/simulator');
        } else if (payload.target_type === 'dashboard') {
          navigate('/quiz-dashboard');
        }
        break;
      case 'SHOW_PLAN':
        // Plan is already shown in the UI
        break;
      case 'REVIEW':
        navigate('/quiz-dashboard');
        break;
      default:
        break;
    }
  };

  if (!user) {
    return (
      <Card className={`p-6 glass-card ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/20">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Navigator</h3>
            <p className="text-xs text-muted-foreground">Your personal learning guide</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Sign in to get personalized learning guidance powered by AI.
        </p>
        <Button 
          className="mt-4 w-full" 
          onClick={() => navigate('/auth')}
        >
          Sign In to Start
        </Button>
      </Card>
    );
  }

  return (
    <Card className={`glass-card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 animate-pulse">
              <Compass className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                AI Navigator
                <Sparkles className="h-4 w-4 text-accent" />
              </h3>
              <p className="text-xs text-muted-foreground">Your personalized learning guide</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-4">
          {/* Loading State */}
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <Compass className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-sm text-muted-foreground">Analyzing your learning path...</p>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/30"
              >
                <p className="text-sm text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => getNavigatorGuidance()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </motion.div>
            )}

            {/* Response */}
            {response && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Message */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm leading-relaxed">{response.message}</p>
                </div>

                {/* Clarification Options */}
                {response.ui_action === 'ASK_CLARIFICATION' && response.ui_payload?.options && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Choose your path:
                    </p>
                    <div className="grid gap-2">
                      {(response.ui_payload.options as string[]).map((option, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="justify-start h-auto py-3 text-left"
                          onClick={() => getNavigatorGuidance('manual_request', option)}
                        >
                          <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{option}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Plan */}
                {response.plan && response.plan.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Your Learning Plan
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {response.plan.length} step{response.plan.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {response.plan.map((step, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group"
                        >
                          <button
                            onClick={() => handleNavigate(step)}
                            className="w-full p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 rounded bg-primary/10 text-primary mt-0.5">
                                {stepTypeIcons[step.step_type] || <BookOpen className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-primary capitalize">
                                    {step.step_type}
                                  </span>
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-[10px] ${difficultyColors[step.difficulty - 1] || difficultyColors[0]}`}
                                  >
                                    Lvl {step.difficulty}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium truncate">
                                  {step.target_id?.replace('article:', '').replace('quiz:', '').replace(/_/g, ' ') || 'Next Step'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {step.reason}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{step.expected_duration_minutes} min</span>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Action */}
                {response.ui_action === 'NAVIGATE' && (
                  <Button 
                    className="w-full"
                    onClick={() => handleUIAction(response)}
                  >
                    <Rocket className="h-4 w-4 mr-2" />
                    Start Learning
                  </Button>
                )}

                {/* Skill Update Preview */}
                {response.skill_update && Object.keys(response.skill_update).length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Skill Levels:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(response.skill_update).slice(0, 6).map(([skill, value]) => (
                        <div key={skill} className="text-center">
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${(value as number) * 100}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 capitalize">
                            {skill.replace('_', ' ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 bg-card/50">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskNavigator()}
              placeholder="Ask for guidance..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button 
            onClick={handleAskNavigator}
            disabled={isLoading || !userInput.trim()}
            size="sm"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => getNavigatorGuidance()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
