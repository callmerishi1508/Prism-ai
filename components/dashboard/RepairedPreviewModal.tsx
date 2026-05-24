'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiffEditor } from '@monaco-editor/react';
import { X, Copy, Check, Download, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface RepairedPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalCode: string;
  repairedCode: string;
  language: string;
  summary: string[];
  riskLevel: 'Low' | 'Moderate' | 'High';
  linesModified: number;
  vulnerabilitiesResolved: number;
  onApplyChanges: () => void;
  onRegenerateAlternative?: () => void;
  isRepairing?: boolean;
  repairProgress?: string;
}

export function RepairedPreviewModal({
  isOpen,
  onClose,
  originalCode,
  repairedCode,
  language,
  summary,
  riskLevel,
  linesModified,
  vulnerabilitiesResolved,
  onApplyChanges,
  onRegenerateAlternative,
  isRepairing,
  repairProgress
}: RepairedPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(repairedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([repairedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repaired-file.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'Low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'Low': return <ShieldCheck className="w-4 h-4 mr-1.5" />;
      case 'Moderate': return <AlertTriangle className="w-4 h-4 mr-1.5" />;
      case 'High': return <AlertTriangle className="w-4 h-4 mr-1.5" />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-7xl h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Zap className="w-5 h-5 text-fuchsia-400 mr-2" />
                Autonomous Refactor Preview
              </h2>
              <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center ${getRiskColor()}`}>
                {getRiskIcon()}
                {riskLevel} Risk Refactor
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex gap-4 text-sm font-medium">
                <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg">
                  <span className="text-white font-mono">{linesModified}</span> lines modified
                </div>
                {vulnerabilitiesResolved > 0 && (
                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <span className="font-mono">{vulnerabilitiesResolved}</span> issues resolved
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Summary Section */}
          <div className="px-6 py-4 bg-[#111] border-b border-white/5">
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Changes Applied</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {summary.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="flex items-start text-sm text-gray-300"
                >
                  <Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Diff Viewer */}
          <div className="flex-1 bg-[#1E1E1E] relative">
            <DiffEditor
              height="100%"
              original={originalCode}
              modified={repairedCode}
              language={language === 'vue' || language === 'react' ? 'javascript' : language}
              theme="vs-dark"
              options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy Full File'}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Patch
              </button>
            </div>
            
            <div className="flex gap-3 items-center">
              {isRepairing && (
                <div className="flex items-center text-indigo-400 text-sm mr-4">
                  <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mr-2" />
                  {repairProgress || "Regenerating..."}
                </div>
              )}
              {onRegenerateAlternative && (
                <button
                  onClick={onRegenerateAlternative}
                  disabled={isRepairing}
                  className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center"
                >
                  Regenerate Alternative
                </button>
              )}
              <button
                onClick={onClose}
                disabled={isRepairing}
                className="px-6 py-2 bg-transparent text-gray-400 hover:text-white transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onApplyChanges();
                  onClose();
                }}
                disabled={isRepairing}
                className="px-6 py-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-fuchsia-500/25 transition-all flex items-center disabled:opacity-50"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
