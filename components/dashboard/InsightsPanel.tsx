'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Activity, ShieldAlert, Zap, TrendingUp, ChevronRight, CheckCircle2, ServerCrash, AlertTriangle, Download, Copy, FileText, PartyPopper, Database, Network, FileLock } from 'lucide-react';
import { IssueCard } from './IssueCard';
import { AnalysisResult, Issue } from '@/lib/schema';

interface InsightsPanelProps {
  analysis: AnalysisResult | null;
  isLoading?: boolean;
  activePersona?: any;
}

// Cinematic stagger for demo wow-factor
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.35, delayChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20, filter: 'blur(10px)' },
  show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

export function InsightsPanel({ analysis, isLoading, activePersona }: InsightsPanelProps) {
  // Staged AI Reasoning Simulation
  const loadingStates = ["Analyzing architecture...", "Scanning vulnerabilities...", "Evaluating performance...", "Generating insights..."];
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingStates.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex-1 w-full h-full min-h-[500px] flex items-center justify-center border border-white/5 bg-[#050505] rounded-2xl relative overflow-hidden shadow-2xl">
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(${activePersona?.theme.color === 'red' ? '239,68,68' : '56,189,248'},0.05),transparent_70%)]`} />
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative w-16 h-16">
            <div className={`absolute inset-0 rounded-full border-t-2 border-r-2 border-${activePersona?.theme.color || 'sky'}-400 animate-[spin_2s_linear_infinite] opacity-70`} />
            <div className={`absolute inset-2 rounded-full border-b-2 border-l-2 border-${activePersona?.theme.color || 'sky'}-600 animate-[spin_3s_linear_infinite_reverse] opacity-50`} />
            <Activity className={`absolute inset-0 m-auto text-${activePersona?.theme.color || 'sky'}-400 animate-pulse`} size={24} />
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-gray-400 font-medium tracking-widest uppercase text-sm"
            >
              {loadingStates[loadingStep]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex-1 w-full h-full min-h-[500px] flex flex-col items-center justify-center border border-white/10 bg-white/[0.02] rounded-2xl backdrop-blur-xl shadow-2xl group transition-colors hover:bg-white/[0.04]">
        <div className="p-4 rounded-full bg-white/5 mb-6 group-hover:scale-110 transition-transform duration-500">
          <Activity className="w-12 h-12 text-gray-600 group-hover:text-gray-400 transition-colors" />
        </div>
        <h2 className="text-xl font-medium text-gray-300 mb-2 tracking-tight">No Analysis Data</h2>
        <p className="text-gray-500 text-center max-w-sm text-sm leading-relaxed">
          Submit your PR URL or code snippet to receive comprehensive AI engineering insights.
        </p>
      </div>
    );
  }

  const { issues, health_score, merge_recommendation } = analysis;

  const severityCount = issues.reduce((acc: Record<string, number>, issue: Issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const healthColor = health_score > 80 ? 'text-emerald-400' : health_score > 60 ? 'text-yellow-400' : 'text-red-400';
  const healthGlow = health_score > 80 ? 'shadow-[0_0_30px_rgba(52,211,153,0.3)]' : health_score > 60 ? 'shadow-[0_0_30px_rgba(250,204,21,0.3)]' : 'shadow-[0_0_30px_rgba(248,113,113,0.3)]';
  const strokeColor = health_score > 80 ? '#34D399' : health_score > 60 ? '#FACC15' : '#F87171';
  
  // Fake realistic risk metrics for wow-factor
  const deploymentRisk = health_score > 80 ? 'Low' : health_score > 60 ? 'Moderate' : 'Critical';
  const deploymentColor = health_score > 80 ? 'text-emerald-400' : health_score > 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full max-w-3xl mx-auto"
    >
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Health Score Ring */}
        <motion.div variants={itemVariants} className="flex items-center justify-between p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div>
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">PR Health Score</h3>
            <p className="text-4xl font-bold text-white tracking-tight">{health_score}<span className="text-gray-500 text-xl font-normal">/100</span></p>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
              <span className="text-gray-500">Readiness:</span>
              <span className={healthColor}>{health_score > 80 ? 'Production Ready' : health_score > 60 ? 'Requires Revision' : 'Do Not Deploy'}</span>
            </div>
          </div>
          
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center bg-black/40 ${healthGlow}`}>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="36" className="fill-none stroke-white/10" strokeWidth="6" />
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                className="fill-none drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                stroke={strokeColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="226.19"
                initial={{ strokeDashoffset: 226.19 }}
                animate={{ strokeDashoffset: 226.19 - (226.19 * health_score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
            <Activity className={healthColor} size={24} />
          </div>
        </motion.div>

        {/* Merge Recommendation & Deployment Risk */}
        <motion.div variants={itemVariants} className="flex flex-col justify-center p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">Merge Recommendation</h3>
          <div className="flex items-center gap-4 mb-3">
            <div className={`p-2.5 rounded-xl shadow-inner ${merge_recommendation === 'Safe to Merge' ? 'bg-emerald-500/20 text-emerald-400' : merge_recommendation === 'Needs Changes' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
              {merge_recommendation === 'Safe to Merge' ? <CheckCircle2 size={24} /> : merge_recommendation === 'Needs Changes' ? <TrendingUp size={24} /> : <ShieldAlert size={24} />}
            </div>
            <div>
              <p className="text-xl font-semibold text-white tracking-tight">{merge_recommendation}</p>
              <p className="text-sm text-gray-400 mt-0.5 font-mono">{issues.length} Issues Detected</p>
            </div>
          </div>
          
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-gray-500 uppercase tracking-wider font-semibold">Deployment Risk</span>
            <div className={`flex items-center gap-1.5 font-bold ${deploymentColor}`}>
              {deploymentRisk === 'Low' ? <CheckCircle2 size={12} /> : deploymentRisk === 'Moderate' ? <AlertTriangle size={12} /> : <ServerCrash size={12} />}
              {deploymentRisk}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Severity Distribution */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 p-5 rounded-xl border border-white/5 bg-[#0a0a0a] shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LD  MjU1LCAyNTUsIDAuMDUpIi8+PC9zdmc+')] [mask-image:linear-gradient(to_right,white,transparent)]" />
        <span className="text-sm font-medium text-gray-400 relative z-10">Risk Breakdown:</span>
        <div className="flex-1 flex gap-1 h-2.5 rounded-full overflow-hidden bg-white/5 relative z-10">
          {['Critical', 'High', 'Medium', 'Low'].map((sev) => {
            const count = severityCount[sev] || 0;
            if (count === 0) return null;
            const width = `${(count / issues.length) * 100}%`;
            const bg = sev === 'Critical' ? 'bg-red-500' : sev === 'High' ? 'bg-orange-500' : sev === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500';
            return <motion.div key={sev} initial={{ width: 0 }} animate={{ width }} transition={{ duration: 1, delay: 0.5 }} className={`h-full ${bg} relative`} title={`${count} ${sev}`}>
               <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>;
          })}
        </div>
        <div className="flex gap-4 text-xs font-medium text-gray-400 shrink-0 relative z-10">
          {severityCount['Critical'] > 0 && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>{severityCount['Critical']} Critical</span>}
          {severityCount['High'] > 0 && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>{severityCount['High']} High</span>}
          {severityCount['Medium'] > 0 && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]"></span>{severityCount['Medium']} Med</span>}
        </div>
      </motion.div>

      {/* RAG Context Display */}
      {(analysis as any).ragContext && (analysis as any).ragContext.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3 p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
              <Network size={16} /> Enterprise RAG Pipeline Active
            </h3>
            <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500/80 px-2 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/10">Vector Search</span>
          </div>
          <p className="text-xs text-gray-400 font-medium relative z-10">The AI successfully retrieved and applied the following company standards to this review:</p>
          <div className="flex flex-col gap-3 mt-2 relative z-10">
            {(analysis as any).ragContext.map((doc: any) => (
              <div key={doc.id} className="p-3.5 rounded-lg bg-black/40 border border-indigo-500/20 text-xs flex flex-col gap-2 group hover:border-indigo-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileLock size={14} className="text-indigo-400" />
                    <span className="font-semibold text-indigo-300">{doc.id} • {doc.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                    Score: {(doc.relevanceScore * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="text-gray-400 leading-relaxed font-light pl-5">{doc.content}</span>
                <div className="flex items-center gap-4 pl-5 mt-1 text-[10px] font-medium text-gray-500">
                  <span>Category: <span className="text-gray-400">{doc.category}</span></span>
                  <span>Author: <span className="text-gray-400">{doc.author}</span></span>
                  <span>Updated: <span className="text-gray-400">{doc.lastUpdated}</span></span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Issues List */}
      <div className="flex flex-col gap-4 mt-2">
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-white flex items-center gap-2 tracking-tight">
            <Zap className={activePersona ? activePersona.theme.badgeText : "text-sky-400"} size={20} /> AI Engineering Insights
          </h3>
          {activePersona && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border border-${activePersona.theme.color}-500/20 ${activePersona.theme.badgeBg} ${activePersona.theme.badgeText} shadow-[0_0_10px_currentColor] opacity-80`}>
              Reviewed by {activePersona.name}
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md border border-white/5 transition-all text-gray-400 hover:text-white" title="Copy Review Summary">
              <Copy size={16} />
            </button>
            <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md border border-white/5 transition-all text-gray-400 hover:text-white" title="Export as Markdown">
              <FileText size={16} />
            </button>
            <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md border border-white/5 transition-all text-gray-400 hover:text-white" title="Download JSON">
              <Download size={16} />
            </button>
          </div>
        </motion.div>
        
        {issues.length === 0 ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-10 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="p-4 rounded-full bg-emerald-500/20 mb-4 animate-bounce">
              <PartyPopper className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-emerald-400 mb-2">Production Ready!</h3>
            <p className="text-gray-400 text-sm text-center max-w-md">No issues detected by the AI. The architecture is sound, secure, and performant. Safe to merge into main.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
          {issues.map((issue: Issue, index: number) => (
            <motion.div key={index} variants={itemVariants}>
              <IssueCard issue={issue} />
            </motion.div>
          ))}
          </div>
        )}
      </div>

    </motion.div>
  );
}