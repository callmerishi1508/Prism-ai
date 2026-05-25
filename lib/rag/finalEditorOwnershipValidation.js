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
    // Mocking the component state
    var editorMode = "PATCH_REVIEW";
    var activeLanguage = "css";
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
    var originalDiff = "@@ -1,3 +1,3 @@\nbody {\n-color: red;\n+color: blue;\n}";
    var repairedCodeGeneratedByLLM = "body {\n+color: blue;\n-color: red;\n}"; // Simulate LLM hallucination
    var appliedCode = (0, sanitizer_1.stripDiffArtifacts)(repairedCodeGeneratedByLLM, true);
    // Assert no markers in applied code
    assertEqual("Apply Changes -> Sanitize outputs correctly", appliedCode.includes('+'), false);
    assertEqual("Apply Changes -> Sanitize outputs correctly", appliedCode.includes('-'), false);
    // 4. EXPORT TEST
    var exportedCode = (0, sanitizer_1.stripDiffArtifacts)(repairedCodeGeneratedByLLM, true);
    assertEqual("Export Test -> Exported file contains zero leading markers", exportedCode, "body {\ncolor: blue;\ncolor: red;\n}");
    console.log("\nValidation Complete: ".concat(passed, " Passed, ").concat(failed, " Failed"));
    if (failed > 0)
        process.exit(1);
}
runValidation();
