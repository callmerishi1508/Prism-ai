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

export const RagTelemetrySchema = z.object({
  mode: z.string(),
  embeddingSource: z.string(),
  retrievalLatencyMs: z.number().optional(),
  retrievedContextCount: z.number().optional(),
  retrievedPolicyCount: z.number().optional(),
  fallbackReason: z.string().optional(),
  pineconeQuery: z.string().optional(),
  
  // Advanced Semantic Routing
  semanticMatchConfidence: z.number().optional(),
  domainConfidence: z.number().optional(),
  frameworkConfidence: z.number().optional(),
  retrievalReason: z.string().optional(),
  rejectedDomains: z.array(z.string()).optional(),
  blockedStandards: z.number().optional(),
  fallbackRoutingTier: z.string().optional(),
  framework: z.string().nullable().optional(),
  
  // Intent-Aware Retrieval
  intentClassification: z.string().optional(),
  retrievalIntentMatches: z.number().optional(),
  intentConfidence: z.number().optional()
});

export const AnalysisResultSchema = z.object({
  issues: z.array(IssueSchema).describe('List of discovered issues'),
  health_score: z.number().min(0).max(100).optional().describe('Overall codebase health score (0 to 100)'),
  merge_recommendation: z.string().describe('Final merge recommendation'),
  confidenceMetrics: ConfidenceMetricsSchema.optional().describe('AI calibration of its own confidence'),
  promptVersion: z.string().optional(),
  ragContext: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string()
  })).optional().describe('Retrieved documentation or context used for analysis'),
  ragTelemetry: RagTelemetrySchema.optional().describe('Observability metrics for RAG pipeline')
});

export const FixResultSchema = z.object({
  fixed_code: z.string(),
  explanation: z.string()
});

export const RepairedVersionSchema = z.object({
  repairedCode: z.string().describe('The fully repaired, production-ready codebase string.'),
  summary: z.array(z.string()).describe('A concise list of architectural and security changes applied.'),
  riskLevel: z.enum(['Low', 'Moderate', 'High']).describe('The estimated risk level of applying this refactor.'),
  linesModified: z.number().describe('The total number of lines modified or touched.'),
  vulnerabilitiesResolved: z.number().describe('The total number of vulnerabilities and issues successfully resolved.'),
  reconstructedOriginalCode: z.string().optional().describe('The reconstructed original codebase string.')
});

export type Issue = z.infer<typeof IssueSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type FixResult = z.infer<typeof FixResultSchema>;
export type RepairedVersionResult = z.infer<typeof RepairedVersionSchema>;
export type ConfidenceMetrics = z.infer<typeof ConfidenceMetricsSchema>;
export type RagTelemetry = z.infer<typeof RagTelemetrySchema>;
