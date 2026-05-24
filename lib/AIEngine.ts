/*
 * PRISM AI - AI Engine
 * Core logic for analyzing code and generating reviews
 */

import GeminiService from './GeminiService';
import { PersonaId } from './personas';

class LanguageGuardrail {
  static checkMismatch(code: string, expectedLanguage?: string): { isMismatch: boolean, detectedLanguage?: string } {
    // Bypass guardrail for GitHub PR diffs since they contain multiple languages/formats
    if (code.includes('// GitHub PR Integration:') || code.includes('--- a/') || code.includes('+++ b/')) {
      return { isMismatch: false };
    }

    if (!expectedLanguage) return { isMismatch: false };
    
    const lowerCode = code.toLowerCase();
    
    // Check if C was selected but C++ was provided
    if (expectedLanguage === 'c') {
      if (lowerCode.includes('std::') || lowerCode.includes('#include <iostream>') || lowerCode.includes(' cout ') || code.includes('class ')) {
        return { isMismatch: true, detectedLanguage: 'C++' };
      }
    }
    
    // Check if Python was selected but JS/Java/C was provided
    if (expectedLanguage === 'python') {
      if (code.includes('function ') || code.includes('const ') || code.includes('let ') || lowerCode.includes('public class')) {
        return { isMismatch: true, detectedLanguage: 'JavaScript/Java' };
      }
    }
    
    // Check if JS was selected but Python was provided
    if (expectedLanguage === 'javascript' || expectedLanguage === 'typescript') {
      if (code.includes('def ') || code.includes('print(') || code.includes('elif:')) {
        return { isMismatch: true, detectedLanguage: 'Python' };
      }
    }
    
    // Check if Go was selected but JS/Java was provided
    if (expectedLanguage === 'go') {
      if (code.includes('function ') || code.includes('const ') || code.includes('let ')) {
        return { isMismatch: true, detectedLanguage: 'JavaScript' };
      }
    }

    return { isMismatch: false };
  }
}

class AIEngine {
  private gemini: typeof GeminiService;

  constructor() {
    this.gemini = GeminiService;
  }

  async analyzePR(code: string, persona: PersonaId, language?: string, isDemoMode?: boolean) {
    // 1. Run Pre-Flight Guardrails
    const guardrail = LanguageGuardrail.checkMismatch(code, language);
    if (guardrail.isMismatch) {
      return {
        issues: [
          {
            title: 'Language Mismatch Detected (Guardrail)',
            severity: 'High',
            line: 1,
            explanation: `Please choose correct language. You selected ${language?.toUpperCase()}, but the code appears to be ${guardrail.detectedLanguage}. Please provide the choosed language code.`,
            suggested_fix: `// Select ${guardrail.detectedLanguage} from the dropdown, or provide valid ${language?.toUpperCase()} code.`,
            confidence: 1.0
          }
        ],
        health_score: 0,
        merge_recommendation: 'High Risk',
        confidenceMetrics: {
          architecture_confidence: 1.0,
          analysis_reliability: 1.0,
          ambiguity_level: 'Low',
          manual_review_recommended: true
        }
      };
    }

    // 2. Initialize Gemini session (mock or real)
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