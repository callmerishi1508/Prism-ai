"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sanitizer_1 = require("./sanitizer");
function runValidation() {
    var passed = 0;
    var failed = 0;
    function assertEqual(name, actual, expected) {
        if (actual === expected) {
            console.log("\u2705 [PASS] ".concat(name));
            passed++;
        }
        else {
            console.error("\u274C [FAIL] ".concat(name));
            console.error("Expected:\n".concat(expected));
            console.error("Actual:\n".concat(actual));
            failed++;
        }
    }
    // 1. CSS unified diff
    var cssDiff = "@@ -1,3 +1,3 @@\n .btn-primary {\n-  color: red;\n+  color: blue;\n }";
    // The user's strict regex preserves indented lines
    var cssUserClean = " .btn-primary {\n-  color: red;\n+  color: blue;\n }";
    assertEqual('CSS unified diff (user regex preserves space-indented diffs)', (0, sanitizer_1.stripDiffArtifacts)(cssDiff, true), cssUserClean);
    // 2. TSX diff
    var tsxDiff = "--- a/page.tsx\n+++ b/page.tsx\n@@ -10,2 +10,2 @@\n function App() {\n-return <div />;\n+return <span></span>;\n }";
    var tsxExpected = " function App() {\nreturn <div />;\nreturn <span></span>;\n }";
    assertEqual('TSX diff', (0, sanitizer_1.stripDiffArtifacts)(tsxDiff, true), tsxExpected);
    // 3. Valid Python indentation (must not break)
    var pythonValid = "def calc():\n    negative_value = -1\n    positive_value = +1";
    assertEqual('Python indentation', (0, sanitizer_1.stripDiffArtifacts)(pythonValid, true), pythonValid);
    // 4. YAML valid syntax (must not break)
    var yamlValid = "items:\n  - item1\n  - item2";
    assertEqual('YAML array', (0, sanitizer_1.stripDiffArtifacts)(yamlValid, true), yamlValid);
    // 5. SQL valid syntax
    var sqlValid = "-- This is a comment\nSELECT * FROM table;";
    assertEqual('SQL comment', (0, sanitizer_1.stripDiffArtifacts)(sqlValid, true), sqlValid);
    // 6. Valid ++ / --
    var incDec = "let i = 0;\n++i;\n--i;";
    assertEqual('Valid increment/decrement', (0, sanitizer_1.stripDiffArtifacts)(incDec, true), incDec);
    console.log("\nValidation Complete: ".concat(passed, " Passed, ").concat(failed, " Failed"));
    if (failed > 0)
        process.exit(1);
}
runValidation();
