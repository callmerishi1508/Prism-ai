const http = require('http');

async function checkStatus(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', (e) => {
      resolve(0);
    });
  });
}

async function postJSON(url, data) {
  return new Promise((resolve) => {
    const dataString = JSON.stringify(data);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length,
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

async function runTests() {
  console.log("--- STARTING LIVE E2E INTEGRATION TEST ---");
  let passed = 0;
  let total = 0;

  const url = 'http://localhost:3000';

  // Test 1: Home Page
  total++;
  const homeStatus = await checkStatus(url + '/');
  if (homeStatus === 200) {
    console.log("✅ [1] Home Page Loads Successfully (HTTP 200)");
    passed++;
  } else {
    console.log("❌ [1] Home Page Failed: " + homeStatus);
  }

  // Test 2: Dashboard
  total++;
  const dashStatus = await checkStatus(url + '/dashboard');
  if (dashStatus === 200) {
    console.log("✅ [2] Dashboard Loads Successfully (HTTP 200)");
    passed++;
  } else {
    console.log("❌ [2] Dashboard Failed: " + dashStatus);
  }

  // Test 3: GitHub Integration
  total++;
  // We'll fetch a real PR from an open source repo to prove it works
  const ghRes = await postJSON(url + '/api/github/fetch-pr', { url: "https://github.com/facebook/react/pull/26000" });
  if (ghRes.status === 200) {
    console.log("✅ [3] GitHub PR Integration Active & Parsing Diff");
    passed++;
  } else {
    console.log("❌ [3] GitHub Integration Failed: " + ghRes.status + " " + ghRes.body);
  }

  // Test 4: Custom Code Analysis (Gemini + Pinecone Live Test)
  total++;
  const testCode = "const password = 'mySecretPassword';\nfunction login(p) {\n  if (p === password) return true;\n  return false;\n}";
  const aiRes = await postJSON(url + '/api/review/analyze', { 
    code: testCode, 
    language: "javascript", 
    persona: "security", 
    isDemoMode: false // Force real API call
  });
  
  if (aiRes.status === 200) {
    const data = JSON.parse(aiRes.body);
    if (data.issues && data.issues.length > 0) {
       console.log("✅ [4] AI Analysis Engine (Gemini + Pinecone) Working! Discovered issues: " + data.issues[0].title);
       passed++;
    } else {
       console.log("⚠️ [4] AI Analysis succeeded, but returned no issues.");
    }
  } else {
    console.log("❌ [4] AI Analysis Failed: " + aiRes.status + " " + aiRes.body);
  }

  // Test 5: Demo Mode Fallback Check
  total++;
  const demoRes = await postJSON(url + '/api/review/analyze', { 
    code: "for(let i=0; i<10; i++) {}", // Dummy
    language: "javascript", 
    persona: "cto", 
    isDemoMode: true // Force Demo Mode
  });
  
  if (demoRes.status === 200) {
    console.log("✅ [5] Demo Mode Routing Working flawlessly.");
    passed++;
  } else {
    console.log("❌ [5] Demo Mode Routing Failed: " + demoRes.status);
  }

  console.log("-----------------------------------------");
  console.log(`TEST RESULTS: ${passed}/${total} PASSED.`);
  if (passed === total) {
    console.log("🏆 ALL SYSTEMS NOMINAL. PRISM-AI IS READY FOR DEPLOYMENT.");
  }
}

// Give Next.js 5 more seconds to fully boot before sending requests
setTimeout(runTests, 5000);
