import { classifyIntent } from './intentClassifier';
import { classifyCode } from './domainClassifier';
import { retrieveContext } from './retriever';
import { detectLanguage } from '../languageDetector';

console.log("==========================================");
console.log("PRISM AI: INTENT-AWARE RETRIEVAL AUDIT");
console.log("==========================================\n");

function runTest(name: string, code: string, editorLang: string, expectedIntents: string[], expectedDocs: string[]) {
  console.log(`Test: ${name}`);
  const langRes = detectLanguage(code, editorLang);
  const classRes = classifyCode(code, langRes.primaryLanguage, langRes.embeddedDomains);
  const intentRes = classifyIntent(code, classRes, langRes.embeddedDomains);
  
  const retrievedDocs = retrieveContext(code, langRes.primaryLanguage, 3, langRes.embeddedDomains);
  
  const topIntents = intentRes.rankedIntents.map(i => i.intent);
  const hasExpectedIntents = expectedIntents.every(ei => topIntents.includes(ei as any));
  const retrievedDocIds = retrievedDocs.map(d => d.id);
  const hasExpectedDocs = expectedDocs.every(ed => retrievedDocIds.includes(ed));

  console.log(`  Primary Intent: ${intentRes.primaryIntent} (Conf: ${intentRes.confidence})`);
  console.log(`  Ranked Intents: ${topIntents.slice(0, 3).join(', ')}`);
  console.log(`  Retrieved Docs: ${retrievedDocIds.join(', ')}`);

  if (hasExpectedIntents && hasExpectedDocs) {
    console.log("  Result: ✅ PASS");
  } else {
    console.log("  Result: ❌ FAIL");
    if (!hasExpectedIntents) console.log(`    Missing Intents: ${expectedIntents.filter(ei => !topIntents.includes(ei as any)).join(', ')}`);
    if (!hasExpectedDocs) console.log(`    Missing Docs: ${expectedDocs.filter(ed => !retrievedDocIds.includes(ed)).join(', ')}`);
  }
  console.log("-".repeat(40));
}

// 1. N+1 Query
runTest(
  "JavaScript N+1 Query (Batching Code)",
  "const users = await db.execute('SELECT * FROM users');\\nfor (const u of users) {\\n  const posts = await db.execute('SELECT * FROM posts WHERE user_id = ' + u.id);\\n}",
  "javascript",
  ["N_PLUS_ONE", "SQL_INJECTION"],
  ["DB-PERF-01", "DB-01"] // Expect BOTH performance and security docs
);

// 2. Pure SQL Injection (No N+1)
runTest(
  "Python SQL Injection",
  "def get_user(req):\\n  # Extract user ID from request\\n  id = req.body['id']\\n  cursor.execute(f'SELECT * FROM users WHERE id = {id}')",
  "python",
  ["SQL_INJECTION", "MISSING_VALIDATION"],
  ["DB-01", "PY-01"]
);

// 3. React Render Loop
runTest(
  "React Infinite Render Loop",
  "export function App() {\\n  const [count, setCount] = useState(0);\\n  useEffect(() => {\\n    setCount(count + 1);\\n  });\\n  return <div dangerouslySetInnerHTML={{__html: 'test'}} />\\n}",
  "javascript",
  ["INEFFICIENT_RENDER", "XSS"],
  ["REACT-01"]
);

// 4. CUDA Memory Leak
runTest(
  "CUDA Infinite Loop",
  "import torch\\nwhile True:\\n    x = torch.zeros(10)\\n    x = x.to('cuda')",
  "python",
  ["GPU_MEMORY_EXHAUSTION"],
  [] // No specific cuda doc in DB, but intent should be correct
);

// 5. Tiny snippet (confidence should drop)
runTest(
  "Tiny snippet SQL",
  "query()",
  "python",
  [],
  [] 
);
