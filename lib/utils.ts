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

export interface AnalysisResult {
  issues: Array<{
    title: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    line: number;
    explanation: string;
    suggested_fix?: string;
  }>;
  health_score: number;
  merge_recommendation: 'Safe to Merge' | 'Needs Changes' | 'High Risk';
  persona_selection: string;
  mode: 'analysis' | 'fix' | 'tests' | 'risk';
}

export type PersonaType = 'Startup CTO' | 'Security Expert' | 'Performance Engineer' | 'FAANG Reviewer';
export type AnalysisMode = 'analysis' | 'fix' | 'tests' | 'risk';

export const formatResponseResult = (rawResponse: string, mode: AnalysisMode): AnalysisResult => {
  try {
    const parsed = JSON.parse(rawResponse);

    // Structure the response according to our schema
    return {
      ...parsed,
      mode,
      health_score: calculatedHealthScore(parsed),
      merge_recommendation: calculateMergeRecommendation(parsed),
      persona_selection: 'Startup CTO' // In real implementation this would come from user selection
    };
  } catch (e) {
    throw new ResponseError('Invalid response format from AI engine', 502);
  }
};

export const calculatedHealthScore = (response: any): number => {
  const scores: Record<string, number> = {
    maintainability: 0.2,
    security: 0.25,
    readability: 0.15,
    performance: 0.2,
    testing: 0.2
  };

  const weights: Record<string, number> = {
    maintainability: 80,
    security: 75,
    readability: 85,
    performance: 80,
    testing: 60
  };

  const total = Object.keys(scores).reduce((sum, key) => {
    return sum + scores[key] * weights[key] / 100;
  }, 0);

  return Math.round(total);
};

export const calculateMergeRecommendation = (response: any): string => {
  const healthScore = calculatedHealthScore(response);

  if (healthScore > 80) return 'Safe to Merge';
  if (healthScore > 60) return 'Needs Changes';
  return 'High Risk';
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