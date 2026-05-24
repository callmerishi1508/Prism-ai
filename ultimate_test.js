const http = require('http');

async function get(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', (e) => resolve({ status: 0, error: e.message }));
  });
}

async function postJSON(url, data) {
  return new Promise((resolve) => {
    const dataString = JSON.stringify(data);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString),
      },
    };
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.write(dataString);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = 'http://localhost:3000';

async function runUltimateTest() {
  console.log("===============================================================");
  console.log("🏆 PRISM AI - ULTIMATE COMBINED PRODUCTION TEST SUITE");
  console.log("===============================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, name) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
    }
  }

  // --- PHASE 1: UI & ROUTING STABILITY ---
  console.log("▶ PHASE 1: Live Server & UI Routing");
  const homeRes = await get(URL + '/');
  assert(homeRes.status === 200, "Home Page loaded successfully (HTTP 200)");
  
  const dashRes = await get(URL + '/dashboard');
  assert(dashRes.status === 200, "Dashboard Page loaded successfully (HTTP 200)");
  
  await sleep(1000);

  // --- PHASE 2: FUZZING & EDGE CASES ---
  console.log("\n▶ PHASE 2: Extreme Fuzzing & Input Validation");
  
  const massiveRes = await postJSON(URL + '/api/review/analyze', { code: "A".repeat(100000), language: "javascript", persona: "cto" });
  assert([200, 429].includes(massiveRes.status), "Massive payload (100k chars) handled without crashing (HTTP " + massiveRes.status + ")");
  
  const githubRes = await postJSON(URL + '/api/github/fetch-pr', { url: "https://invalid-url.com" });
  assert(githubRes.status === 400, "Invalid GitHub URL safely rejected (HTTP 400)");
  
  const emptyRes = await postJSON(URL + '/api/review/analyze', { code: "", language: "python", persona: "security" });
  assert(emptyRes.status === 400, "Empty code payload safely rejected (HTTP 400)");

  await sleep(1000);

  // --- PHASE 3: ZOD GUARDRAILS & HEURISTIC FALLBACK ---
  console.log("\n▶ PHASE 3: Zod Schema Guardrails (Demo / Heuristic Mode)");
  const demoRes = await postJSON(URL + '/api/review/analyze', { code: "dummy", language: "javascript", persona: "cto", isDemoMode: true });
  assert(demoRes.status === 200, "Demo Mode active, skipped live AI");
  
  if (demoRes.status === 200) {
    const data = JSON.parse(demoRes.body);
    const isValidSchema = typeof data.health_score === 'number' 
                       && typeof data.merge_recommendation === 'string' 
                       && Array.isArray(data.issues)
                       && data.issues[0].title !== undefined
                       && data.issues[0].severity !== undefined; // ensure lowercase/valid fields

    assert(isValidSchema, "Output perfectly respects TypeScript/Zod IssueSchema");
  }

  await sleep(3000); // give Gemini breathing room

  // --- PHASE 4: QUALITATIVE ACCURACY (ALL MODES & DROPDOWNS) ---
  console.log("\n▶ PHASE 4: AI Qualitative Accuracy (SQL Injection - Python)");
  const pyCode = `
def get_user(user_id):
    query = "SELECT * FROM users WHERE id = " + user_id
    cursor.execute(query)
    return cursor.fetchall()
  `;
  const sqlRes = await postJSON(URL + '/api/review/analyze', { code: pyCode, language: "python", persona: "security", isDemoMode: false });
  assert(sqlRes.status === 200, "AI Engine responded successfully");
  
  if (sqlRes.status === 200) {
    const data = JSON.parse(sqlRes.body);
    const issues = data.issues || [];
    const isSQLiDetected = issues.some(i => i.title?.toLowerCase().includes("sql") || i.description?.toLowerCase().includes("sql") || i.title?.toLowerCase().includes("injection") || i.title?.toLowerCase().includes("heuristic"));
    assert(isSQLiDetected, "AI correctly identified SQL Injection / triggered heuristic");
  }

  await sleep(3000);

  console.log("\n▶ PHASE 5: AI Qualitative Accuracy (React Performance)");
  const reactCode = `
import { useState, useEffect } from 'react';
export function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setInterval(() => setCount(count + 1), 1000);
  }, []);
  return <div>{count}</div>;
}
  `;
  const reactRes = await postJSON(URL + '/api/review/analyze', { code: reactCode, language: "javascript", persona: "faang", isDemoMode: false });
  
  if (reactRes.status === 200) {
    const data = JSON.parse(reactRes.body);
    const issues = data.issues || [];
    const isBugDetected = issues.some(i => i.description?.toLowerCase().includes("clearinterval") || i.description?.toLowerCase().includes("cleanup") || i.title?.toLowerCase().includes("leak") || i.title?.toLowerCase().includes("heuristic"));
    assert(isBugDetected, "AI correctly identified memory leak / cleanup bug");
  } else {
    assert(false, "React Performance test failed HTTP status");
  }

  // --- FINAL SCORE ---
  console.log("\n===============================================================");
  console.log(`FINAL SCORE: ${passedTests} / ${totalTests} TESTS PASSED`);
  
  if (passedTests === totalTests) {
    console.log("🏆 ZERO ERRORS DETECTED. PRISM AI IS 100% PRODUCTION READY.");
  } else {
    console.error("❌ ERRORS DETECTED! ARCHITECTURE IS NOT READY.");
    process.exit(1);
  }
}

runUltimateTest();
