import { classifyCode } from './domainClassifier';
import { retrieveContext } from './retriever';

const TEST_CASES = [
  {
    name: "PyTorch CUDA Memory Leak",
    code: `import torch\n\ndef train_loop(model, data):\n    for batch in data:\n        out = model(batch.cuda())\n        loss = out.sum()\n        loss.backward()`,
    language: "python",
    expectedDomain: "MACHINE_LEARNING",
    forbiddenStandards: ["PY-01", "REACT-01", "DB-01"] // Pydantic, React, SQL
  },
  {
    name: "React Hook Memory Leak",
    code: `import React, { useEffect, useState } from 'react';\n\nexport function Component() {\n  const [data, setData] = useState([]);\n  useEffect(() => {\n    window.addEventListener('scroll', () => setData(old => [...old, window.scrollY]));\n  }, []);\n}`,
    language: "javascript",
    expectedDomain: "FRONTEND_UI",
    forbiddenStandards: ["PY-01", "CPP-01", "SEC-01"]
  },
  {
    name: "SQL Injection with Redis",
    code: `const redis = require('redis');\nfunction getUser(req, res) {\n  const query = "SELECT * FROM users WHERE username = '" + req.body.user + "'";\n  db.execute(query);\n}`,
    language: "javascript",
    expectedDomain: "DATABASE_LAYER",
    forbiddenStandards: ["REACT-01"]
  },
  {
    name: "Dockerfile Misconfig",
    code: `FROM ubuntu:latest\nUSER root\nRUN apt-get update && apt-get install -y curl\nCMD ["bash"]`,
    language: "dockerfile",
    expectedDomain: "DEVOPS_INFRASTRUCTURE",
    forbiddenStandards: ["REACT-01", "PY-01"]
  }
];

export function runAdversarialValidation() {
  let passed = 0;
  let failed = 0;

  console.log("=== RUNNING RAG ADVERSARIAL VALIDATION ===");

  TEST_CASES.forEach(testCase => {
    const classification = classifyCode(testCase.code, testCase.language);
    
    let isSuccess = true;
    const errors: string[] = [];

    if (classification.primaryDomain !== testCase.expectedDomain) {
      isSuccess = false;
      errors.push(`Expected domain ${testCase.expectedDomain}, got ${classification.primaryDomain}`);
    }

    const docs = retrieveContext(testCase.code, testCase.language, 5);
    const retrievedIds = docs.map(d => d.id);

    testCase.forbiddenStandards.forEach(forbidden => {
      if (retrievedIds.includes(forbidden)) {
         isSuccess = false;
         errors.push(`Irrelevant standard injected: ${forbidden}`);
      }
    });

    if (isSuccess) {
      console.log(`[PASS] ${testCase.name} -> Domain: ${classification.primaryDomain}, Docs: ${retrievedIds.join(', ')}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testCase.name} -> ${errors.join(' | ')}`);
      failed++;
    }
  });

  console.log(`=== VALIDATION COMPLETE: ${passed} PASS, ${failed} FAIL ===`);
  return { passed, failed };
}
