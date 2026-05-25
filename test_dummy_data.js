const tests = [
  { name: '1. C++ Syntax Error (print)', payload: { code: 'print()', language: 'C++', persona: 'Startup CTO' } },
  { name: '2. Python Syntax Error (console.log)', payload: { code: 'console.log("hello")', language: 'Python', persona: 'Startup CTO' } },
  { name: '3. JS Syntax Error (print)', payload: { code: 'print("hello")', language: 'JavaScript', persona: 'Startup CTO' } },
  { name: '4. Insufficient Context (p)', payload: { code: 'p', language: 'Python', persona: 'Startup CTO' } },
  { name: '5. SQL Injection (select)', payload: { code: 'select * from users where id = ' + '+ req.body.id', language: 'SQL', persona: 'Security Expert' } },
  { name: '6. Clean Code Approval (Valid C++)', payload: { code: 'std::cout << "Hello World" << std::endl;', language: 'C++', persona: 'Startup CTO' } }
];

async function runTests() {
  console.log('--- STARTING DUMMY DATA OFFLINE FALLBACK TESTS ---');
  let successCount = 0;
  
  for (const test of tests) {
    try {
      console.log(`\nTesting: ${test.name}`);
      const res = await fetch('http://localhost:3000/api/review/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.payload)
      });
      const data = await res.json();
      
      const issue = data.issues && data.issues.length > 0 ? data.issues[0].title : 'No Issues Found';
      console.log(`- Health Score: ${data.health_score}`);
      console.log(`- Recommendation: ${data.merge_recommendation}`);
      console.log(`- Detected Issue: ${issue}`);
      
      if (test.name.includes('Insufficient') && issue.includes('Insufficient')) successCount++;
      else if (test.name.includes('Clean') && issue === 'No Issues Found') successCount++;
      else if (test.name.includes('Syntax Error') && issue.includes('Syntax Mismatch')) successCount++;
      else if (test.name.includes('SQL Injection') && issue.includes('SQL Injection')) successCount++;
      else {
        console.error(`  [!] UNEXPECTED RESULT FOR ${test.name}`);
        console.log(`  Expected heuristic detection, got: ${issue}`);
      }
    } catch (e) {
      console.error(`Error testing ${test.name}:`, e.message);
    }
  }
  console.log(`\n--- TESTS COMPLETED: ${successCount} / ${tests.length} PASSED ---`);
}

runTests();
