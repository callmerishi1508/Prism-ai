"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripDiffArtifacts = stripDiffArtifacts;
function stripDiffArtifacts(code, isPatchArtifact) {
    if (isPatchArtifact === void 0) { isPatchArtifact = false; }
    if (!code)
        return code;
    // Only sanitize when artifactCategory is PATCH_ARTIFACT
    // otherwise we risk corrupting legitimate source files.
    if (!isPatchArtifact)
        return code;
    return code
        .split('\n')
        .filter(function (line) {
        var trimmed = line.trimStart();
        // Remove git metadata lines
        if (trimmed.startsWith('--- a/'))
            return false;
        if (trimmed.startsWith('+++ b/'))
            return false;
        if (trimmed.startsWith('@@'))
            return false;
        if (trimmed.startsWith('diff --git'))
            return false;
        if (trimmed.startsWith('index '))
            return false;
        return true;
    })
        .map(function (line) {
        // Remove ONLY real unified diff prefixes
        // while preserving valid language syntax.
        // E.g. "+foo" -> "foo", but "++i" -> "++i" and "+ 1" -> "+ 1"
        // Wait, what if the LLM hallucinated "+    console.log()"?
        // The user regex `/^\+[^\+\s]/` will NOT match "+    ". It only matches "+" followed by non-plus non-space.
        // But standard git diff actually puts a space after the plus if it's replacing a space, or just "+code".
        // We will stick exactly to the user's requested regex to avoid breaking valid code.
        if (/^\+[^\+\s]/.test(line)) {
            return line.slice(1);
        }
        if (/^-[^-\s]/.test(line)) {
            return line.slice(1);
        }
        // Additional fallback: If it's literally just "+" or "-"
        if (line === '+')
            return '';
        if (line === '-')
            return '';
        return line;
    })
        .join('\n');
}
