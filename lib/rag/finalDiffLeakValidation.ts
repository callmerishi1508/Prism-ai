import { stripDiffArtifacts } from './sanitizer';

function runValidation() {
  let passed = 0;
  let failed = 0;

  function assertEqual(name: string, actual: string, expected: string) {
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

  // 1. CSS unified diff
  const cssDiff = `@@ -1,3 +1,3 @@
 .btn-primary {
-  color: red;
+  color: blue;
 }`;
  // The user's strict regex preserves indented lines
  const cssUserClean = ` .btn-primary {\n-  color: red;\n+  color: blue;\n }`; 
  assertEqual('CSS unified diff (user regex preserves space-indented diffs)', stripDiffArtifacts(cssDiff, true), cssUserClean);

  // 2. TSX diff
  const tsxDiff = `--- a/page.tsx
+++ b/page.tsx
@@ -10,2 +10,2 @@
 function App() {
-return <div />;
+return <span></span>;
 }`;
  const tsxExpected = ` function App() {\nreturn <div />;\nreturn <span></span>;\n }`;
  assertEqual('TSX diff', stripDiffArtifacts(tsxDiff, true), tsxExpected);

  // 3. Valid Python indentation (must not break)
  const pythonValid = `def calc():
    negative_value = -1
    positive_value = +1`;
  assertEqual('Python indentation', stripDiffArtifacts(pythonValid, true), pythonValid);

  // 4. YAML valid syntax (must not break)
  const yamlValid = `items:
  - item1
  - item2`;
  assertEqual('YAML array', stripDiffArtifacts(yamlValid, true), yamlValid);

  // 5. SQL valid syntax
  const sqlValid = `-- This is a comment
SELECT * FROM table;`;
  assertEqual('SQL comment', stripDiffArtifacts(sqlValid, true), sqlValid);

  // 6. Valid ++ / --
  const incDec = `let i = 0;
++i;
--i;`;
  assertEqual('Valid increment/decrement', stripDiffArtifacts(incDec, true), incDec);

  console.log(`\nValidation Complete: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runValidation();
