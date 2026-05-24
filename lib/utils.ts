/*
 * PRISM AI - Utility Functions
 * Helpers for structured response parsing and error handling
 */

export class ResponseError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "ResponseError";
  }
}

import { AnalysisResult } from './schema';

export type PersonaType = 'Startup CTO' | 'Security Expert' | 'Performance Engineer' | 'FAANG Reviewer';
export type AnalysisMode = 'analysis' | 'fix' | 'tests' | 'risk';

export const formatResponseResult = (rawResponse: string | object, mode: AnalysisMode): AnalysisResult => {
  try {
    const parsed = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

    // Use AI generated values or provide safe fallbacks
    return {
      ...parsed,
      mode,
      health_score: parsed.health_score !== undefined ? parsed.health_score : 75,
      merge_recommendation: parsed.merge_recommendation || 'Safe to Merge',
    };
  } catch (e) {
    throw new ResponseError('Invalid response format from AI engine', 502);
  }
};

export const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    Critical: '#EF4444',
    High: '#F97316',
    Medium: '#F59E0B',
    Low: '#3B82F6'
  };
  return colors[severity] || '#3B82F6';
};

export const getRecommendationColor = (recommendation: string): string => {
  const colors: Record<string, string> = {
    'Safe to Merge': '#10B981',
    'Needs Changes': '#F59E0B',
    'High Risk': '#EF4444'
  };
  return colors[recommendation] || '#3B82F6';
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const validateInput = (input: string): string => {
  if (!input || input.length === 0) {
    throw new ResponseError('Empty code input', 400);
  }
  return input;
};