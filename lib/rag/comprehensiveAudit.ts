import { classifyCode } from './domainClassifier';
import { retrieveContext } from './retriever';

const TEST_CASES = [
  // Phase 1: Hybrid Domain Collision
  {
    name: "FastAPI + PyTorch inference server",
    code: `from fastapi import FastAPI\nimport torch\napp = FastAPI()\n@app.post("/infer")\ndef infer(data: dict):\n  tensor = torch.tensor(data['val']).cuda()\n  return {"res": tensor.tolist()}`,
    language: "python"
  },
  {
    name: "React frontend with WebSocket backend hooks",
    code: `import { useEffect, useState } from 'react';\nimport { io } from 'socket.io-client';\n\nexport function Realtime() {\n  useEffect(() => {\n    const s = io('http://api');\n    s.on('msg', console.log);\n  }, []);\n}`,
    language: "javascript"
  },
  {
    name: "Kubernetes YAML + Helm + Bash",
    code: `apiVersion: v1\nkind: Pod\nspec:\n  containers:\n  - name: bash\n    command: ["/bin/bash", "-c", "echo hello"]`,
    language: "yaml"
  },
  // Phase 3: Framework Spoofing
  {
    name: "Spoofed PyTorch in CRUD",
    code: `import torch # unused\nfrom flask import Flask, request\napp = Flask(__name__)\n@app.route('/users')\ndef users():\n  return db.execute("SELECT * FROM users")`,
    language: "python"
  },
  {
    name: "React comments in Dockerfile",
    code: `FROM node:18\n# useEffect(() => {}, [])\nRUN npm install\nCMD ["npm", "start"]`,
    language: "dockerfile"
  }
];

export function runComprehensiveAudit() {
  console.log("=== COMPREHENSIVE RAG AUDIT ===");
  TEST_CASES.forEach(tc => {
    const classif = classifyCode(tc.code, tc.language);
    console.log(`\n[CASE] ${tc.name}`);
    console.log(`  -> Primary: ${classif.primaryDomain}`);
    console.log(`  -> Domains: ${JSON.stringify(classif.domains)}`);
    console.log(`  -> Framework: ${classif.framework}`);
    console.log(`  -> Blocked: ${classif.blockedDomains.join(', ')}`);
    
    const docs = retrieveContext(tc.code, tc.language, 5);
    console.log(`  -> Docs Retrieved: ${docs.map(d => d.id).join(', ')}`);
  });
}
