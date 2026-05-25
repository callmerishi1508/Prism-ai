import { detectLanguage } from './languageDetector';

console.log("==========================================");
console.log("PRISM AI: HYBRID LANGUAGE DETECTION AUDIT");
console.log("==========================================\n");

function runTest(name: string, code: string, editorLang: string, expectBlock: boolean) {
  const result = detectLanguage(code, editorLang);
  const blockStatus = result.shouldBlockAnalysis === expectBlock ? "✅ PASS" : "❌ FAIL";
  
  console.log(`Test: ${name}`);
  console.log(`  Editor: ${editorLang} | Detected: ${result.primaryLanguage} (Conf: ${result.confidence.toFixed(2)})`);
  console.log(`  Embedded DSLs: ${result.embeddedDomains.map(d => d.type).join(', ')}`);
  if (result.shouldBlockAnalysis) {
    console.log(`  Mismatch Reason: ${result.mismatchReason}`);
  }
  console.log(`  Result: ${blockStatus}`);
  console.log("-".repeat(40));
}

// PASS CASES (Valid Hybrid or Safe)
runTest(
  "JavaScript + SQL query", 
  "const query = 'SELECT * FROM users WHERE id = ' + user.id;\ndb.execute(query);", 
  "javascript", 
  false
);

runTest(
  "Python + SQL query", 
  "query = f'SELECT * FROM users WHERE id = {user.id}'\ncursor.execute(query)", 
  "python", 
  false
);

runTest(
  "React JSX", 
  "export function App() {\n  return <div>Hello</div>;\n}", 
  "javascript", 
  false
);

runTest(
  "CUDA inside Python", 
  "import torch\ntensor = torch.zeros(10)\ntensor.cuda()", 
  "python", 
  false
);

runTest(
  "Bash inside Dockerfile", 
  "FROM node:18\nRUN apt-get update && apt-get install -y curl", 
  "dockerfile", 
  false
);

runTest(
  "YAML inside CI config", 
  "apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-pod", 
  "yaml", 
  false
);

runTest(
  "GraphQL inside TS", 
  "const GET_USER = gql`\n  query {\n    user { id }\n  }\n`;", 
  "typescript", 
  false
);

// BLOCK CASES (True Mismatches)
runTest(
  "Rust in Go mode", 
  "fn main() {\n    println!(\"Hello Rust\");\n}", 
  "go", 
  true
);

runTest(
  "C++ in Python mode", 
  "#include <iostream>\nint main() {\n    std::cout << \"Hello\";\n}", 
  "python", 
  true
);

runTest(
  "Java in HTML mode", 
  "public class Main {\n    public static void main(String[] args) {\n        System.out.print(\"Hello\");\n    }\n}", 
  "html", 
  true
);

// AMBIGUOUS CASES (Should downgrade confidence and avoid blocking)
runTest(
  "Ambiguous print()", 
  "print(\"Hello\")", 
  "javascript", 
  false
);

runTest(
  "Empty braces {}", 
  "{}", 
  "rust", 
  false
);

runTest(
  "Tiny SQL", 
  "SELECT 1", 
  "javascript", 
  false
);

runTest(
  "Ambiguous main()", 
  "main()", 
  "python", 
  false
);

