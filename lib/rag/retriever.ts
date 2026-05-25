import { COMPANY_KNOWLEDGE_BASE, RagDocument } from './knowledgeBase';
import { classifyCode } from './domainClassifier';
import { classifyIntent, FORBIDDEN_INTENT_PAIRS } from './intentClassifier';

/**
 * A fast, in-memory Retrieval-Augmented Generation (RAG) retriever.
 * It scores documents based on domain classification rather than raw keywords.
 */
export interface RetrievedDoc extends RagDocument {
  relevanceScore: number;
}

export function retrieveContext(code: string, language: string, maxDocs: number = 2, embeddedDSLs: {type: string, confidence: number}[] = []): RetrievedDoc[] {
  if (!code) return [];

  const classification = classifyCode(code, language, embeddedDSLs);
  const primaryDomain = classification.primaryDomain;
  const secondaryDomains = classification.secondaryDomains;
  const framework = classification.framework;
  const runtime = classification.executionContext.runtime;
  
  const intentClass = classifyIntent(code, classification, embeddedDSLs);

  // Score each document based on semantic matches
  let docs = COMPANY_KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    
    const docMeta = doc.metadata || {};
    const docDomain = docMeta.domain || '';
    const docFramework = docMeta.framework || '';
    const docRuntime = docMeta.runtime || '';
    const docIntents = doc.intentTags || [];

    // If it's a forbidden domain, hard block
    if (classification.blockedDomains.includes(docDomain as any)) {
      score = -100;
      return { ...doc, relevanceScore: score };
    }

    // Exact Framework Match
    if (framework && docFramework === framework) score += 10;
    
    // Exact Domain Match
    if (primaryDomain && docDomain === primaryDomain) score += 5;

    // Secondary Domain Match (Embedded DSLs)
    if (secondaryDomains.includes(docDomain as any)) score += 3;

    // Exact Runtime Match
    if (runtime && docRuntime === runtime) score += 3;

    // Intent Match
    if (docIntents.includes(intentClass.primaryIntent)) {
      score += 25;
    } else {
      const forbidden = FORBIDDEN_INTENT_PAIRS[intentClass.primaryIntent] || [];
      if (docIntents.some(t => forbidden.includes(t as any))) {
        score -= 50;
      } else {
        score -= 15;
      }
    }

    intentClass.rankedIntents.forEach(rank => {
      if (rank.intent !== intentClass.primaryIntent && docIntents.includes(rank.intent)) {
        score += 10 * rank.confidence;
      }
    });

    return {
      ...doc,
      relevanceScore: score
    };
  });

  // Sort by score
  docs.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Diversity Constraints & Starvation Protection
  const MAX_DOCS_PER_INTENT = 2;
  const MAX_DOCS_PER_DOMAIN = 3;
  const intentCounts: Record<string, number> = {};
  const domainCounts: Record<string, number> = {};
  const finalDocs: RetrievedDoc[] = [];

  const requiredSecondaryIntents = new Set(
    intentClass.rankedIntents
      .filter(r => r.intent !== intentClass.primaryIntent && r.confidence >= 0.65)
      .map(r => r.intent)
  );

  for (const doc of docs) {
    if (finalDocs.length >= maxDocs && requiredSecondaryIntents.size === 0) break;

    const dCount = domainCounts[doc.metadata?.domain || 'Unknown'] || 0;
    if (dCount >= MAX_DOCS_PER_DOMAIN) continue;

    let canAdd = false;
    let matchedSecondary = false;

    for (const t of doc.intentTags) {
      if (requiredSecondaryIntents.has(t as any)) {
        requiredSecondaryIntents.delete(t as any);
        matchedSecondary = true;
      }
    }

    if (matchedSecondary) {
      canAdd = true;
    } else if (finalDocs.length < maxDocs) {
      const iCount = intentCounts[doc.intentTags[0]] || 0;
      if (iCount < MAX_DOCS_PER_INTENT) {
        canAdd = true;
      }
    }

    if (canAdd) {
      finalDocs.push(doc);
      domainCounts[doc.metadata?.domain || 'Unknown'] = dCount + 1;
      doc.intentTags.forEach(t => {
        intentCounts[t] = (intentCounts[t] || 0) + 1;
      });
    }
  }

  // Filter out irrelevant docs
  return finalDocs.filter(d => d.relevanceScore >= -10).slice(0, maxDocs);
}
