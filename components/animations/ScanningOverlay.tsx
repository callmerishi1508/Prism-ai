'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanningOverlayProps {
  visible: boolean;
}

const loadingTexts = [
  "Analyzing Pull Request...",
  "Scanning Security Vulnerabilities...",
  "Optimizing Performance Analysis...",
  "Generating AI Insights..."
];

export default function ScanningOverlay({ visible }: ScanningOverlayProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (visible && particles.length === 0) {
      setParticles(Array.from({ length: 20 }).map(() => ({
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
        yAnim: Math.random() * -200,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2
      })));
    }
  }, [visible, particles.length]);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 backdrop-blur-md"
        >
          {/* Animated Background Gradients */}
          <motion.div
            className="absolute -inset-[100%] z-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.4) 0%, transparent 50%)',
                'radial-gradient(circle at 60% 40%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 60%, rgba(56, 189, 248, 0.4) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.4) 0%, transparent 50%)'
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />

          {/* Floating Particles */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-20"
                initial={{
                  x: p.x,
                  y: p.y,
                }}
                animate={{
                  y: [null, p.yAnim],
                  opacity: [0.2, 0.8, 0],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: p.delay,
                }}
              />
            ))}
          </div>

          {/* Main Content Box */}
          <div className="relative z-10 flex flex-col items-center max-w-md w-full p-8 rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_50px_rgba(56,189,248,0.15)] backdrop-blur-xl">
            {/* Scanner Rings */}
            <div className="relative flex items-center justify-center w-32 h-32 mb-8">
              <motion.div
                className="absolute inset-0 rounded-full border-t-2 border-r-2 border-sky-400 opacity-70"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-b-2 border-l-2 border-indigo-500 opacity-70"
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-6 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 opacity-20 blur-md"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* AI Core Icon */}
              <div className="relative z-10 w-12 h-12 bg-gradient-to-tr from-sky-400 to-indigo-400 rounded-lg shadow-[0_0_20px_rgba(56,189,248,0.6)] flex items-center justify-center animate-pulse">
                <span className="text-white text-xl font-bold font-mono">AI</span>
              </div>
            </div>

            {/* Rotating Text */}
            <div className="h-8 flex items-center justify-center overflow-hidden w-full mb-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={textIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-indigo-200 tracking-wide text-center"
                >
                  {loadingTexts[textIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-400"
                initial={{ width: '0%', left: '0%' }}
                animate={{
                  width: ['0%', '100%', '0%'],
                  left: ['0%', '0%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
