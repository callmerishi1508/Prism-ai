import { AnalysisResultSchema, FixResultSchema } from './schema';

export function safeParseAIResponse(
  rawText: string, 
  isFixMode: boolean, 
  fallbackCode?: string, 
  fallbackLanguage?: string
): any {
  let jsonString = rawText;
  
  // Clean markdown wrappers if any
  if (jsonString.includes('```json')) {
    jsonString = jsonString.split('```json')[1].split('```')[0].trim();
  } else if (jsonString.includes('```')) {
    jsonString = jsonString.split('```')[1].split('```')[0].trim();
  }

  try {
    const rawJson = JSON.parse(jsonString);
    const TargetSchema = isFixMode ? FixResultSchema : AnalysisResultSchema;
    const parsedResult = TargetSchema.safeParse(rawJson);
    
    if (parsedResult.success) {
      return { success: true, data: parsedResult.data };
    }
    
    console.error('[safeParseAIResponse] Schema validation failed. Returning fallback.', parsedResult.error);
    return { success: false, data: buildFallback(isFixMode, fallbackCode, fallbackLanguage) };
  } catch (error) {
    console.error('[safeParseAIResponse] JSON parsing crashed. Returning fallback.', error);
    return { success: false, data: buildFallback(isFixMode, fallbackCode, fallbackLanguage) };
  }
}

function buildFallback(isFixMode: boolean, code?: string, language?: string) {
  if (isFixMode) {
    return {
      fixed_code: code || '',
      explanation: 'PRISM AI encountered a critical parsing error. Safely returning original code.',
      diff: ''
    };
  }
  
  return {
    issues: [{ 
      title: 'AI Parsing Error', 
      severity: 'Medium', 
      line: 1, 
      explanation: 'The AI generated an invalid response payload. Falling back to heuristic defaults.', 
      suggested_fix: 'Retry analysis or review manually.', 
      confidence: 1.0 
    }],
    health_score: 50,
    merge_recommendation: 'Manual Review Required',
    confidenceMetrics: { 
      architecture_confidence: 1, 
      analysis_reliability: 1, 
      ambiguity_level: 'High', 
      manual_review_recommended: true 
    }
  };
}
