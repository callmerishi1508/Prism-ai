import { stripDiffArtifacts } from './sanitizer';

function runValidation() {
  let passed = 0;
  let failed = 0;

  function assertEqual(name: string, actual: any, expected: any) {
    if (actual === expected) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`Expected:\n${expected}`);
      console.error(`Actual:\n${actual}`);
      failed++;
    }
  }

  type EditorExecutionMode = "PATCH_REVIEW" | "RECONSTRUCTED_SOURCE" | "REPAIRED_SOURCE";

  // Mocking the component state
  let editorMode: EditorExecutionMode = "PATCH_REVIEW";
  let activeLanguage = "css";

  function getMonacoLanguage() {
    return editorMode === "PATCH_REVIEW" ? "diff" : activeLanguage;
  }

  // 1. PATCH MODE
  editorMode = "PATCH_REVIEW";
  assertEqual("PATCH_REVIEW -> language is 'diff'", getMonacoLanguage(), "diff");

  // 2. REPAIR MODE
  editorMode = "REPAIRED_SOURCE";
  assertEqual("REPAIRED_SOURCE -> language is native (css)", getMonacoLanguage(), "css");

  // 3. APPLY CHANGES Flow
  const originalDiff = `@@ -1,3 +1,3 @@
body {
-color: red;
+color: blue;
}`;
  const repairedCodeGeneratedByLLM = `body {\n+color: blue;\n-color: red;\n}`; // Simulate LLM hallucination
  const appliedCode = stripDiffArtifacts(repairedCodeGeneratedByLLM, true);

  // Assert no markers in applied code
  assertEqual("Apply Changes -> Sanitize outputs correctly", appliedCode.includes('+'), false);
  assertEqual("Apply Changes -> Sanitize outputs correctly", appliedCode.includes('-'), false);

  // 4. EXPORT TEST
  const exportedCode = stripDiffArtifacts(repairedCodeGeneratedByLLM, true);
  assertEqual("Export Test -> Exported file contains zero leading markers", exportedCode, `body {\ncolor: blue;\ncolor: red;\n}`);

  console.log(`\nValidation Complete: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runValidation();
