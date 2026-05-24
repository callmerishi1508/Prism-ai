'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { GitMerge, Zap, Shield, TrendingUp, Code, ArrowRight, Bot, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050505] font-sans selection:bg-sky-500/30 overflow-hidden relative">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-900/20 blur-[150px] pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            <Bot size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">PRISM<span className="text-sky-400 font-light">AI</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="https://github.com/prism-ai" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <GitMerge size={18} /> Star on GitHub
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-white px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all">
            Sign In
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 w-full max-w-7xl mx-auto flex-col items-center justify-center px-6 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto flex flex-col items-center pt-20 pb-32"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-semibold tracking-wide uppercase mb-8 shadow-[0_0_20px_rgba(56,189,248,0.15)]"
          >
            <Sparkles size={14} /> V2 Enterprise Edition
          </motion.div>

          <h1 className="text-6xl sm:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            The Autonomous <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
              Senior Engineer
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl font-light">
            PRISM AI instantly reviews pull requests, detects critical vulnerabilities, optimizes performance, and acts as a personalized FAANG-level mentor for your team.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto group relative flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold rounded-xl px-8 py-4 shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 text-lg">Launch Dashboard</span>
                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            
            <Link href="/dashboard?demo=true">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl px-8 py-4 transition-all duration-300 backdrop-blur-sm"
              >
                <Code size={18} className="text-gray-400" />
                <span className="text-lg">Try Demo Mode</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pb-32"
        >
          {/* Card 1 */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8 border border-white/5 hover:border-sky-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-[50px] group-hover:bg-sky-500/20 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-6 shadow-inner">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Zero-Day Prevention</h3>
            <p className="text-gray-400 leading-relaxed text-sm font-light">
              Aggressively scans for SQL injections, XSS, exposed secrets, and logic flaws before they are merged into production.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8 border border-white/5 hover:border-purple-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] group-hover:bg-purple-500/20 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6 shadow-inner">
              <Bot size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Dynamic Personas</h3>
            <p className="text-gray-400 leading-relaxed text-sm font-light">
              Switch between a Startup CTO, Security Expert, or FAANG Reviewer. Get advice tailored to your exact engineering culture.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8 border border-white/5 hover:border-indigo-500/30 transition-colors group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] group-hover:bg-indigo-500/20 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 shadow-inner">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Millisecond Optimization</h3>
            <p className="text-gray-400 leading-relaxed text-sm font-light">
              Detects O(n^2) complexity, memory bloat, and rendering bottlenecks instantly. Ship faster, more efficient code.
            </p>
          </div>
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center relative z-10 mt-auto">
        <p className="text-gray-500 text-sm">Built for builders. PRISM AI &copy; 2026</p>
      </footer>
    </div>
  );
}