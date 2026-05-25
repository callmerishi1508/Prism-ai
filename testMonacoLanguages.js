const fs = require('fs');
const path = require('path');
const monacoPath = path.join(__dirname, 'node_modules', 'monaco-editor', 'min', 'vs', 'basic-languages');
const files = fs.readdirSync(monacoPath);
console.log(files);
