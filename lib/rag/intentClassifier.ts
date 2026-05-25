import { ClassificationResult, EngineeringDomain } from './domainClassifier';
import { EmbeddedDomain } from '../languageDetector';

export type IssueIntent =
  | "SQL_INJECTION"
  | "N_PLUS_ONE"
  | "MEMORY_LEAK"
  | "GPU_MEMORY_EXHAUSTION"
  | "CONCURRENCY_RACE"
  | "XSS"
  | "AUTH_BYPASS"
  | "UNBOUNDED_LOOP"
  | "RESOURCE_LEAK"
  | "INEFFICIENT_RENDER"
  | "BLOCKING_IO"
  | "MISSING_VALIDATION"
  | "UNSAFE_SERIALIZATION"
  | "OVERFETCHING"
  | "CACHE_MISS"
  | "GENERIC_ARCHITECTURE"
  | "UNKNOWN";

export interface IntentScore {
  intent: IssueIntent;
  confidence: number;
}

export interface IntentClassification {
  primaryIntent: IssueIntent;
  confidence: number;
  rankedIntents: IntentScore[];
  severityHint: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export const FORBIDDEN_INTENT_PAIRS: Partial<Record<IssueIntent, IssueIntent[]>> = {
  N_PLUS_ONE: ["XSS", "AUTH_BYPASS", "GPU_MEMORY_EXHAUSTION"],
  GPU_MEMORY_EXHAUSTION: ["INEFFICIENT_RENDER", "N_PLUS_ONE"],
  INEFFICIENT_RENDER: ["GPU_MEMORY_EXHAUSTION", "SQL_INJECTION"],
  SQL_INJECTION: ["INEFFICIENT_RENDER", "GPU_MEMORY_EXHAUSTION"]
};

/**
 * PRISM AI - ISSUE-INTENT CLASSIFIER
 * Note: Intent classification is currently file-scoped only. 
 * Future V2 chunking architecture must partition large diffs before intent analysis 
 * to support Monorepo Intent Partitioning safely.
 */
export function classifyIntent(
  code: string,
  domainContext: ClassificationResult,
  embeddedDSLs: EmbeddedDomain[]
): IntentClassification {
  const lowerCode = code.toLowerCase();
  const lines = code.split('\n');
  const lineCount = lines.length;
  
  const intentMap = new Map<IssueIntent, number>();

  const addScore = (intent: IssueIntent, score: number) => {
    intentMap.set(intent, (intentMap.get(intent) || 0) + score);
  };

  // 1. Detect SQL Injection vs N+1
  if (lowerCode.includes('select ') || lowerCode.includes('insert ')) {
    if (lowerCode.includes('for ') || lowerCode.includes('while ') || lowerCode.includes('map(') || lowerCode.includes('foreach')) {
      // Loop with query often indicates N+1
      addScore("N_PLUS_ONE", 0.9);
      addScore("BLOCKING_IO", 0.5);
    }
    if (lowerCode.includes(' + ') || lowerCode.includes('f"') || lowerCode.includes("f'") || lowerCode.includes('\`') || code.includes('${')) {
      // String concatenation likely means SQL Injection
      addScore("SQL_INJECTION", 0.95);
    }
  }

  // 2. GPU Memory Exhaustion
  if (lowerCode.includes('tensor') || lowerCode.includes('torch')) {
    if (domainContext.executionContext.runtime === 'cuda' || lowerCode.includes('.cuda()') || lowerCode.includes('.to("cuda")')) {
      if (lowerCode.includes('while true') || lowerCode.includes('for epoch in range')) {
        addScore("GPU_MEMORY_EXHAUSTION", 0.9);
      }
    } else {
      addScore("MEMORY_LEAK", 0.4);
    }
  }

  // 3. Render loops (Frontend)
  if (domainContext.primaryDomain === 'FRONTEND_UI' || embeddedDSLs.find(d => d.type === 'jsx')) {
    if ((lowerCode.includes('useeffect') && (lowerCode.includes('setstate') || lowerCode.includes('setcount') || lowerCode.match(/set[a-z]+/))) || lowerCode.includes('settimeout')) {
      addScore("INEFFICIENT_RENDER", 0.85);
    }
    if (lowerCode.includes('innerhtml') || lowerCode.includes('dangerouslysetinnerhtml')) {
      addScore("XSS", 0.9);
    }
  }

  // 4. Concurrency & Blocking IO
  if (lowerCode.includes('readfilesync') || lowerCode.includes('time.sleep')) {
    addScore("BLOCKING_IO", 0.9);
  }
  if (lowerCode.includes('sync.mutex') || lowerCode.includes('lock()')) {
    addScore("CONCURRENCY_RACE", 0.6);
  }

  // 5. Auth Bypass / Validation
  if (lowerCode.includes('password') || lowerCode.includes('auth')) {
    if (lowerCode.includes('==') || lowerCode.includes('!=') || lowerCode.includes('math.random')) {
      addScore("AUTH_BYPASS", 0.85);
    }
  }

  if (lowerCode.includes('request.json') || lowerCode.includes('req.body')) {
    if (!lowerCode.includes('validate') && !lowerCode.includes('schema') && !lowerCode.includes('zod')) {
      addScore("MISSING_VALIDATION", 0.8);
    }
  }

  // 6. Semantic Delta / Patch Aware Analysis
  const isPatch = lowerCode.includes('@@ ') || (lowerCode.includes('--- a/') && lowerCode.includes('+++ b/'));
  if (isPatch) {
    const removedLines = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).map(l => l.toLowerCase());
    const addedLines = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.toLowerCase());
    
    const removedGuards = removedLines.some(l => l.includes('sanitize') || l.includes('validate') || l.includes('escape') || l.includes('bcrypt'));
    const addedRisks = addedLines.some(l => l.includes('execute') || l.includes('raw') || l.includes('innerhtml') || l.includes('password'));
    
    if (removedGuards && addedRisks) {
       addScore("SQL_INJECTION", 0.8);
       addScore("XSS", 0.8);
       addScore("AUTH_BYPASS", 0.8);
    }

    const addedLoops = addedLines.some(l => l.includes('for ') || l.includes('while '));
    const addedQueries = addedLines.some(l => l.includes('select ') || l.includes('db.'));
    if (addedLoops && addedQueries) {
       addScore("N_PLUS_ONE", 0.9);
    }
  }

  // Convert map to array and apply small snippet penalty
  let rankedIntents: IntentScore[] = Array.from(intentMap.entries()).map(([intent, confidence]) => {
    let finalConfidence = confidence;
    if (lineCount < 4) {
      finalConfidence *= 0.5; // Penalty for tiny snippets
    }
    return { intent, confidence: Math.min(finalConfidence, 1.0) };
  });

  rankedIntents.sort((a, b) => b.confidence - a.confidence);

  if (rankedIntents.length === 0) {
    rankedIntents.push({ intent: "GENERIC_ARCHITECTURE", confidence: 0.8 });
  }

  const primaryIntentScore = rankedIntents[0];
  let severityHint: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";

  if (["SQL_INJECTION", "XSS", "AUTH_BYPASS"].includes(primaryIntentScore.intent)) {
    severityHint = "CRITICAL";
  } else if (["GPU_MEMORY_EXHAUSTION", "N_PLUS_ONE", "MEMORY_LEAK"].includes(primaryIntentScore.intent)) {
    severityHint = "HIGH";
  } else if (primaryIntentScore.confidence > 0.7) {
    severityHint = "MEDIUM";
  }

  return {
    primaryIntent: primaryIntentScore.intent,
    confidence: primaryIntentScore.confidence,
    rankedIntents,
    severityHint
  };
}
