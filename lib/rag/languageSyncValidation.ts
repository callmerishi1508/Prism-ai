import { detectFileLanguage, normalizeLanguage } from '../languageDetector';

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

async function validateMixedRepoSync() {
  console.log("\n▶️ Validating Mixed-Repo File Synchronization...");

  const files = [
    { name: 'frontend/App.tsx', content: 'export function App() { return <div />; }', expected: 'typescript' },
    { name: 'backend/api.py', content: 'def process():\n  print("hello")', expected: 'python' },
    { name: 'infra/deployment.yml', content: 'apiVersion: v1\nkind: Pod', expected: 'yaml' },
    { name: 'Dockerfile', content: 'FROM node:18', expected: 'dockerfile' },
    { name: 'schema.sql', content: 'SELECT * FROM users;', expected: 'sql' },
    { name: 'unknown.config', content: 'server.port=8080', expected: 'plaintext' },
    { name: 'main.go', content: 'package main\nimport "fmt"', expected: 'go' },
    { name: 'src/main.rs', content: 'fn main() { println!("Hello"); }', expected: 'rust' }
  ];

  files.forEach(f => {
    // We pass plaintext as fallback so we strictly test extension/semantic resolution
    const detected = detectFileLanguage(f.name, f.content, 'plaintext');
    assert(detected === f.expected, `${f.name} -> expected ${f.expected}, got ${detected}`);
  });
}

async function validateSemanticFallback() {
  console.log("\n▶️ Validating Semantic Detection Fallback (Extensions Lie)...");

  // An extensionless file with python code > 30 chars
  const detected1 = detectFileLanguage('script', 'def handle_something_long_enough():\n  print(1)', 'javascript');
  assert(detected1 === 'python', `Extensionless python file -> expected python, got ${detected1}`);
  
  // A misleading extension (.txt) with C++ code
  const detected2 = detectFileLanguage('config.txt', '#include <iostream>\nstd::cout << "test";', 'javascript');
  assert(detected2 === 'cpp', `Misleading txt extension -> expected cpp, got ${detected2}`);
}

async function main() {
  console.log("==================================================");
  console.log("PRISM AI - LANGUAGE SYNC DETERMINISTIC VALIDATION");
  console.log("==================================================\n");

  await validateMixedRepoSync();
  await validateSemanticFallback();

  console.log("\n==================================================");
  console.log("VALIDATION RESULTS");
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount === 0) {
    console.log("\n✅ ARCHITECTURE FULLY SYNCHRONIZED AND DETERMINISTIC.");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main().catch(console.error);
