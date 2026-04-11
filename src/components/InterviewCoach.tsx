import React, { useState } from 'react';
import { InterviewQuestion, InterviewFeedback } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { generateInterviewQuestions, getInterviewFeedback } from '@/src/services/gemini';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

export default function InterviewCoach() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStart = async () => {
    if (!jobTitle.trim() || !jobDescription.trim()) {
      toast.error('Please provide both job title and description');
      return;
    }
    setIsLoading(true);
    try {
      const q = await generateInterviewQuestions(jobTitle, jobDescription);
      setQuestions(q);
      setCurrentQuestionIdx(0);
      setFeedback(null);
      setAnswer('');
    } catch (error) {
      toast.error('Failed to generate questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setIsAnalyzing(true);
    try {
      const f = await getInterviewFeedback(questions[currentQuestionIdx].question, answer);
      setFeedback(f);
    } catch (error) {
      toast.error('Failed to get feedback');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setAnswer('');
      setFeedback(null);
    } else {
      toast.success('Interview session complete!');
      setQuestions([]);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Interview Practice</h2>
          <p className="text-muted-foreground">
            Enter the details of the job you're applying for, and our AI will coach you through the interview.
          </p>
        </div>
        
        <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <Input 
                placeholder="e.g. Senior Frontend Engineer" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description / Requirements</label>
              <Textarea 
                placeholder="Paste the job description here..." 
                className="min-h-[200px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
            <Button 
              className="w-full h-12 text-lg font-semibold gap-2" 
              onClick={handleStart}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Start Interview Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Interview Session</h2>
          <p className="text-sm text-muted-foreground">Question {currentQuestionIdx + 1} of {questions.length}</p>
        </div>
        <Button variant="ghost" onClick={() => setQuestions([])}>End Session</Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl leading-tight">{currentQuestion.question}</CardTitle>
                  <CardDescription>Think about your experience and be specific.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <Textarea 
                placeholder="Type your answer here..." 
                className="min-h-[150px] text-lg leading-relaxed"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={!!feedback || isAnalyzing}
              />
              {!feedback && (
                <Button 
                  className="w-full h-12 gap-2" 
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || isAnalyzing}
                >
                  {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Submit Answer for Feedback
                </Button>
              )}
            </CardContent>
          </Card>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-none shadow-md bg-white overflow-hidden">
                  <div className="p-6 text-center space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Score</p>
                    <div className="text-6xl font-black text-primary">{feedback.score}<span className="text-2xl text-muted-foreground">/10</span></div>
                  </div>
                </Card>
                
                <Card className="md:col-span-2 border-none shadow-md bg-white">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Strengths
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1 text-slate-600">
                        {feedback.strengths.map((s, i) => <li key={`strength-${i}`}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-amber-600 font-semibold">
                        <AlertCircle className="w-4 h-4" /> Areas for Improvement
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1 text-slate-600">
                        {feedback.improvements.map((imp, i) => <li key={`improvement-${i}`}>{imp}</li>)}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Suggested Answer</CardTitle>
                  <CardDescription>A model response for this question</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <ReactMarkdown>{feedback.suggestedAnswer}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full h-12 text-lg" variant="outline" onClick={nextQuestion}>
                {currentQuestionIdx === questions.length - 1 ? 'Finish Session' : 'Next Question'}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
