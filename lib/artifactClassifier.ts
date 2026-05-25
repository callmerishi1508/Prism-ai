export type PatchSubtype = 
  | "UNIFIED_DIFF"
  | "GITHUB_PR_PATCH"
  | "GITLAB_PATCH"
  | "RAW_HUNK"
  | "BINARY_PATCH";

export interface ArtifactClassification {
  category: string;
  patchDetectionConfidence: number;
  patchSubtype?: PatchSubtype;
}

export function categorizeArtifact(code: string, lang: string): ArtifactClassification {
  const lower = code.toLowerCase().trim();
  const lines = code.split('\n').map(l => l.trim());

  // 1. PATCH DETECTION WITH PROBABILISTIC SCORING
  let patchScore = 0;
  let subtype: PatchSubtype = "UNIFIED_DIFF";

  const hasDiffGit = lower.includes('diff --git');
  const hasIndex = lower.includes('index ') && lower.match(/index [0-9a-f]+\.\.[0-9a-f]+/);
  const hasMinusA = lower.includes('--- a/');
  const hasPlusB = lower.includes('+++ b/');
  const hasHunk = lower.includes('@@ -') && lower.includes(' +');
  const hasBinary = lower.includes('binary files') && lower.includes('differ');
  const hasGitBinaryPatch = lower.includes('git binary patch');
  
  if (hasDiffGit) patchScore += 0.4;
  if (hasIndex) patchScore += 0.2;
  if (hasMinusA && hasPlusB) patchScore += 0.4;
  if (hasHunk) patchScore += 0.3;
  
  // RAW_HUNK detection (snippet without file headers)
  if (hasHunk && !hasDiffGit && !hasMinusA) {
    subtype = "RAW_HUNK";
    patchScore += 0.5; // High confidence it's a raw hunk if it has @@ but no file headers
  }

  // BINARY_PATCH detection
  if (hasBinary || hasGitBinaryPatch) {
    subtype = "BINARY_PATCH";
    patchScore += 0.8;
  }

  // Check for specific GitHub/GitLab patches
  if (lower.startsWith('from ') && lower.includes('mon sep 17 00:00:00 2001')) {
     if (lower.includes('github.com')) subtype = "GITHUB_PR_PATCH";
     else if (lower.includes('gitlab.')) subtype = "GITLAB_PATCH";
     patchScore += 0.5;
  }

  // False positive mitigation (Markdown, Mathematical, YAML arrays)
  let leadingPlusMinusCount = 0;
  let totalNonEmptyLines = 0;
  for (let i = 0; i < Math.min(lines.length, 100); i++) {
    if (lines[i].length > 0) {
      totalNonEmptyLines++;
      if (lines[i].startsWith('+') || lines[i].startsWith('-')) {
        leadingPlusMinusCount++;
      }
    }
  }

  // If we have some diff markers and a very high density of +/- lines, boost score
  if (hasHunk && totalNonEmptyLines > 0 && (leadingPlusMinusCount / totalNonEmptyLines) > 0.4) {
    patchScore += 0.3;
  }

  const patchDetectionConfidence = Math.min(patchScore, 1.0);

  if (patchDetectionConfidence >= 0.7) {
    return {
      category: 'PATCH_ARTIFACT',
      patchDetectionConfidence,
      patchSubtype: subtype
    };
  }

  // 2. MARKUP_OR_TEMPLATE
  if (lower.startsWith('<') && lower.endsWith('>') && (lower.includes('</') || lower.includes('/>'))) {
    return { category: 'MARKUP_OR_TEMPLATE', patchDetectionConfidence };
  }
  if (['html', 'xml', 'svg'].includes(lang)) {
    return { category: 'MARKUP_OR_TEMPLATE', patchDetectionConfidence };
  }

  // 3. DATA_OR_SCHEMA
  if ((lower.startsWith('{') && lower.endsWith('}')) || (lower.startsWith('[') && lower.endsWith(']'))) {
    if (lower.includes('":') || lower.includes("':")) {
      return { category: 'DATA_OR_SCHEMA', patchDetectionConfidence };
    }
  }
  if (['json', 'graphql', 'sql'].includes(lang)) {
    return { category: 'DATA_OR_SCHEMA', patchDetectionConfidence };
  }

  // 4. CONFIGURATION_ARTIFACT
  if (['yaml', 'yml', 'toml', 'dockerfile', 'ini'].includes(lang) || lower.startsWith('version:') || lower.startsWith('services:')) {
    return { category: 'CONFIGURATION_ARTIFACT', patchDetectionConfidence };
  }

  // 5. DOCUMENTATION_OR_TEXT
  if (['markdown', 'md', 'txt', 'plaintext'].includes(lang) || lower.startsWith('# ') || lower.startsWith('## ')) {
    return { category: 'DOCUMENTATION_OR_TEXT', patchDetectionConfidence };
  }

  // 6. EXECUTABLE_APPLICATION_CODE vs PARTIAL_CODE_FRAGMENT
  if (lower.length < 150 && !lower.includes('class ') && !lower.includes('function ') && !lower.includes('func ') && !lower.includes('def ')) {
    return { category: 'PARTIAL_CODE_FRAGMENT', patchDetectionConfidence };
  }
  
  return { category: 'EXECUTABLE_APPLICATION_CODE', patchDetectionConfidence };
}
