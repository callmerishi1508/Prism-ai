/*
 * PRISM AI - AI Engine
 * Core logic for analyzing code and generating reviews
 */

import GeminiService from './GeminiService';
import { PersonaId } from './personas';

class AIEngine {
  private gemini: typeof GeminiService;

  constructor() {
    this.gemini = GeminiService;
  }

  async analyzePR(code: string, persona: PersonaId, language?: string, isDemoMode?: boolean, customApiKey?: string) {
    // Initialize Gemini session (mock or real)
    await this.gemini.initializeSession();

    // Analyze code with persona context
    const analysis = await this.gemini.analyzeCode(code, {
      persona,
      language,
      mode: 'analysis',
      isDemoMode,
      customApiKey
    });

    return analysis;
  }

  async generateFix(code: string, issue: string, customApiKey?: string) {
    const fix = await this.gemini.analyzeCode(code, {
      persona: 'cto',
      mode: 'fix',
      customApiKey
    });

    return fix;
  }

  async generateTests(code: string, customApiKey?: string) {
    const tests = await this.gemini.analyzeCode(code, {
      persona: 'cto',
      mode: 'test',
      customApiKey
    });

    return tests;
  }

  async generateRepairedVersion(code: string, issues: any[], persona: PersonaId, language?: string, customApiKey?: string) {
    await this.gemini.initializeSession();
    return await this.gemini.generateRepairedVersion(code, issues, { persona, language, customApiKey });
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