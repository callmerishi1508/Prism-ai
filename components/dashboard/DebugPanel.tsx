'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalSquare, X, ChevronDown, ChevronUp } from 'lucide-react';
import { AnalysisResult } from '@/lib/schema';

interface DebugPanelProps {
  analysis: AnalysisResult | null;
  rawJson?: string;
  latencyMs?: number;
}

export function DebugPanel({ analysis, rawJson, latencyMs }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-700 text-neutral-300 rounded-full shadow-2xl hover:bg-neutral-800 transition-colors font-mono text-xs"
          >
            <TerminalSquare size={14} className="text-emerald-400" />
            V2 Debug
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[400px] bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <TerminalSquare size={16} className="text-emerald-400" />
                <span className="text-xs font-mono text-gray-300 font-semibold tracking-wide">PRISM V2 DEBUG</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-500 hover:text-gray-300">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-300">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-4 ${isExpanded ? 'h-[500px]' : 'h-[200px]'}`}>
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-white/5 p-2 rounded border border-white/5">
                  <span className="text-gray-500 block mb-1">Latency</span>
                  <span className="text-emerald-400">{latencyMs ? `${latencyMs}ms` : 'N/A'}</span>
                </div>
                <div className="bg-white/5 p-2 rounded border border-white/5">
                  <span className="text-gray-500 block mb-1">Zod Status</span>
                  <span className={analysis ? "text-emerald-400" : "text-yellow-400"}>
                    {analysis ? 'Valid Schema' : 'Pending'}
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded border border-white/5">
                  <span className="text-gray-500 block mb-1">Prompt Version</span>
                  <span className="text-cyan-400">{analysis?.promptVersion || 'N/A'}</span>
                </div>
                <div className="bg-white/5 p-2 rounded border border-white/5">
                  <span className="text-gray-500 block mb-1">Active Model</span>
                  <span className="text-purple-400">gemini-2.5-pro</span>
                </div>
              </div>

              {/* Raw JSON viewer */}
              <div>
                <span className="text-xs font-mono text-gray-500 mb-1 block">Raw JSON Output</span>
                <pre className="text-[10px] font-mono text-gray-400 bg-black/50 p-2 rounded border border-white/5 overflow-x-auto">
                  {rawJson || (analysis ? JSON.stringify(analysis, null, 2) : 'No data yet...')}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
