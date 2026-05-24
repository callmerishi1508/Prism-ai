/*
 * PRISM AI - AI Engine
 * Core logic for analyzing code and generating reviews
 */

import GeminiService from './GeminiService';
import { PersonaId } from './personas';

class AIEngine {
  private gemini: any;

  constructor() {
    this.gemini = GeminiService;
  }

  async analyzePR(code: string, persona: PersonaId, language?: string, isDemoMode?: boolean) {
    // Initialize Gemini session (mock or real)
    await this.gemini.initializeSession();

    // Analyze code with persona context
    const analysis = await this.gemini.analyzeCode(code, {
      persona,
      language,
      mode: 'analysis',
      isDemoMode
    });

    return analysis;
  }

  async generateFix(code: string, issue: string) {
    const fix = await this.gemini.analyzeCode(code, {
      persona: 'cto',
      mode: 'fix'
    });

    return fix;
  }

  async generateTests(code: string) {
    const tests = await this.gemini.analyzeCode(code, {
      persona: 'performance',
      mode: 'tests'
    });

    return tests;
  }

  calculateHealthScore(analysis: any) {
    // Basic fallback if health_score isn't generated
    if (analysis && analysis.health_score) {
      return analysis.health_score;
    }
    return 75;
  }
}

export default new AIEngine();