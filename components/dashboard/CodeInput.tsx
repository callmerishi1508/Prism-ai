/*
 * PRISM AI - Code Input Component
 * Handles user input: GitHub PR URL, code paste, or file upload
 */

import React, { useState } from 'react';
import { GitMerge, Check, Code, Play, FileText } from 'lucide-react';

export function CodeInput() {
  const [code, setCode] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'paste' | 'github' | 'upload'>('paste');

  return (
    <div className="code-input-container">
      {/* Tab Navigation */}
      <div className="input-tabs">
        <button
          onClick={() => setActiveTab('paste')}
          className={activeTab === 'paste' ? 'active' : ''}
        >
          <Code size={18} /> Paste Code
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={activeTab === 'github' ? 'active' : ''}
        >
          <GitMerge size={18} /> GitHub PR
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={activeTab === 'upload' ? 'active' : ''}
        >
          <FileText size={18} /> Upload File
        </button>
      </div>

      {/* Input Area */}
      <div className="input-area">
        {activeTab === 'paste' && (
          <textarea
            className="code-input"
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={20}
          />
        )}

        {activeTab === 'github' && (
          <input
            type="text"
            className="github-input"
            placeholder="https://github.com/user/repo/pull/123"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        )}

        {activeTab === 'upload' && (
          <div className="file-upload">
            <input
              type="file"
              onChange={(e) => setFileUpload(e.target.files?.[0] || null)}
              accept=".js,.ts,.tsx,.jsx,.py,.java"
            />
            {fileUpload && <span>{fileUpload.name}</span>}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="primary-button">Analyze PR</button>
        <button className="secondary-button">Generate Fix</button>
        <button className="secondary-button">Generate Tests</button>
      </div>
    </div>
  );
}