const code = `--- a/.claude-plugin/plugin.json
+++ b/.claude-plugin/plugin.json
@@ -1,7 +1,7 @@
 {
   "name": "understand-anything",
   "description": "AI-powered codebase understanding - analyze, visualize, and
-  "version": "2.7.5",
+  "version": "2.7.6",
   "author": {
     "name": "Lum1104"
   },`;

const codeToValidate = `{
  "name": "understand-anything",
  "description": "AI-powered codebase understanding - analyze, visualize, and
  "version": "2.7.6",
  "author": {
    "name": "Lum1104"
  },`;

const validateSyntaxStructure = (c) => {
  const stack = [];
  let inString = false;
  let stringChar = '';
  let inLineComment = false;
  let inBlockComment = false;

  const getLineStr = (index) => {
    let start = index;
    while (start > 0 && c[start - 1] !== '\n') start--;
    let end = index;
    while (end < c.length && c[end] !== '\n') end++;
    return c.substring(start, end);
  };

  for (let i = 0; i < c.length; i++) {
    const char = c[i];
    const nextChar = c[i+1] || '';

    if (inLineComment) { if (char === '\n') inLineComment = false; continue; }
    if (inBlockComment) { if (char === '*' && nextChar === '/') { inBlockComment = false; i++; } continue; }
    if (inString) {
      if (char === '\\') { i++; continue; }
      if (char === stringChar) inString = false;
      continue;
    }

    if (char === '/' && nextChar === '/') { inLineComment = true; i++; continue; }
    if (char === '/' && nextChar === '*') { inBlockComment = true; i++; continue; }
    if (char === '"' || char === "'" || char === '\`') { inString = true; stringChar = char; continue; }

    if (char === '{' || char === '[' || char === '(') stack.push({ char, index: i });
    else if (char === '}') { 
      const popped = stack.pop();
      if (!popped || popped.char !== '{') return { isValid: false, errorLineStr: getLineStr(i) }; 
    }
    else if (char === ']') { 
      const popped = stack.pop();
      if (!popped || popped.char !== '[') return { isValid: false, errorLineStr: getLineStr(i) }; 
    }
    else if (char === ')') { 
      const popped = stack.pop();
      if (!popped || popped.char !== '(') return { isValid: false, errorLineStr: getLineStr(i) }; 
    }
  }
  
  if (stack.length > 0) {
    return { isValid: false, errorLineStr: getLineStr(stack[stack.length - 1].index) };
  }
  
  return { isValid: true };
};

const syntaxResult = validateSyntaxStructure(codeToValidate);

if (!syntaxResult.isValid) {
  let mappedLine = 1;
  if (syntaxResult.errorLineStr) {
    const rawLines = code.split('\n');
    const trimmedSearch = syntaxResult.errorLineStr.trim();
    
    const matchIndex = rawLines.findIndex(l => {
      const t = l.trim();
      return t === trimmedSearch || (l.startsWith('+') && l.substring(1).trim() === trimmedSearch) || t.endsWith(trimmedSearch);
    });
    
    if (matchIndex !== -1) {
      mappedLine = matchIndex + 1;
    }
  }
  
  console.log("Mapped line:", mappedLine);
  if (mappedLine === 4) {
    console.log("SUCCESS! Line mapped correctly back to Line 4 of raw code");
  } else {
    console.log("FAILED. Mapped to line:", mappedLine, "but expected 4");
    process.exit(1);
  }
}
