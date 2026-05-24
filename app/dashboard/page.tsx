'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, ShieldAlert, Zap, Briefcase, GitMerge, ChevronDown } from 'lucide-react';
import { CodeEditor } from '@/components/dashboard/CodeEditor';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import ScanningOverlay from '@/components/animations/ScanningOverlay';
import { useAIRequest } from '@/hooks/useAIRequest';
import { PERSONAS, PersonaId } from '@/lib/personas';
import { DEMO_EXAMPLES } from '@/lib/demoExamples';
import { AnalysisResult } from '@/lib/schema';
import { DebugPanel } from '@/components/dashboard/DebugPanel';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  ShieldAlert,
  Zap,
  Briefcase
};

const DEFAULT_CODE = `// Welcome to PRISM AI
// Paste your code here or load a Demo PR to get an instant AI review.

function processUserData(user) {
  const query = "SELECT * FROM users WHERE id = " + user.id;
  db.execute(query);
  return [];
}`;

export default function DashboardPage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('javascript');
  const [persona, setPersona] = useState<PersonaId>('cto');
  const [isDemoMode, setIsDemoMode] = useState(true);

  const [latencyMs, setLatencyMs] = useState<number | undefined>();
  const { data: analysis, isLoading, execute, error } = useAIRequest<AnalysisResult>('/api/review/analyze');

  const handleAnalyze = async () => {
    if (!code || code.trim() === '') return;
    
    const start = Date.now();
    try {
      await execute({ code, persona, isDemoMode });
    } catch (err) {
      console.error("Analysis execution failed:", err);
    } finally {
      setLatencyMs(Date.now() - start);
    }
  };

  const handleLoadDemo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ex = DEMO_EXAMPLES.find(x => x.id === e.target.value);
    if (ex) {
      setCode(ex.code);
      setLanguage(ex.language);
      setPersona(ex.idealPersona);
    }
  };

  const activePersona = PERSONAS[persona];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-sky-500/30 overflow-x-hidden font-sans">
      <ScanningOverlay visible={isLoading} />
      <DebugPanel analysis={analysis} latencyMs={latencyMs} />
      
      {/* Dynamic Background ambient glow based on persona */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-1000">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-${activePersona.theme.color}-900/20 blur-[150px]`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[150px]`} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            <Bot size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">PRISM<span className="text-sky-400 font-light">AI</span></h1>
        </div>
        
        {/* Active Persona Chip */}
        <motion.div 
          key={persona}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border border-${activePersona.theme.color}-500/30 ${activePersona.theme.badgeBg} ${activePersona.theme.glow}`}
        >
          {React.createElement(ICON_MAP[activePersona.theme.icon], { size: 14, className: activePersona.theme.badgeText })}
          <span className={`text-sm font-semibold tracking-wide ${activePersona.theme.badgeText}`}>
            {activePersona.name} Mode Active
          </span>
        </motion.div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={isDemoMode} onChange={() => setIsDemoMode(!isDemoMode)} />
              <div className={`block w-10 h-5 rounded-full transition-colors duration-300 ${isDemoMode ? 'bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 ${isDemoMode ? 'translate-x-5' : ''}`}></div>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-200 transition-colors">Demo Mode</span>
          </label>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium border border-white/5 hover:border-white/10">
            <GitMerge size={16} /> Connect GitHub
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-col lg:flex-row gap-8 p-6 max-w-[1800px] mx-auto h-[calc(100vh-73px)]">
        
        {/* Left Column (Code & Controls) */}
        <div className="flex flex-col gap-6 w-full lg:w-1/2 h-full">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  onChange={handleLoadDemo}
                  className="appearance-none bg-black/40 border border-white/10 hover:border-white/20 text-gray-200 text-sm font-medium rounded-xl px-4 py-2.5 pr-10 outline-none transition-all cursor-pointer shadow-inner"
                >
                  <option value="">Load Demo PR...</option>
                  {DEMO_EXAMPLES.map(ex => (
                    <option key={ex.id} value={ex.id} className="bg-black text-white">{ex.title}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

              <div className="flex bg-black/50 rounded-xl p-1 border border-white/5">
                {Object.values(PERSONAS).map(p => {
                  const isActive = persona === p.id;
                  const Icon = ICON_MAP[p.theme.icon];
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id)}
                      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                    >
                      {isActive && (
                        <motion.div layoutId="personaGlow" className={`absolute inset-0 ${p.theme.badgeBg} ${p.theme.glow} rounded-lg border border-${p.theme.color}-500/50`} style={{ zIndex: -1 }} />
                      )}
                      <Icon size={14} className={isActive ? p.theme.badgeText : ''} />
                      <span className="relative z-10 hidden sm:inline">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`group relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold transition-all disabled:opacity-50 overflow-hidden bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] ml-auto`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Sparkles size={16} className="relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10">Analyze PR</span>
            </button>
          </div>

          {/* Editor Area */}
          <div className="flex-1 min-h-[500px]">
            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
            />
          </div>
        </div>

        {/* Right Column (Insights) */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto pr-2 custom-scrollbar pb-10">
          <InsightsPanel analysis={analysis} isLoading={isLoading} activePersona={activePersona} />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}