'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, ShieldAlert, Zap, Briefcase, GitMerge, ChevronDown, Code, Key } from 'lucide-react';
import { CodeEditor } from '@/components/dashboard/CodeEditor';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import ScanningOverlay from '@/components/animations/ScanningOverlay';
import { useAIRequest } from '@/hooks/useAIRequest';
import { PERSONAS, PersonaId } from '@/lib/personas';
import { DEMO_EXAMPLES } from '@/lib/demoExamples';
import { AnalysisResult } from '@/lib/schema';
import { GitHubModal } from '@/components/dashboard/GitHubModal';
import { ApiKeyModal } from '@/components/dashboard/ApiKeyModal';
import { RepairedPreviewModal } from '@/components/dashboard/RepairedPreviewModal';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  ShieldAlert,
  Zap,
  Briefcase
};

const LANGUAGE_TEMPLATES: Record<string, string> = {
  javascript: `// Welcome to PRISM AI\n// Paste your JS code here for an instant AI review.\n\nfunction processUserData(user) {\n  const query = "SELECT * FROM users WHERE id = " + user.id;\n  db.execute(query);\n  return [];\n}`,
  typescript: `// Welcome to PRISM AI\n// Paste your TS code here...\n\nfunction processUserData(user: any): any[] {\n  const query = \`SELECT * FROM users WHERE id = \${user.id}\`;\n  db.execute(query);\n  return [];\n}`,
  python: `# Welcome to PRISM AI\n# Paste your Python code here...\n\ndef process_user_data(user):\n    query = f"SELECT * FROM users WHERE id = {user.id}"\n    db.execute(query)\n    return []`,
  java: `// Welcome to PRISM AI\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`,
  c: `// Welcome to PRISM AI\n\n#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}`,
  cpp: `// Welcome to PRISM AI\n\n#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}`,
  csharp: `// Welcome to PRISM AI\n\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello World");\n    }\n}`,
  go: `// Welcome to PRISM AI\n\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}`,
  rust: `// Welcome to PRISM AI\n\nfn main() {\n    println!("Hello World");\n}`,
  swift: `// Welcome to PRISM AI\n\nprint("Hello World")`,
  kotlin: `// Welcome to PRISM AI\n\nfun main() {\n    println("Hello World")\n}`,
  php: `<?php\n// Welcome to PRISM AI\n\necho "Hello World";\n?>`,
  ruby: `# Welcome to PRISM AI\n\nputs "Hello World"`,
  scala: `// Welcome to PRISM AI\n\nobject Main extends App {\n  println("Hello World")\n}`,
  dart: `// Welcome to PRISM AI\n\nvoid main() {\n  print('Hello World');\n}`,
  r: `# Welcome to PRISM AI\n\nprint("Hello World")`,
  'objective-c': `// Welcome to PRISM AI\n\n#import <Foundation/Foundation.h>\n\nint main(int argc, const char * argv[]) {\n    @autoreleasepool {\n        NSLog(@"Hello World");\n    }\n    return 0;\n}`,
  lua: `-- Welcome to PRISM AI\n\nprint("Hello World")`,
  perl: `# Welcome to PRISM AI\n\nprint "Hello World\\n";`,
  sql: `-- Welcome to PRISM AI\n\nSELECT * FROM users LIMIT 10;`,
  graphql: `# Welcome to PRISM AI\n\nquery {\n  users {\n    id\n    name\n  }\n}`,
  shell: `# Welcome to PRISM AI\n\necho "Hello World"`,
  powershell: `# Welcome to PRISM AI\n\nWrite-Host "Hello World"`,
  html: `<!-- Welcome to PRISM AI -->\n\n<!DOCTYPE html>\n<html>\n<head>\n  <title>Hello</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>`,
  css: `/* Welcome to PRISM AI */\n\nbody {\n  margin: 0;\n  padding: 0;\n}`,
  scss: `/* Welcome to PRISM AI */\n\n$primary-color: #333;\nbody {\n  color: $primary-color;\n}`,
  json: `{\n  "message": "Welcome to PRISM AI"\n}`,
  yaml: `# Welcome to PRISM AI\n\nmessage: "Hello World"`,
  xml: `<!-- Welcome to PRISM AI -->\n\n<root>\n  <message>Hello World</message>\n</root>`,
  markdown: `# Welcome to PRISM AI\n\nWrite your markdown here.`,
  dockerfile: `# Welcome to PRISM AI\n\nFROM ubuntu:latest\nRUN echo "Hello World"`,
  solidity: `// Welcome to PRISM AI\n\npragma solidity ^0.8.0;\n\ncontract HelloWorld {\n    string public message = "Hello World";\n}`
};

const DEFAULT_CODE = LANGUAGE_TEMPLATES['javascript'];

export default function DashboardPage() {
  const [code, setCodeState] = useState(DEFAULT_CODE);
  const [language, setLanguageState] = useState('javascript');
  const [persona, setPersona] = useState<PersonaId>('cto');
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [isDemoMode, setIsDemoMode] = useState(searchParams.get('demo') === 'true');
  const { data: analysis, isLoading, execute, error, reset } = useAIRequest<AnalysisResult>('/api/review/analyze');

  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [repairedData, setRepairedData] = useState<any>(null);
  const [originalCodeSnapshot, setOriginalCodeSnapshot] = useState<string | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairProgress, setRepairProgress] = useState('');

  // Wrapper around setCode to automatically disable demo mode when user types
  const setCode = (newCode: string) => {
    // Prevent Monaco from resetting state if it fires an onChange without actual edits (e.g. newline normalization)
    if (newCode.replace(/\r\n/g, '\n') === code.replace(/\r\n/g, '\n')) return;
    
    setCodeState(newCode);
    setIsDemoMode(false);
    setActiveDemo(null);
    if (analysis) reset();
  };

  const setLanguage = (newLang: string) => {
    // If the current code is one of our default templates, swap it to the new language's template
    const isCurrentCodeDefault = Object.values(LANGUAGE_TEMPLATES).includes(code) || code === DEFAULT_CODE || code.trim() === '';
    setLanguageState(newLang);
    if (isCurrentCodeDefault && LANGUAGE_TEMPLATES[newLang]) {
      setCodeState(LANGUAGE_TEMPLATES[newLang]);
    }
  };
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const [latencyMs, setLatencyMs] = useState<number | undefined>();

  const handleAnalyze = async (overrideCode?: string, overrideDemoMode?: boolean) => {
    const codeToAnalyze = overrideCode !== undefined ? overrideCode : code;
    const demoModeToUse = overrideDemoMode !== undefined ? overrideDemoMode : isDemoMode;
    if (!codeToAnalyze || codeToAnalyze.trim() === '') return;
    
    const start = Date.now();
    try {
      await execute({ code: codeToAnalyze, language, persona, isDemoMode: demoModeToUse });
    } catch (err) {
      console.error("Analysis execution failed:", err);
    } finally {
      setLatencyMs(Date.now() - start);
    }
  };

  const handleGitHubFetch = (diff: string) => {
    setCode(diff);
    setIsDemoMode(false); // Automatically turn off demo mode for real PRs
    // Auto trigger analysis with the new diff
    handleAnalyze(diff, false);
  };

  const handleGenerateRepair = async (isAlternative: boolean = false) => {
    if (!analysis || !analysis.issues.length) return;
    
    setIsRepairing(true);
    const messages = isAlternative 
      ? ["Exploring alternative architectural patterns...", "Synthesizing a different approach...", "Re-evaluating solution space..."] 
      : ["Synthesizing production-safe revision...", "Applying architectural corrections...", "Rebuilding optimized implementation...", "Validating refactor consistency..."];
      
    let i = 0;
    const interval = setInterval(() => {
      setRepairProgress(messages[i]);
      i = (i + 1) % messages.length;
    }, 1500);
    setRepairProgress(messages[0]);

    try {
      const apiKeyStr = localStorage.getItem('prism_custom_api_key');
      const response = await fetch('/api/review/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          issues: analysis.issues,
          persona,
          language,
          customApiKey: apiKeyStr || undefined,
          isAlternative,
          previousRepairedCode: isAlternative ? repairedData?.repairedCode : undefined
        })
      });

      if (!response.ok) throw new Error('Repair failed');
      const data = await response.json();
      setRepairedData(data);
      setIsRepairModalOpen(true);
    } catch (error) {
      console.error(error);
      alert('Failed to generate repaired version. See console.');
    } finally {
      clearInterval(interval);
      setIsRepairing(false);
    }
  };

  const applyRepairedCode = () => {
    if (repairedData?.repairedCode) {
      setOriginalCodeSnapshot(code);
      setCodeState(repairedData.repairedCode);
    }
  };

  const restoreOriginalCode = () => {
    if (originalCodeSnapshot) {
      setCodeState(originalCodeSnapshot);
      setOriginalCodeSnapshot(null);
    }
  };

  const handleLoadDemo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const demoId = e.target.value;
    if (!demoId) {
       setActiveDemo(null);
       return;
    }
    const ex = DEMO_EXAMPLES.find(x => x.id === demoId);
    if (ex) {
      setCodeState(ex.code);
      setLanguageState(ex.language);
      setPersona(ex.idealPersona);
      setActiveDemo(ex.id);
      setIsDemoMode(true); // Automatically turn ON Demo Mode for built-in demos
      handleAnalyze(ex.code, true);
    }
  };

  const activePersona = PERSONAS[persona];

  return (
    <div className="lg:h-screen min-h-screen bg-[#050505] text-gray-200 selection:bg-sky-500/30 overflow-auto lg:overflow-hidden font-sans flex flex-col">
      <ScanningOverlay visible={isLoading} />
      
      {/* Dynamic Background ambient glow based on persona */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-1000">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-${activePersona.theme.color}-900/20 blur-[150px]`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[150px]`} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="PRISM AI Logo" width={44} height={44} className="drop-shadow-[0_0_10px_rgba(56,189,248,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-shadow opacity-90 group-hover:opacity-100" />
          <h1 className="text-xl font-bold tracking-tight text-white">PRISM<span className="text-sky-400 font-light">AI</span></h1>
        </Link>
        
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
          {/* Live Status & Model Microtext */}
          <div className="hidden lg:flex items-center gap-4 border-r border-white/10 pr-6 mr-2">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
               <span className="text-[10px] uppercase tracking-widest text-emerald-500/80 font-medium">AI Engine Operational</span>
             </div>
             <div className="flex items-center gap-1">
               <Code size={10} className="text-gray-500" />
               <span className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">gemini-2.5-pro</span>
             </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={isDemoMode} onChange={() => setIsDemoMode(!isDemoMode)} />
              <div className={`block w-10 h-5 rounded-full transition-colors duration-300 ${isDemoMode ? 'bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 ${isDemoMode ? 'translate-x-5' : ''}`}></div>
            </div>
            <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-200 transition-colors">Demo Mode</span>
          </label>
          <button 
            onClick={() => setIsGitHubModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.02] hover:bg-white/5 transition-colors text-xs font-medium border border-white/[0.05] hover:border-white/10 text-gray-400 hover:text-gray-300 opacity-90 hover:opacity-100"
          >
            <GitMerge size={14} /> <span className="hidden sm:inline">Connect GitHub</span>
          </button>
          <button 
            onClick={() => setIsApiKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors text-xs font-medium border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 opacity-90 hover:opacity-100"
          >
            <Key size={14} /> <span className="hidden sm:inline">API Key</span>
          </button>
        </div>
      </header>

      <GitHubModal 
        isOpen={isGitHubModalOpen} 
        onClose={() => setIsGitHubModalOpen(false)} 
        onFetchSuccess={handleGitHubFetch} 
      />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
      {repairedData && (
        <RepairedPreviewModal
          isOpen={isRepairModalOpen}
          onClose={() => setIsRepairModalOpen(false)}
          originalCode={code}
          repairedCode={repairedData.repairedCode}
          language={language}
          summary={repairedData.summary}
          riskLevel={repairedData.riskLevel}
          linesModified={repairedData.linesModified}
          vulnerabilitiesResolved={repairedData.vulnerabilitiesResolved}
          onApplyChanges={applyRepairedCode}
          onRegenerateAlternative={() => handleGenerateRepair(true)}
          isRepairing={isRepairing}
          repairProgress={repairProgress}
        />
      )}

      <main className="relative z-10 flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1800px] mx-auto flex-1 w-full min-h-0">
        
        {/* Left Column (Code & Controls) */}
        <div className="flex flex-col gap-6 w-full lg:w-1/2 lg:h-full lg:min-h-0 lg:overflow-y-auto overflow-x-hidden lg:pr-2 custom-scrollbar">
          {/* Controls Bar */}
          <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-lg">
            <div className="flex flex-wrap items-center gap-4 w-full 2xl:w-auto">
              <div className="relative w-full sm:w-auto group">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                <select
                  value={activeDemo || ''}
                  onChange={handleLoadDemo}
                  className="relative appearance-none w-full sm:w-auto bg-black/40 border border-white/10 group-hover:border-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] text-gray-200 text-sm font-medium rounded-xl px-4 py-2.5 pr-10 outline-none transition-all cursor-pointer shadow-inner min-w-[160px] bg-gradient-to-b from-white/[0.03] to-transparent"
                >
                  <option value="">Load Demo PR...</option>
                  {DEMO_EXAMPLES.map(ex => (
                    <option key={ex.id} value={ex.id} className="bg-black text-white">{ex.title}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-200 transition-colors" />
              </div>

              <div className="h-px w-full sm:h-6 sm:w-px bg-white/10 hidden sm:block"></div>

              <div className="flex flex-nowrap overflow-x-auto custom-scrollbar-hidden bg-black/50 rounded-xl p-1 border border-white/5 w-full sm:w-auto max-w-full">
                {Object.values(PERSONAS).map(p => {
                  const isActive = persona === p.id;
                  const Icon = ICON_MAP[p.theme.icon];
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id)}
                      className={`relative flex items-center justify-center flex-none gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
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
              onClick={() => handleAnalyze()}
              disabled={isLoading}
              className={`group w-full 2xl:w-auto relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold transition-all disabled:opacity-50 overflow-hidden bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Sparkles size={16} className="relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10">Analyze PR</span>
            </button>
          </div>

          {/* Persona and Demo Info Panel */}
          <div className={`p-4 rounded-xl border transition-colors duration-300 ${activePersona.theme.badgeBg} border-${activePersona.theme.color}-500/20`}>
             <div className="flex items-start gap-3">
               <div className={`p-2 rounded-lg bg-${activePersona.theme.color}-500/10`}>
                 {React.createElement(ICON_MAP[activePersona.theme.icon], { size: 18, className: activePersona.theme.badgeText })}
               </div>
               <div>
                 <h4 className={`text-sm font-semibold mb-1 ${activePersona.theme.badgeText}`}>
                   {activePersona.name} Focus
                 </h4>
                 <p className="text-sm text-gray-400 font-light leading-relaxed">
                   {activePersona.systemRole} This persona prioritizes: <span className="font-medium text-gray-300">{activePersona.reviewPriorities.join(', ')}</span>.
                 </p>
               </div>
             </div>
             
             {activeDemo && (
               <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-3">
                 <div className="p-2 rounded-lg bg-emerald-500/10">
                   <Code size={18} className="text-emerald-400" />
                 </div>
                 <div>
                   <h4 className="text-sm font-semibold mb-1 text-emerald-400">
                     Active Demo: {DEMO_EXAMPLES.find(d => d.id === activeDemo)?.title}
                   </h4>
                   <p className="text-sm text-gray-400 font-light leading-relaxed">
                     {DEMO_EXAMPLES.find(d => d.id === activeDemo)?.description} 
                     <br />
                     <span className="text-xs font-mono text-emerald-500/70 mt-1 block">Expected Issues: {DEMO_EXAMPLES.find(d => d.id === activeDemo)?.expectedIssues.join(', ')}</span>
                   </p>
                 </div>
               </div>
             )}
          </div>

          {/* Editor Area */}
          <div className="flex-1 min-h-[500px]">
            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
              onLanguageChange={setLanguage}
            />
            {originalCodeSnapshot && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={restoreOriginalCode}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Restore Original Code
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Insights) */}
        <div className="w-full lg:w-1/2 lg:h-full lg:overflow-y-auto overflow-x-hidden lg:pr-2 custom-scrollbar pb-10">
          <InsightsPanel 
            analysis={analysis} 
            isLoading={isLoading} 
            activePersona={activePersona} 
            onGenerateRepair={handleGenerateRepair}
            isRepairing={isRepairing}
            repairProgress={repairProgress}
            error={error} 
            latencyMs={latencyMs} 
          />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .custom-scrollbar-hidden::-webkit-scrollbar { display: none; }
        .custom-scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}