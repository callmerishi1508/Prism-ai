import { detectFileLanguage } from './languageDetector';

const MAX_PATCH_FILES = 50;
const MAX_PATCH_HUNKS = 200;
const MAX_PATCH_LINES = 10000;
const MAX_RECONSTRUCTED_FILE_LINES = 5000;
const MAX_RECONSTRUCTED_FILE_SIZE_KB = 500;
const MAX_HUNK_CONTEXT_WINDOW = 200;

export type ChangeType = "MODIFIED" | "ADDED" | "DELETED" | "RENAMED" | "MOVED";

export interface ParsedPatchArtifact {
  files: ParsedPatchFile[];
  dominantLanguage: string;
  mixedLanguages: string[];
  totalAdditions: number;
  totalRemovals: number;
  semanticRiskLevel: string;
  patchRecoveryMode: boolean;
}

export interface ParsedPatchFile {
  filename: string;
  language: string;
  changeType: ChangeType;
  isGeneratedArtifact: boolean;
  hunks: ParsedHunk[];
  addedLines: string[];
  removedLines: string[];
  contextLines: string[];
}

export interface OrderedLine {
  type: 'context' | 'added' | 'removed';
  content: string;
}

export interface ParsedHunk {
  header: string;
  orderedLines: OrderedLine[];
  additions: string[];
  removals: string[];
  context: string[];
  semanticDelta: {
    beforeContext: string;
    afterContext: string;
  };
  isPartialStructuralContext: boolean;
  reconstructionConfidence: number;
}

export function parsePatchArtifact(diff: string): ParsedPatchArtifact {
  const files: ParsedPatchFile[] = [];
  const lines = diff.split('\n');
  
  let currentFile: Partial<ParsedPatchFile> | null = null;
  let currentHunk: Partial<ParsedHunk> | null = null;
  
  let totalAdditions = 0;
  let totalRemovals = 0;
  let globalLineCount = 0;
  let globalHunkCount = 0;
  let patchRecoveryMode = false;

  const pushCurrentHunk = () => {
    if (currentFile && currentHunk && currentHunk.orderedLines) {
      let beforeContextLines = [];
      let afterContextLines = [];
      
      let confidence = 1.0;
      if (patchRecoveryMode) confidence -= 0.2;
      
      const limitedLines = currentHunk.orderedLines.slice(0, MAX_HUNK_CONTEXT_WINDOW);
      if (currentHunk.orderedLines.length > MAX_HUNK_CONTEXT_WINDOW) {
         confidence -= 0.3; // degraded due to truncation
      }
      
      let isPartial = false;
      const lang = currentFile.language?.toLowerCase() || '';

      // Interleaved Exact Reconstruction
      for (const line of limitedLines) {
        if (line.type !== 'added') {
          beforeContextLines.push(line.content);
        }
        if (line.type !== 'removed') {
          afterContextLines.push(line.content);
        }
      }

      // Structural Partial Context Detection
      if (lang === 'css' || lang === 'scss' || lang === 'javascript' || lang === 'typescript' || lang === 'java' || lang === 'cpp' || lang === 'c') {
         // Brace tracking
         let openBraces = 0;
         let closeBraces = 0;
         for (const line of afterContextLines) {
            openBraces += (line.match(/\{/g) || []).length;
            closeBraces += (line.match(/\}/g) || []).length;
         }
         // If we close more than we open, or if we have content but no braces and it's not a single line change
         if (closeBraces > openBraces) {
            isPartial = true;
         }
      } else if (lang === 'python' || lang === 'yaml') {
         // Indentation check
         if (afterContextLines.length > 0) {
            const firstLine = afterContextLines[0];
            if (firstLine.match(/^\s+[a-zA-Z0-9]/)) {
               // Begins mid-scope
               isPartial = true;
            }
         }
      }

      if (isPartial) {
         confidence -= 0.4;
      }

      currentHunk.semanticDelta = {
        beforeContext: beforeContextLines.join('\n'),
        afterContext: afterContextLines.join('\n')
      };
      
      currentHunk.isPartialStructuralContext = isPartial;
      currentHunk.reconstructionConfidence = Math.max(0, confidence);

      currentFile.hunks!.push(currentHunk as ParsedHunk);
      currentHunk = null;
    }
  };

  const pushCurrentFile = () => {
    pushCurrentHunk();
    if (currentFile && currentFile.filename) {
      const fname = currentFile.filename.toLowerCase();
      currentFile.isGeneratedArtifact = 
        fname.includes('package-lock.json') || 
        fname.includes('yarn.lock') || 
        fname.includes('pnpm-lock.yaml') ||
        fname.includes('/dist/') || 
        fname.includes('/build/') || 
        fname.endsWith('.min.js') || 
        fname.endsWith('.pb.go');
        
      files.push(currentFile as ParsedPatchFile);
      currentFile = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    if (files.length >= MAX_PATCH_FILES || globalLineCount >= MAX_PATCH_LINES || globalHunkCount >= MAX_PATCH_HUNKS) {
      break;
    }
    
    const line = lines[i];
    globalLineCount++;

    if (line.startsWith('diff --git')) {
      pushCurrentFile();
      currentFile = {
        filename: 'unknown',
        changeType: 'MODIFIED',
        hunks: [],
        addedLines: [],
        removedLines: [],
        contextLines: [],
        language: 'plaintext'
      };
      const match = line.match(/ b\/(.+)$/);
      if (match) currentFile.filename = match[1];
      continue;
    }

    if (!currentFile && (line.startsWith('--- a/') || line.startsWith('+++ b/'))) {
       pushCurrentFile();
       currentFile = {
        filename: 'unknown',
        changeType: 'MODIFIED',
        hunks: [],
        addedLines: [],
        removedLines: [],
        contextLines: [],
        language: 'plaintext'
      };
    }

    if (!currentFile) {
       // Corrupted patch recovery: random hunk fragments without file headers
       if (line.startsWith('@@ ') || line.startsWith('+') || line.startsWith('-')) {
          patchRecoveryMode = true;
          currentFile = {
            filename: 'unknown_recovered',
            changeType: 'MODIFIED',
            hunks: [],
            addedLines: [],
            removedLines: [],
            contextLines: [],
            language: 'plaintext'
          };
       } else {
          continue;
       }
    }

    if (line.startsWith('new file mode')) currentFile.changeType = 'ADDED';
    else if (line.startsWith('deleted file mode')) currentFile.changeType = 'DELETED';
    else if (line.startsWith('rename from')) currentFile.changeType = 'RENAMED';
    else if (line.startsWith('similarity index') && currentFile!.changeType !== 'RENAMED') currentFile.changeType = 'MOVED';

    if (line.startsWith('--- a/')) {
       if (currentFile.filename === 'unknown') currentFile.filename = line.substring(6);
       continue;
    }
    if (line.startsWith('+++ b/')) {
       if (currentFile.filename === 'unknown' || currentFile.filename === 'unknown_recovered') currentFile.filename = line.substring(6);
       currentFile.language = detectFileLanguage(currentFile.filename, '', 'plaintext');
       continue;
    }

    if (line.startsWith('@@ ')) {
      pushCurrentHunk();
      globalHunkCount++;
      currentHunk = {
        header: line,
        orderedLines: [],
        additions: [],
        removals: [],
        context: []
      };
      continue;
    }

    if (!currentHunk && (line.startsWith('+') || line.startsWith('-'))) {
       // Corrupted patch recovery: missing @@ header
       patchRecoveryMode = true;
       globalHunkCount++;
       currentHunk = {
         header: '@@ recovered @@',
         orderedLines: [],
         additions: [],
         removals: [],
         context: []
       };
    }

    if (currentHunk && currentHunk.orderedLines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        const content = line.substring(1);
        currentHunk.orderedLines.push({ type: 'added', content });
        currentHunk.additions!.push(content);
        currentFile.addedLines!.push(content);
        totalAdditions++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        const content = line.substring(1);
        currentHunk.orderedLines.push({ type: 'removed', content });
        currentHunk.removals!.push(content);
        currentFile.removedLines!.push(content);
        totalRemovals++;
      } else if (line.startsWith(' ')) {
        const content = line.substring(1);
        currentHunk.orderedLines.push({ type: 'context', content });
        currentHunk.context!.push(content);
        currentFile.contextLines!.push(content);
      }
    }
  }

  pushCurrentFile();

  const langCounts: Record<string, number> = {};
  files.forEach(f => {
    langCounts[f.language] = (langCounts[f.language] || 0) + 1;
  });
  const mixedLanguages = Object.keys(langCounts);
  let dominantLanguage = 'plaintext';
  let maxCount = 0;
  for (const [lang, count] of Object.entries(langCounts)) {
    if (count > maxCount) { maxCount = count; dominantLanguage = lang; }
  }

  let semanticRiskLevel = 'LOW';
  if (totalRemovals > 100 || totalAdditions > 500) semanticRiskLevel = 'HIGH';
  else if (totalRemovals > 20 || totalAdditions > 50) semanticRiskLevel = 'MEDIUM';

  return {
    files,
    dominantLanguage,
    mixedLanguages,
    totalAdditions,
    totalRemovals,
    semanticRiskLevel,
    patchRecoveryMode
  };
}
