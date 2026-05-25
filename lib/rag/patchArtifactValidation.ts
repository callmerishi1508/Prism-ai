import { categorizeArtifact } from '../artifactClassifier';
import { parsePatchArtifact } from '../patchParser';
import { classifyIntent } from './intentClassifier';

let failCount = 0;
let passCount = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failCount++;
  } else {
    console.log(`✅ PASS: ${message}`);
    passCount++;
  }
}

const JS_DIFF = `
diff --git a/src/auth.js b/src/auth.js
index 83a2b3..92b3c4 100644
--- a/src/auth.js
+++ b/src/auth.js
@@ -10,3 +10,4 @@
-  const isValid = sanitize(req.body);
+  const isValid = execute(req.body);
`;

const SQL_DIFF = `
diff --git a/queries.sql b/queries.sql
index a1..b2 100644
--- a/queries.sql
+++ b/queries.sql
@@ -1,2 +1,3 @@
- SELECT * FROM users WHERE id = ?
+ SELECT * FROM users WHERE id = \${userId}
`;

const GENERATED_DIFF = `
diff --git a/package-lock.json b/package-lock.json
index 1..2 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,2 +1,3 @@
- "version": "1.0.0"
+ "version": "1.0.1"
`;

const MOVED_DIFF = `
diff --git a/src/old.ts b/src/new.ts
similarity index 100%
rename from src/old.ts
rename to src/new.ts
`;

async function validatePatchDetection() {
  console.log("\\n▶️ Validating Artifact Classifier...");

  const clsJS = categorizeArtifact(JS_DIFF, 'javascript');
  assert(clsJS.category === 'PATCH_ARTIFACT', 'JS Diff should be PATCH_ARTIFACT');
  assert(clsJS.patchSubtype === 'UNIFIED_DIFF', 'Subtype should be UNIFIED_DIFF');
  assert(clsJS.patchDetectionConfidence > 0.6, 'Confidence should be high');

  const parsedJS = parsePatchArtifact(JS_DIFF);
  assert(parsedJS.files.length === 1, 'Should parse 1 file');
  assert(parsedJS.files[0].filename === 'src/auth.js', 'Should extract filename');
  assert(parsedJS.files[0].changeType === 'MODIFIED', 'Should be MODIFIED changeType');
  assert(parsedJS.files[0].addedLines[0] === '  const isValid = execute(req.body);', 'Should extract added lines');
  assert(parsedJS.files[0].removedLines[0] === '  const isValid = sanitize(req.body);', 'Should extract removed lines');
  
  // Semantic Delta extraction check
  assert(parsedJS.files[0].hunks[0].semanticDelta.beforeContext.includes('sanitize'), 'Before context should include sanitize');
  assert(parsedJS.files[0].hunks[0].semanticDelta.afterContext.includes('execute'), 'After context should include execute');

  const intentJS = classifyIntent(JS_DIFF, { primaryDomain: 'SECURITY', secondaryDomains: [], domains: [], blockedDomains: [], framework: null, executionContext: { runtime: 'node', environment: 'server' } }, []);
  assert(intentJS.rankedIntents.some(i => ['SQL_INJECTION', 'XSS', 'AUTH_BYPASS'].includes(i.intent)), 'Should boost security intents based on semantic delta: ' + intentJS.primaryIntent);
}

async function validateGeneratedFiles() {
  console.log("\\n▶️ Validating Generated Files & Moves...");

  const parsedGen = parsePatchArtifact(GENERATED_DIFF);
  assert(parsedGen.files[0].isGeneratedArtifact === true, 'package-lock.json should be marked generated');

  const parsedMoved = parsePatchArtifact(MOVED_DIFF);
  assert(parsedMoved.files[0].changeType === 'RENAMED', 'Should detect RENAME');
}

async function main() {
  console.log("==================================================");
  console.log("PRISM AI - PATCH ARTIFACT VALIDATION SUITE");
  console.log("==================================================\\n");

  await validatePatchDetection();
  await validateGeneratedFiles();

  console.log("\\n==================================================");
  console.log("VALIDATION RESULTS");
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount === 0) {
    console.log("\\n✅ ARTIFACT ORCHESTRATION FULLY DETERMINISTIC.");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main().catch(console.error);
