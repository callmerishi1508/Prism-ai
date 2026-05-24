const fs = require('fs');

async function testAPI() {
  console.log("Running PRISM AI Tests...");
  
  const testCases = [
    {
      id: 'sql-injection',
      persona: 'security',
      language: 'javascript',
      code: `function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return db.execute(query);
}
app.get("/user", (req, res) => {
  const id = req.query.id;
  const result = getUserData(id);
  res.send(result);
});`
    },
    {
      id: 'nested-loops',
      persona: 'performance',
      language: 'javascript',
      code: `function findDuplicates(arr) {
  let duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (i !== j && arr[i] === arr[j]) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}`
    },
    {
      id: 'react-memory-leak',
      persona: 'faang',
      language: 'typescript',
      code: `import { useEffect, useState } from "react";
export default function Dashboard() {
  const [data, setData] = useState([]);
  useEffect(() => {
    setInterval(() => {
      fetch("/api/data")
        .then((res) => res.json())
        .then((d) => setData(d));
    }, 1000);
  }, []);
  return <div>{data.length}</div>;
}`
    }
  ];

  for (const tc of testCases) {
    console.log(`\n--- Testing: ${tc.id} (${tc.persona}) ---`);
    try {
      const response = await fetch('http://localhost:3000/api/review/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: tc.code,
          language: tc.language,
          persona: tc.persona,
          isDemoMode: false
        })
      });
      
      const result = await response.json();
      if (result.issues && result.issues.length > 0) {
        console.log(`Detected Issues:`);
        result.issues.forEach(i => console.log(` - [${i.severity}] ${i.title}`));
      } else {
        console.log(`No issues detected (or error):`, result);
      }
    } catch (e) {
      console.error("Test failed:", e.message);
    }
  }
}

testAPI();
