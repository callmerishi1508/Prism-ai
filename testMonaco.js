const fs = require('fs');
const path = require('path');

const monacoPath = path.join(__dirname, 'node_modules', 'monaco-editor', 'min', 'vs', 'basic-languages');
const content = fs.readFileSync(path.join(monacoPath, 'monaco.contribution.js'), 'utf8');

const matches = content.match(/id:\s*["']([^"']+)["']/g);
console.log(matches ? matches.map(m => m.replace(/id:\s*["']|["']/g, '')) : "No matches");
