/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ResumeData } from './types';
import ResumeBuilder from './components/ResumeBuilder';
import ResumePreview from './components/ResumePreview';
import InterviewCoach from './components/InterviewCoach';
import SnakeGame from './components/SnakeGame';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { FileText, MessageSquare, Download, Sparkles, Github, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_DATA: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: ''
  },
  experience: [],
  education: [],
  skills: []
};

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('resume-data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [activeTab, setActiveTab] = useState('builder');

  useEffect(() => {
    localStorage.setItem('resume-data', JSON.stringify(resumeData));
  }, [resumeData]);

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-primary/20">
      <Toaster position="top-center" />
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">AI Career Coach</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <Github className="w-4 h-4" /> Star on GitHub
            </Button>
            {activeTab === 'builder' && (
              <Button onClick={handleDownload} variant="default" size="sm" className="gap-2">
                <Download className="w-4 h-4" /> Export PDF
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-lg grid-cols-3 h-12 p-1 bg-slate-200/50">
              <TabsTrigger value="builder" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                <FileText className="w-4 h-4" /> Resume Builder
              </TabsTrigger>
              <TabsTrigger value="coach" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                <MessageSquare className="w-4 h-4" /> Interview Coach
              </TabsTrigger>
              <TabsTrigger value="break" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                <Coffee className="w-4 h-4" /> Break Room
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <TabsContent key="tab-builder" value="builder" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
              >
                <div className="order-2 lg:order-1">
                  <ResumeBuilder data={resumeData} onChange={setResumeData} />
                </div>
                <div className="order-1 lg:order-2 lg:sticky lg:top-24">
                  <div className="bg-slate-200/50 p-4 rounded-xl border border-slate-200 overflow-hidden">
                    <div className="mb-4 flex items-center justify-between px-2">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Live Preview</h3>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-400 font-mono">A4 STANDARD</span>
                    </div>
                    <div className="scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.6] xl:scale-[0.75] origin-top transform-gpu transition-transform">
                      <ResumePreview data={resumeData} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent key="tab-coach" value="coach" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <InterviewCoach />
              </motion.div>
            </TabsContent>

            <TabsContent key="tab-break" value="break" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SnakeGame />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-preview, #resume-preview * {
            visibility: visible;
          }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}

