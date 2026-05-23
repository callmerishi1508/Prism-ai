'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Terminal, CheckCircle2, Info } from 'lucide-react';

export interface Issue {
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  line: number;
  explanation: string;
  suggested_fix?: string;
  confidence?: number;
}

interface IssueCardProps {
  issue: Issue;
}

const severityConfig = {
  Critical: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', shadow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]', icon: AlertCircle, glow: 'from-red-500/20' },
  High: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', shadow: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]', icon: AlertCircle, glow: 'from-orange-500/20' },
  Medium: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', shadow: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]', icon: Info, glow: 'from-yellow-500/20' },
  Low: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', shadow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]', icon: Info, glow: 'from-blue-500/20' },
};

export function IssueCard({ issue }: IssueCardProps) {
  const config = severityConfig[issue.severity] || severityConfig.Medium;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex flex-col p-5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] ${config.shadow}`}
    >
      {/* Decorative gradient blob on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl bg-gradient-to-br ${config.glow} to-transparent pointer-events-none blur-2xl -z-10`} />

      <div className="relative z-10 flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border ${config.bg} ${config.color} ${config.border}`}>
            <Icon size={14} />
            {issue.severity}
          </div>
          <span className="text-gray-400 text-sm font-mono bg-black/30 px-2 py-0.5 rounded border border-white/5">
            Line {issue.line}
          </span>
        </div>
        {issue.confidence && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <CheckCircle2 size={12} className="text-emerald-500/70" />
            <span>{Math.round(issue.confidence * 100)}% Confidence</span>
          </div>
        )}
      </div>

      <h3 className="relative z-10 text-base font-medium text-white mb-2 tracking-tight group-hover:text-sky-100 transition-colors">
        {issue.title}
      </h3>
      
      <p className="relative z-10 text-sm text-gray-400 leading-relaxed mb-4">
        {issue.explanation}
      </p>

      <div className="relative z-10 mt-auto pt-3 border-t border-white/10">
        <div className="flex items-start gap-2">
          <Terminal size={14} className="text-gray-500 mt-1 shrink-0" />
          <div className="w-full">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Suggested Fix</span>
            <code className="text-sm font-mono text-emerald-400/90 whitespace-pre-wrap break-all block bg-black/20 p-2.5 rounded border border-emerald-500/10">
              {issue.suggested_fix}
            </code>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
