import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjectNavigator, Question } from '@/hooks/useProjectNavigator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Compass, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Clock,
  Target,
  BookOpen,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

export function ProjectNavigatorPanel() {
  const { user } = useAuth();
  const { 
    sendMessage, 
    submitAnswers,
    startNewProject,
    response, 
    isLoading, 
    error,
    currentMode,
    conversationHistory,
  } = useProjectNavigator();

  const [inputMessage, setInputMessage] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleSubmitAnswers = async () => {
    if (Object.keys(questionAnswers).length === 0) return;
    await submitAnswers(questionAnswers);
    setQuestionAnswers({});
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'assessment_questions': return <MessageSquare className="h-4 w-4" />;
      case 'assessment_feedback': return <Target className="h-4 w-4" />;
      case 'project_plan': return <BookOpen className="h-4 w-4" />;
      case 'live_guidance': return <Lightbulb className="h-4 w-4" />;
      default: return <Compass className="h-4 w-4" />;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'assessment_questions': return 'Assessment';
      case 'assessment_feedback': return 'Analysis';
      case 'project_plan': return 'Planning';
      case 'live_guidance': return 'Guidance';
      default: return 'Navigator';
    }
  };

  if (!user) {
    return (
      <Card className="p-6 bg-card/50 border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-primary/10">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Project Navigator</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Sign in to get personalized project guidance and mentoring.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card/50 border-border/50 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Project Navigator</h3>
            <div className="flex items-center gap-2">
              {getModeIcon(currentMode)}
              <span className="text-xs text-muted-foreground">{getModeLabel(currentMode)}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={startNewProject}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Conversation History */}
      <ScrollArea className="flex-1 mb-4 pr-2">
        <div className="space-y-3">
          {conversationHistory.length === 0 && !response && (
            <div className="text-center py-8">
              <Compass className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Describe your project to get started with personalized guidance.
              </p>
            </div>
          )}

          {conversationHistory.map((entry, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg text-sm ${
                entry.role === 'user'
                  ? 'bg-primary/10 ml-4'
                  : 'bg-muted/50 mr-4'
              }`}
            >
              {entry.content}
            </div>
          ))}

          {/* Questions Section */}
          {response?.questions && response.questions.length > 0 && (
            <div className="space-y-4 mt-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Assessment Questions
              </h4>
              {response.questions.map((q: Question) => (
                <QuestionInput
                  key={q.id}
                  question={q}
                  value={questionAnswers[q.id] || ''}
                  onChange={(val) => setQuestionAnswers(prev => ({ ...prev, [q.id]: val }))}
                />
              ))}
              <Button 
                onClick={handleSubmitAnswers} 
                disabled={isLoading || Object.keys(questionAnswers).length === 0}
                className="w-full"
              >
                Submit Answers
              </Button>
            </div>
          )}

          {/* Analysis Section */}
          {response?.analysis && (
            <div className="space-y-3 mt-4 p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Proficiency Analysis
              </h4>
              <div className="space-y-2">
                {Object.entries(response.analysis.proficiency).map(([skill, value]) => (
                  <div key={skill} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize">{skill}</span>
                      <span>{Math.round(value * 100)}%</span>
                    </div>
                    <Progress value={value * 100} className="h-1.5" />
                  </div>
                ))}
              </div>
              {response.analysis.risk_areas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Risk Areas:</p>
                  <div className="flex flex-wrap gap-1">
                    {response.analysis.risk_areas.map((area, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-destructive/10 text-destructive">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">{response.analysis.summary}</p>
            </div>
          )}

          {/* Plan Section */}
          {response?.plan && response.plan.length > 0 && (
            <div className="space-y-3 mt-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Project Plan
              </h4>
              <div className="space-y-2">
                {response.plan.map((step, idx) => (
                  <div 
                    key={step.step_id} 
                    className="p-3 bg-muted/30 rounded-lg border border-border/50"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{step.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {step.estimated_minutes}m
                          </span>
                          <span>Difficulty: {step.difficulty}/5</span>
                        </div>
                        {step.resources.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {step.resources.map((res, rIdx) => (
                              <a 
                                key={rIdx}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <ChevronRight className="h-3 w-3" />
                                {res.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guidance Section */}
          {response?.guidance && (
            <div className="space-y-3 mt-4">
              {response.guidance.warnings.length > 0 && (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Warnings
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs">
                    {response.guidance.warnings.map((w, idx) => (
                      <li key={idx}>{w.description}</li>
                    ))}
                  </ul>
                </div>
              )}

              {response.guidance.best_practices.length > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Best Practices
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs">
                    {response.guidance.best_practices.map((bp, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-primary" />
                        {bp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {response.guidance.meta_cognition_prompts.length > 0 && (
                <div className="p-3 bg-accent/50 rounded-lg">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Think About
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs italic text-muted-foreground">
                    {response.guidance.meta_cognition_prompts.map((prompt, idx) => (
                      <li key={idx}>"{prompt}"</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Describe your project or ask for guidance..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="min-h-[60px] resize-none"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isLoading || !inputMessage.trim()}
          size="icon"
          className="h-auto"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive mt-2">{error}</p>
      )}
    </Card>
  );
}

function QuestionInput({ 
  question, 
  value, 
  onChange 
}: { 
  question: Question; 
  value: string; 
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
      <p className="text-sm">{question.prompt}</p>
      <Badge variant="outline" className="text-xs">{question.dimension}</Badge>
      
      {question.expected_answer_type === 'free_text' && (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer..."
          className="min-h-[60px]"
        />
      )}

      {question.expected_answer_type === 'scale_1_5' && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              variant={value === String(n) ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange(String(n))}
            >
              {n}
            </Button>
          ))}
        </div>
      )}

      {question.expected_answer_type === 'multi_choice' && question.options.length > 0 && (
        <div className="space-y-1">
          {question.options.map((opt, idx) => (
            <Button
              key={idx}
              variant={value === opt ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => onChange(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
      )}

      {question.expected_answer_type === 'yes_no' && (
        <div className="flex gap-2">
          <Button
            variant={value === 'yes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange('yes')}
          >
            Yes
          </Button>
          <Button
            variant={value === 'no' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange('no')}
          >
            No
          </Button>
        </div>
      )}
    </div>
  );
}
