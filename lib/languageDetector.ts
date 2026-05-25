export interface EmbeddedDomain {
  type: string;
  confidence: number;
}

export interface LanguageDetectionResult {
  primaryLanguage: string;
  confidence: number;
  embeddedDomains: EmbeddedDomain[];
  shouldBlockAnalysis: boolean;
  mismatchReason?: string;
}

const MIN_STRUCTURAL_THRESHOLD = 30; // Characters

// Helper to normalize the editor language string
export function normalizeLanguage(lang: string): string {
  const normalized = lang.toLowerCase().trim();
  if (['js', 'jsx', 'ts', 'tsx', 'typescript', 'node.js', 'react', 'next.js'].includes(normalized)) return 'javascript';
  if (['c', 'cpp', 'c++'].includes(normalized)) return 'cpp';
  if (['golang'].includes(normalized)) return 'go';
  if (['docker'].includes(normalized)) return 'dockerfile';
  if (['sh', 'bash'].includes(normalized)) return 'shell';
  if (['yml'].includes(normalized)) return 'yaml';
  if (['py'].includes(normalized)) return 'python';
  if (['cs'].includes(normalized)) return 'csharp';
  return normalized;
}

export const EXTENSION_TO_MONACO: Record<string, string> = {
  'js': 'javascript', 'jsx': 'javascript',
  'ts': 'typescript', 'tsx': 'typescript',
  'py': 'python',
  'java': 'java',
  'c': 'c', 'cpp': 'cpp', 'cc': 'cpp', 'h': 'cpp', 'hpp': 'cpp',
  'cs': 'csharp',
  'go': 'go',
  'rs': 'rust',
  'swift': 'swift',
  'kt': 'kotlin', 'kts': 'kotlin',
  'php': 'php',
  'rb': 'ruby',
  'scala': 'scala',
  'dart': 'dart',
  'r': 'r',
  'm': 'objective-c',
  'lua': 'lua',
  'pl': 'perl', 'pm': 'perl',
  'sql': 'sql',
  'graphql': 'graphql', 'gql': 'graphql',
  'sh': 'shell', 'bash': 'shell',
  'ps1': 'powershell',
  'html': 'html',
  'css': 'css',
  'scss': 'scss',
  'json': 'json',
  'yaml': 'yaml', 'yml': 'yaml',
  'xml': 'xml',
  'md': 'markdown',
  'dockerfile': 'dockerfile',
  'sol': 'solidity'
};

export const SUPPORTED_MONACO_LANGUAGES = new Set(Object.values(EXTENSION_TO_MONACO));

export function detectFileLanguage(filename: string, code: string, dominantFallback: string = 'plaintext'): string {
  const extMatch = filename.match(/\.([^.]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';
  
  if (filename.toLowerCase() === 'dockerfile') return 'dockerfile';
  
  // 1. Explicit file extension mapping
  if (ext && EXTENSION_TO_MONACO[ext]) {
    return EXTENSION_TO_MONACO[ext];
  }
  
  // 3. Content semantic detection (using our existing logic but simplified to primary)
  const semantic = detectLanguage(code, 'unknown');
  if (semantic.primaryLanguage !== 'unknown' && semantic.confidence >= 0.75) {
    const normalized = normalizeLanguage(semantic.primaryLanguage);
    if (SUPPORTED_MONACO_LANGUAGES.has(normalized)) return normalized;
  }
  
  // 4. Fallback dominant repo language (only if it's supported by Monaco)
  const normalizedFallback = normalizeLanguage(dominantFallback);
  if (SUPPORTED_MONACO_LANGUAGES.has(normalizedFallback)) {
    return normalizedFallback;
  }
  
  // 5. Strict fallback to plaintext
  return 'plaintext';
}

export function detectLanguage(code: string, editorLanguage: string): LanguageDetectionResult {
  const normalizedEditorLang = normalizeLanguage(editorLanguage);
  
  // Strip comments to prevent spoofing
  const codeWithoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, '') 
    .replace(/\/\/.*/g, '')           
    .replace(/#.*/g, '')              
    .replace(/<!--[\s\S]*?-->/g, '')  
    .replace(/--.*/g, '');            

  const lowerCode = codeWithoutComments.toLowerCase();
  
  // 1. Detect Embedded DSLs
  const embeddedDomains: EmbeddedDomain[] = [];
  if ((lowerCode.includes('select ') && lowerCode.includes(' from ')) || lowerCode.includes('insert into ') || lowerCode.includes('update ') && lowerCode.includes(' set ')) {
    embeddedDomains.push({ type: 'sql', confidence: 0.88 });
  }
  if (lowerCode.includes('query {') || lowerCode.includes('mutation {') || lowerCode.includes('graphql`')) {
    embeddedDomains.push({ type: 'graphql', confidence: 0.85 });
  }
  if (lowerCode.includes('<div') || lowerCode.includes('</') || lowerCode.includes('/>')) {
    embeddedDomains.push({ type: 'jsx', confidence: 0.90 }); // Could be JSX or HTML
  }
  if (lowerCode.includes('cuda') || lowerCode.includes('.cuda()')) {
    embeddedDomains.push({ type: 'cuda', confidence: 0.95 });
  }
  if (lowerCode.includes('run ') || lowerCode.includes('apt-get ') || lowerCode.includes('bash -c')) {
    embeddedDomains.push({ type: 'bash', confidence: 0.80 });
  }
  if (lowerCode.includes('apiVersion:') || lowerCode.includes('kind: ')) {
    embeddedDomains.push({ type: 'yaml', confidence: 0.90 });
  }

  // 2. Primary Language Scoring
  let detectedPrimary = 'unknown';
  let primaryConfidence = 0.0;
  let mismatchReason = undefined;

  // Signatures
  const isGo = lowerCode.includes('package main') || lowerCode.includes('func main()') || lowerCode.includes('fmt.println') || lowerCode.includes('import "fmt"');
  const isRust = lowerCode.includes('fn main()') || lowerCode.includes('println!("');
  const isPython = (lowerCode.includes('def ') && (lowerCode.includes(':\\n') || lowerCode.includes('print(')) && !lowerCode.includes('{')) || lowerCode.includes('import torch') || lowerCode.includes('import os');
  const isCpp = (lowerCode.includes('#include') || lowerCode.includes('std::cout')) && !lowerCode.includes('function ');
  const isJava = lowerCode.includes('public class ') && lowerCode.includes('system.out.print');
  const isDocker = lowerCode.startsWith('from ') && lowerCode.includes('run ');
  const isJs = lowerCode.includes('console.log') || lowerCode.includes('function ') || lowerCode.includes('const ') || lowerCode.includes('=>') || lowerCode.includes('import react');

  // Strict Evaluation
  if (isGo) { detectedPrimary = 'go'; primaryConfidence = 0.9; }
  else if (isRust) { detectedPrimary = 'rust'; primaryConfidence = 0.9; }
  else if (isPython) { detectedPrimary = 'python'; primaryConfidence = 0.9; }
  else if (isCpp) { detectedPrimary = 'c++'; primaryConfidence = 0.9; }
  else if (isJava) { detectedPrimary = 'java'; primaryConfidence = 0.9; }
  else if (isDocker) { detectedPrimary = 'dockerfile'; primaryConfidence = 0.9; }
  else if (isJs) { detectedPrimary = 'javascript'; primaryConfidence = 0.8; }

  // 3. Ambiguous/Tiny Snippet Downgrade
  if (code.length < MIN_STRUCTURAL_THRESHOLD || 
      code.trim() === 'print("Hello")' || 
      code.trim() === '{}' || 
      code.trim() === 'SELECT 1' || 
      code.trim() === 'main()') {
    primaryConfidence *= 0.5; // Downgrade confidence
  }

  // 4. Mismatch Evaluation
  let shouldBlockAnalysis = false;
  
  if (detectedPrimary !== 'unknown' && normalizedEditorLang !== 'unknown' && detectedPrimary !== normalizedEditorLang) {
    if (primaryConfidence >= 0.75) {
      // It's a strong mismatch
      shouldBlockAnalysis = true;
      mismatchReason = `Strong ${detectedPrimary} syntax detected while editor language is set to ${normalizedEditorLang}.`;
    } else {
      mismatchReason = `Ambiguous ${detectedPrimary} syntax detected, but confidence is too low to block.`;
    }
  }

  // Ensure Embedded DSLs do not override primary language logic (Requirement #3)
  // If we couldn't strongly detect a primary language, we trust the editor language.
  if (detectedPrimary === 'unknown' || primaryConfidence < 0.75) {
    detectedPrimary = normalizedEditorLang !== 'unknown' ? normalizedEditorLang : detectedPrimary;
  }

  return {
    primaryLanguage: detectedPrimary,
    confidence: primaryConfidence,
    embeddedDomains,
    shouldBlockAnalysis,
    mismatchReason
  };
}
