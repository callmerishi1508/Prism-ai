'use client';

import React, { useRef, useEffect } from 'react';
import { DiffEditor, DiffOnMount } from '@monaco-editor/react';
import { motion } from 'framer-motion';

interface DiffViewerProps {
  originalCode: string;
  updatedCode: string;
  language: string;
}

export function DiffViewer({ originalCode, updatedCode, language }: DiffViewerProps) {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.getOriginalEditor()?.getModel()?.dispose();
        editorRef.current.getModifiedEditor()?.getModel()?.dispose();
        editorRef.current.dispose();
      }
    };
  }, []);

  const handleEditorDidMount: DiffOnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col border border-white/10 rounded-xl overflow-hidden bg-[#0A0A0A] shadow-2xl w-full h-[600px]"
    >
      {/* Diff Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-gray-300 text-sm font-medium tracking-wide">
            Code Review Diff
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded-md border border-red-500/20">- Removed</span>
          <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded-md border border-green-500/20">+ Added</span>
        </div>
      </div>

      {/* Monaco Diff Editor */}
      <div className="flex-1 w-full h-full relative">
        <DiffEditor
          height="100%"
          language={language}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          original={originalCode}
          modified={updatedCode}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 22,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            renderSideBySide: true,
            ignoreTrimWhitespace: false,
            enableSplitViewResizing: true,
            renderOverviewRuler: false,
          }}
          loading={
            <div className="flex items-center justify-center h-full text-gray-500 animate-pulse">
              Initializing Diff Engine...
            </div>
          }
        />
      </div>
    </motion.div>
  );
}
