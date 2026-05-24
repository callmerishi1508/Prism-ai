import { PersonaId } from './personas';

export interface DemoExample {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  expectedIssues: string[];
  idealPersona: PersonaId;
}

export const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: 'sql-injection',
    title: '1. SQL Injection Vulnerability',
    description: 'A classic SQL injection vulnerability using raw string concatenation.',
    language: 'javascript',
    idealPersona: 'security',
    expectedIssues: ['SQL Injection', 'No Input Validation'],
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
    id: 'xss-vulnerability',
    title: '2. XSS Vulnerability',
    description: 'Reflected XSS via unsanitized DOM insertion.',
    language: 'javascript',
    idealPersona: 'security',
    expectedIssues: ['Reflected XSS', 'Missing Sanitization'],
    code: `app.get("/comment", (req, res) => {
  const comment = req.query.comment;
  res.send(\`<div>\${comment}</div>\`);
});`
  },
  {
    id: 'nested-loops',
    title: '3. Inefficient Nested Loops',
    description: 'An O(n^2) nested loop causing severe performance bottlenecks.',
    language: 'javascript',
    idealPersona: 'performance',
    expectedIssues: ['O(N^2) Complexity', 'Memory Bloat'],
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
    title: '4. React Memory Leak',
    description: 'A React component with unhandled intervals and missing cleanup.',
    language: 'typescript',
    idealPersona: 'faang',
    expectedIssues: ['Missing Cleanup', 'Memory Leak', 'Stale Interval'],
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
  },
  {
    id: 'bad-react-key',
    title: '5. Bad React Key Usage',
    description: 'Using array indices as keys causing reconciliation issues.',
    language: 'tsx',
    idealPersona: 'faang',
    expectedIssues: ['Unstable Key Warning', 'Reconciliation Issue'],
    code: `function UserList({ users }) {
  return (
    <div>
      {users.map((user, index) => (
        <div key={index}>
          {user.name}
        </div>
      ))}
    </div>
  );
}`
  },
  {
    id: 'hardcoded-auth',
    title: '6. Hard-Coded Auth',
    description: 'Authentication logic storing raw passwords in source code.',
    language: 'javascript',
    idealPersona: 'security',
    expectedIssues: ['Hardcoded Credentials', 'Token Exposure'],
    code: `app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    return res.json({
      token: "super-secret-token"
    });
  }

  res.status(401).send("Unauthorized");
});`
  },
  {
    id: 'event-loop-blocking',
    title: '7. Event Loop Blocking',
    description: 'Synchronous heavy computation blocking the Node.js event loop.',
    language: 'javascript',
    idealPersona: 'performance',
    expectedIssues: ['Event Loop Blocking', 'Worker Thread Required'],
    code: `app.get("/report", (req, res) => {
  let total = 0;

  for (let i = 0; i < 1000000000; i++) {
    total += i;
  }

  res.send(total.toString());
});`
  },
  {
    id: 'n-plus-one',
    title: '8. N+1 Database Query',
    description: 'Inefficient database queries executing in a loop.',
    language: 'javascript',
    idealPersona: 'faang',
    expectedIssues: ['N+1 Query Issue', 'Batching Required'],
    code: `app.get("/users", async (req, res) => {
  const users = await db.getUsers();

  for (const user of users) {
    user.posts = await db.getPosts(user.id);
  }

  res.json(users);
});`
  },
  {
    id: 'gpu-memory-leak',
    title: '9. GPU Memory Leak (ML)',
    description: 'PyTorch model allocations running infinitely without cleanup.',
    language: 'python',
    idealPersona: 'performance',
    expectedIssues: ['GPU Memory Exhaustion', 'CUDA Leak'],
    code: `import torch

models = []

while True:
    model = torch.nn.Linear(1000, 1000).cuda()
    models.append(model)`
  },
  {
    id: 'docker-security',
    title: '10. Docker Security Issue',
    description: 'Unoptimized and insecure Dockerfile configuration.',
    language: 'dockerfile',
    idealPersona: 'security',
    expectedIssues: ['Latest Tag Used', 'Unoptimized Layers'],
    code: `FROM ubuntu:latest

RUN apt-get update && apt-get install -y python3

COPY . /app

WORKDIR /app

RUN pip install -r requirements.txt

CMD ["python3", "app.py"]`
  },
  {
    id: 'unsafe-file-upload',
    title: '11. Unsafe File Upload',
    description: 'Path traversal vulnerabilities via unsanitized file uploads.',
    language: 'javascript',
    idealPersona: 'security',
    expectedIssues: ['Path Traversal', 'Missing Validation'],
    code: `app.post("/upload", upload.single("file"), (req, res) => {
  const path = "./uploads/" + req.file.originalname;
  fs.renameSync(req.file.path, path);
  res.send("Uploaded");
});`
  },
  {
    id: 'race-condition',
    title: '12. Race Condition',
    description: 'Asynchronous state mutation allowing double-spending.',
    language: 'javascript',
    idealPersona: 'faang',
    expectedIssues: ['Race Condition', 'Transaction Locking Required'],
    code: `let balance = 1000;

async function withdraw(amount) {
  if (balance >= amount) {
    await processPayment(amount);
    balance -= amount;
  }
}`
  },
  {
    id: 'bad-async-pattern',
    title: '13. Bad Async Pattern',
    description: 'Using async callbacks inside forEach array methods.',
    language: 'javascript',
    idealPersona: 'faang',
    expectedIssues: ['Async forEach Issue', 'Promise.all Required'],
    code: `async function fetchData() {
  const users = await fetchUsers();

  users.forEach(async (user) => {
    await processUser(user);
  });

  console.log("Done");
}`
  },
  {
    id: 'redis-cache-antipattern',
    title: '14. Redis Cache Anti-Pattern',
    description: 'Cache miss bug without writing the data back to the cache.',
    language: 'javascript',
    idealPersona: 'cto',
    expectedIssues: ['Cache Miss Persistence', 'Missing Write-back'],
    code: `async function getUser(id) {
  const cached = await redis.get(id);

  if (cached) {
    return JSON.parse(cached);
  }

  const user = await db.findUser(id);

  return user;
}`
  },
  {
    id: 'clean-code',
    title: '15. Perfect Clean Code Sample',
    description: 'A flawless TypeScript snippet demonstrating production-ready code.',
    language: 'typescript',
    idealPersona: 'cto',
    expectedIssues: ['Clean Code', 'Ready to Merge'],
    code: `interface User {
  id: string;
  name: string;
}

export function getUserName(user: User): string {
  return user.name.trim();
}`
  },
  {
    id: 'huge-code-stress',
    title: '16. Huge Code Stress Test',
    description: 'Testing token guardrails and memory pressure handling.',
    language: 'javascript',
    idealPersona: 'performance',
    expectedIssues: ['Memory Pressure Warning', 'Large Allocation'],
    code: `const massiveArray = [];

for (let i = 0; i < 10000000; i++) {
  massiveArray.push({
    id: i,
    value: Math.random()
  });
}

console.log(massiveArray);`
  },
  {
    id: 'ts-any-abuse',
    title: '17. TypeScript ANY Abuse',
    description: 'Completely bypassing type safety with unsafe any casting.',
    language: 'typescript',
    idealPersona: 'faang',
    expectedIssues: ['Unsafe Any Warning', 'Strict Typing Recommendation'],
    code: `function process(data: any) {
  return data.user.profile.name.toUpperCase();
}`
  },
  {
    id: 'graphql-dos',
    title: '18. GraphQL DoS Risk',
    description: 'Deeply nested GraphQL query risking Denial of Service.',
    language: 'graphql',
    idealPersona: 'security',
    expectedIssues: ['Query Depth Attack', 'Complexity Limiting Required'],
    code: `query {
  users {
    posts {
      comments {
        replies {
          replies {
            replies {
              content
            }
          }
        }
      }
    }
  }
}`
  }
];
