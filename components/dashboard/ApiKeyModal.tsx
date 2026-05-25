'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('prism_custom_api_key');
        if (stored) {
          setSavedKey(stored);
        }
      } catch (e) {
        console.warn('localStorage access denied', e);
      }
    }
  }, [isOpen]);

  const maskKey = (key: string) => {
    if (!key || key.length < 15) return '****************';
    return `${key.slice(0, 4)}****************${key.slice(-4)}`;
  };

  const handleSave = (keyToSave: string) => {
    if (!keyToSave.trim()) return;
    try {
      localStorage.setItem('prism_custom_api_key', keyToSave.trim());
    } catch (e) {
      console.warn('localStorage access denied', e);
    }
    setSavedKey(keyToSave.trim());
    setInputValue('');
    setStatus('success');
    setTimeout(() => {
      setStatus('idle');
    }, 3000);
  };

  const handleClear = () => {
    try {
      localStorage.removeItem('prism_custom_api_key');
    } catch (e) {
      console.warn('localStorage access denied', e);
    }
    setSavedKey(null);
    setInputValue('');
    setStatus('idle');
  };

  const testApiKey = async (keyToTest: string) => {
    if (!keyToTest.trim()) return;
    
    setStatus('testing');
    setErrorMessage('');
    
    try {
      const res = await fetch('/api/keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest.trim() })
      });
      
      if (res.ok) {
        handleSave(keyToTest.trim());
      } else {
        setStatus('error');
        setErrorMessage('Invalid or restricted API Key.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Network error during validation.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Cinematic Background Glow */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Key className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Bring Your Own Key</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Bypass shared demo rate limits.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {savedKey ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-sm font-medium text-emerald-400">Active API Key</p>
                        <p className="text-xs text-emerald-400/70 font-mono mt-1 tracking-wider">{maskKey(savedKey)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleClear}
                      className="text-xs font-medium text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Your custom key is actively overriding the default server limits. Your key never leaves your browser except for secure AI requests. If it fails, the system will safely fallback to the shared infrastructure.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Gemini API Key</label>
                    <input
                      type="password"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                  
                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {status === 'success' && (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Gemini Connected. Key saved securely.</span>
                    </div>
                  )}
                  
                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
                      Your key never leaves your browser except for secure AI requests.
                    </p>
                    
                    <button
                      onClick={() => testApiKey(inputValue)}
                      disabled={!inputValue.trim() || status === 'testing'}
                      className="relative flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                    >
                      {status === 'testing' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Validating...</span>
                        </>
                      ) : (
                        <>
                          <span>Test & Save Key</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
