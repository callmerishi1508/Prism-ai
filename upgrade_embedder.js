const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib/rag/advancedRetriever.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add crypto import and cache map
if (!content.includes("import * as crypto from 'crypto';")) {
  content = "import * as crypto from 'crypto';\n" + content;
}
if (!content.includes("const embeddingCache = new Map<string, number[]>();")) {
  content = content.replace("export interface AdvancedRetrievedDoc", "const embeddingCache = new Map<string, number[]>();\n\nexport interface AdvancedRetrievedDoc");
}

// 2. Add Caching to retrieveAdvancedContext
const embedContentStart = "const embeddingResponse = await ai.models.embedContent({";
const cacheLogic = `
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    let vector = embeddingCache.get(codeHash);

    if (vector) {
      console.log('[Embedding Cache Hit] Bypassing Gemini API for vector generation.');
    } else {
      console.log('[Embedding Cache Miss] Generating new vector via Gemini API.');
      const embeddingResponse = await ai.models.embedContent({
        model: 'embedding-001',
        contents: code,
      });
      vector = embeddingResponse.embeddings?.[0]?.values;
      if (!vector) throw new Error("Failed to generate code embeddings.");
      embeddingCache.set(codeHash, vector);
    }

    // 2. Query the Pinecone Vector Database
`;

if (!content.includes("const codeHash = crypto.createHash")) {
  const replaceRegex = /const embeddingResponse = await ai\.models\.embedContent\(\{\s*model: 'embedding-001',\s*contents: code,\s*\}\);\s*const vector = embeddingResponse\.embeddings\?\.\[0\]\?\.values;\s*if \(!vector\) throw new Error\("Failed to generate code embeddings\."\);\s*\/\/ 2\. Query the Pinecone Vector Database/;
  content = content.replace(replaceRegex, cacheLogic.trim());
}

fs.writeFileSync(filePath, content);
console.log('advancedRetriever.ts successfully upgraded!');
