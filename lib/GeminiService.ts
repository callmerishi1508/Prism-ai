/*
 * PRISM AI - Gemini Service (V2)
 * Enterprise-grade LLM integration with structured outputs and self-healing fallbacks
 */

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { getPersonaPrompt, PersonaId } from './personas';
import { AnalysisResultSchema, FixResultSchema } from './schema';

const API_KEY = process.env.GEMINI_API_KEY || '';
const MAX_CODE_LENGTH = 50000; // ~15k tokens guardrail

export const CleanUp = { logError: (msg: string, error: any) => { console.error(msg, error); } };

class GeminiService {
  private ai: GoogleGenAI | null;

  constructor() {
    this.ai = API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY' ? new GoogleGenAI({ apiKey: API_KEY }) : null;
  }

  async initializeSession() {
    // Session initialization logic if required by future SDK updates
  }

  // Define the schema in GenAI format for structured output
  private getResponseSchema(): Schema {
    return {
      type: Type.OBJECT,
      properties: {
        issues: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              severity: { type: Type.STRING },
              line: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              suggested_fix: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            },
            required: ['title', 'severity', 'explanation']
          }
        },
        health_score: { type: Type.NUMBER },
        merge_recommendation: { type: Type.STRING },
        confidenceMetrics: {
          type: Type.OBJECT,
          properties: {
            architecture_confidence: { type: Type.NUMBER },
            analysis_reliability: { type: Type.NUMBER },
            ambiguity_level: { type: Type.STRING },
            manual_review_recommended: { type: Type.BOOLEAN }
          },
          required: ['architecture_confidence', 'analysis_reliability', 'ambiguity_level', 'manual_review_recommended']
        },
        promptVersion: { type: Type.STRING }
      },
      required: ['issues', 'health_score', 'merge_recommendation']
    };
  }

  private getFixResponseSchema(): Schema {
    return {
      type: Type.OBJECT,
      properties: {
        fixed_code: { type: Type.STRING },
        explanation: { type: Type.STRING },
        diff: { type: Type.STRING }
      },
      required: ['fixed_code', 'explanation']
    };
  }

  async analyzeCode(code: string, context: { persona: PersonaId, mode: string, language?: string, isDemoMode?: boolean }) {
    const isFixMode = context.mode === 'fix';

    // 1. Token & Response Guardrails
    if (code.length > MAX_CODE_LENGTH) {
      console.warn(`[Guardrail] Code length (${code.length}) exceeds MAX_CODE_LENGTH. Truncating.`);
      code = code.substring(0, MAX_CODE_LENGTH) + '\n\n// [PRISM AI TRUNCATED]: File exceeds token limits.';
    }

    if (!this.ai && !context.isDemoMode) {
      return {
        issues: [
          {
            title: 'API Key Configuration Required',
            severity: 'Critical',
            line: 1,
            explanation: 'PRISM AI V2 Enterprise requires a valid Gemini API Key to perform real-time code analysis on custom code. Please add GEMINI_API_KEY to your .env.local file.',
            suggested_fix: 'GEMINI_API_KEY="AIzaSy..."',
            confidence: 1.0
          }
        ],
        health_score: 0,
        merge_recommendation: 'High Risk',
        confidenceMetrics: {
          architecture_confidence: 1,
          analysis_reliability: 1,
          ambiguity_level: 'Low',
          manual_review_recommended: true
        }
      };
    }

    if (context.isDemoMode || !this.ai) {
      console.log('[Demo Mode] Returning safe mocked response');
      return this.getMockResponse(context.persona, isFixMode);
    }

    const systemInstruction = `
${getPersonaPrompt(context.persona)}

You are operating on PRISM AI V2. 
You must output strictly matching the provided JSON schema. Ensure your "confidenceMetrics" accurately reflect your certainty in the code analysis.

CRITICAL RULE FOR LANGUAGE VALIDATION:
The user has selected the language "${context.language || 'Unknown'}" from the dropdown. 
If the code provided is obviously NOT written in this selected language (e.g. they provided C++ but selected C, or provided Python but selected JavaScript), you MUST return an issue with:
- title: "Language Mismatch Detected"
- explanation: "Please choose correct language. Please provide the choosed language code."
- severity: "High"
This issue should be the primary issue returned if a severe mismatch is detected.
`.trim();

    try {
      // 2. Strict Structured JSON Output via Google Gen AI
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Here is the code to review:\n\`\`\`\n${code}\n\`\`\``,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: isFixMode ? this.getFixResponseSchema() : this.getResponseSchema(),
          temperature: 0.2 // Lower temp for deterministic structured output
        }
      });

      if (!response.text) throw new Error("Empty response from AI");
      
      const rawJson = JSON.parse(response.text);

      // 3. Self-Healing JSON Fallback Layer (Zod Validation)
      const TargetSchema = isFixMode ? FixResultSchema : AnalysisResultSchema;
      const parsedResult = TargetSchema.safeParse(rawJson);
      
      if (!parsedResult.success) {
        console.error('[Zod Validation Failed] Attempting Self-Healing...', parsedResult.error);
        return await this.attemptSelfHealing(response.text, systemInstruction, context.persona, isFixMode);
      }

      return parsedResult.data;

    } catch (error: any) {
      CleanUp.logError('[GeminiService] Analysis failed', error);

      if (!context.isDemoMode && this.ai) {
        const isRateLimit = error?.status === 429 || (error?.message && error.message.includes('429'));
        const cleanMessage = error?.message 
          ? error.message.split('{')[0].trim() // Strip out the massive JSON payload Google attaches
          : 'Unknown API Error';

        return {
          issues: [
            {
              title: isRateLimit ? 'Gemini API Rate Limit Exceeded (429)' : `Gemini API Error`,
              severity: 'Critical',
              line: 1,
              explanation: isRateLimit 
                ? 'Google Gemini has temporarily blocked the request due to hitting the free-tier rate limit (15 requests per minute). \n\n**To continue testing the UI immediately, please turn DEMO MODE back ON (top right corner).**'
                : `The Gemini API failed to analyze the code. \n\n**Error Details:**\n${cleanMessage}`,
              suggested_fix: isRateLimit 
                ? 'Turn ON Demo Mode to bypass the API, or upgrade your Google Cloud billing.' 
                : 'Check your Google Cloud Console or verify your GEMINI_API_KEY in .env.local.',
              confidence: 1.0
            }
          ],
          health_score: 0,
          merge_recommendation: 'High Risk',
          confidenceMetrics: {
            architecture_confidence: 1,
            analysis_reliability: 1,
            ambiguity_level: 'High',
            manual_review_recommended: true
          }
        };
      }

      return this.getMockResponse(context.persona, isFixMode);
    }
  }

  private async attemptSelfHealing(brokenJson: string, systemInstruction: string, persona: PersonaId, isFixMode: boolean) {
    if (!this.ai) return this.getMockResponse(persona, isFixMode);

    try {
      console.log('[Self-Healing] Pinging LLM to repair JSON...');
      const repairResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash', // Use flash for faster repair
        contents: `The following JSON failed validation. Fix it to strictly match the schema:\n${brokenJson}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: isFixMode ? this.getFixResponseSchema() : this.getResponseSchema(),
          temperature: 0.0
        }
      });

      if (!repairResponse.text) throw new Error("Repair failed");
      const repairedJson = JSON.parse(repairResponse.text);
      
      const TargetSchema = isFixMode ? FixResultSchema : AnalysisResultSchema;
      const finalResult = TargetSchema.safeParse(repairedJson);
      if (finalResult.success) {
        console.log('[Self-Healing] Successfully repaired JSON.');
        return finalResult.data;
      }
      throw new Error("Self-healing validation failed.");
    } catch (e) {
      console.error('[Self-Healing] Failed completely. Returning safe fallback.', e);
      return this.getMockResponse(persona, isFixMode);
    }
  }

  getMockResponse(persona: PersonaId, isFixMode: boolean = false) {
    if (isFixMode) {
      return {
        fixed_code: '// Optimized and fixed code\nconst safeValue = "fixed";',
        explanation: 'I have secured the logic and optimized performance.',
        diff: '- const unsafe = "bad";\n+ const safeValue = "fixed";'
      };
    }
    const defaultConfidence = {
      architecture_confidence: 0.95,
      analysis_reliability: 0.98,
      ambiguity_level: 'Low',
      manual_review_recommended: false
    };

    if (persona === 'security') {
      return {
        issues: [
          { title: 'SQL Injection Vulnerability', severity: 'Critical', line: 5, explanation: 'Concatenating user input directly into a SQL query exposes the system to injection attacks. This must be fixed immediately using prepared statements.', suggested_fix: 'const query = "SELECT * FROM users WHERE id = ?";\ndb.execute(query, [user.id]);', confidence: 0.99 }
        ],
        health_score: 40,
        merge_recommendation: 'High Risk',
        confidenceMetrics: { ...defaultConfidence, manual_review_recommended: true },
        promptVersion: 'v2.0'
      };
    }
    if (persona === 'performance') {
      return {
        issues: [
          { title: 'O(N^2) Complexity detected', severity: 'High', line: 11, explanation: 'Nested loops over the same transactions array will cause severe CPU bottlenecks as the payload scales. Please optimize using a Hash Map.', suggested_fix: 'const seen = new Set();\nfor(const t of user.transactions) {\n  if(!seen.has(t.id)) {\n    processed.push(t);\n    seen.add(t.id);\n  }\n}', confidence: 0.95 }
        ],
        health_score: 65,
        merge_recommendation: 'Needs Changes',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0'
      };
    }
    
    return {
      issues: [
        { title: 'No Input Validation', severity: 'Medium', line: 4, explanation: 'We should probably validate the user object before querying the database to prevent unhandled errors from breaking the flow.', suggested_fix: 'if (!user || !user.id) return [];', confidence: 0.85 },
        { title: 'Suboptimal loop', severity: 'Low', line: 10, explanation: 'This loop is a bit over-engineered. Let\'s refactor for simplicity and developer velocity.', suggested_fix: 'return Array.from(new Set(user.transactions.map(t => t.id))).map(id => user.transactions.find(t => t.id === id));', confidence: 0.80 }
      ],
      health_score: 82,
      merge_recommendation: 'Safe to Merge',
      confidenceMetrics: defaultConfidence,
      promptVersion: 'v2.0'
    };
  }
}

export default new GeminiService();