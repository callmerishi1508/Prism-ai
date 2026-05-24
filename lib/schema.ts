import { z } from 'zod';

export const IssueSchema = z.object({
  title: z.string().describe('Short descriptive title of the issue'),
  severity: z.string().describe('Severity level of the issue'),
  line: z.number().int().optional().describe('Line number where the issue occurs'),
  explanation: z.string().describe('Detailed explanation reflecting the persona tone'),
  suggested_fix: z.string().optional().describe('Code snippet to fix the issue'),
  confidence: z.number().min(0).max(1).optional().describe('AI confidence in this specific issue detection (0.0 to 1.0)')
});

export const ConfidenceMetricsSchema = z.object({
  architecture_confidence: z.number().min(0).max(1).optional().describe('Confidence in architectural assessment'),
  analysis_reliability: z.number().min(0).max(1).optional().describe('Overall reliability of the analysis'),
  ambiguity_level: z.string().optional().describe('Level of ambiguity in the provided code'),
  manual_review_recommended: z.boolean().optional().describe('True if a human expert must verify this')
});

export const AnalysisResultSchema = z.object({
  issues: z.array(IssueSchema).describe('List of discovered issues'),
  health_score: z.number().min(0).max(100).optional().describe('Overall codebase health score (0 to 100)'),
  merge_recommendation: z.string().describe('Final merge recommendation'),
  confidenceMetrics: ConfidenceMetricsSchema.optional().describe('AI calibration of its own confidence'),
  promptVersion: z.string().optional()
});

export const FixResultSchema = z.object({
  fixed_code: z.string().describe('The corrected code snippet'),
  explanation: z.string().describe('Explanation of why this fix works'),
  diff: z.string().optional().describe('Optional unified diff showing changes')
});

export type Issue = z.infer<typeof IssueSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type FixResult = z.infer<typeof FixResultSchema>;
export type ConfidenceMetrics = z.infer<typeof ConfidenceMetricsSchema>;
