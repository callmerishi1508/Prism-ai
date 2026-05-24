import { COMPANY_KNOWLEDGE_BASE, RagDocument } from './knowledgeBase';

/**
 * A fast, in-memory Retrieval-Augmented Generation (RAG) retriever.
 * It scores documents based on keyword matches in the provided code snippet.
 */
export function retrieveContext(code: string, language: string, maxDocs: number = 2): RagDocument[] {
  if (!code) return [];

  const lowerCode = code.toLowerCase();
  
  // Score each document based on keyword occurrences
  const scoredDocs = COMPANY_KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    
    // Boost score if language is explicitly mentioned in keywords
    if (doc.keywords.includes(language.toLowerCase())) {
      score += 5;
    }

    doc.keywords.forEach(keyword => {
      // Create a regex to find whole word matches or substring matches
      const regex = new RegExp(keyword.toLowerCase(), 'g');
      const matches = lowerCode.match(regex);
      if (matches) {
        score += matches.length;
      }
    });

    return { doc, score };
  });

  // Sort by score descending and filter out zero scores
  const relevantDocs = scoredDocs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxDocs)
    .map(item => item.doc);

  return relevantDocs;
}
