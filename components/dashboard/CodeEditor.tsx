'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Copy, Maximize, Minimize, Check } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  onLanguageChange?: (language: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'csharp', name: 'C#' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
  { id: 'swift', name: 'Swift' },
  { id: 'kotlin', name: 'Kotlin' },
  { id: 'php', name: 'PHP' },
  { id: 'ruby', name: 'Ruby' },
  { id: 'scala', name: 'Scala' },
  { id: 'dart', name: 'Dart' },
  { id: 'r', name: 'R' },
  { id: 'objective-c', name: 'Objective-C' },
  { id: 'lua', name: 'Lua' },
  { id: 'perl', name: 'Perl' },
  { id: 'sql', name: 'SQL' },
  { id: 'graphql', name: 'GraphQL' },
  { id: 'shell', name: 'Bash/Shell' },
  { id: 'powershell', name: 'PowerShell' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'scss', name: 'SCSS' },
  { id: 'json', name: 'JSON' },
  { id: 'yaml', name: 'YAML' },
  { id: 'xml', name: 'XML' },
  { id: 'markdown', name: 'Markdown' },
  { id: 'dockerfile', name: 'Dockerfile' },
  { id: 'solidity', name: 'Solidity' }
];

export function CodeEditor({ code, language, onChange, onLanguageChange }: CodeEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <motion.div
      layout
      className={`flex flex-col border border-white/10 rounded-xl overflow-hidden bg-[#0A0A0A] shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50' : 'relative w-full h-[500px]'
      }`}
      style={{
        boxShadow: isFullscreen ? '0 0 50px rgba(56,189,248,0.1)' : '0 10px 30px rgba(0,0,0,0.5)'
      }}
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-transparent text-gray-300 text-sm outline-none cursor-pointer hover:text-white transition-colors ml-4"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-neutral-900">
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
            title="Copy to clipboard"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative w-full h-full">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 24,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
          loading={
            <div className="flex items-center justify-center h-full text-gray-500 animate-pulse">
              Loading Editor...
            </div>
          }
        />
      </div>
    </motion.div>
  );
}
