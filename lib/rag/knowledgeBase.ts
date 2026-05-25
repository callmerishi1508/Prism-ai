export interface RagDocument {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
  author: string;
  lastUpdated: string;
  intentTags: string[];
  metadata?: any;
}

export const COMPANY_KNOWLEDGE_BASE: RagDocument[] = [
  {
    id: 'SEC-01',
    title: 'Secure Authentication & Password Storage',
    content: 'All passwords must be securely hashed using bcrypt or Argon2 before storage. Plaintext passwords or simple MD5/SHA-1 hashing are strictly prohibited. Always implement rate limiting on authentication endpoints to prevent brute-force attacks. Tokens must be generated securely (e.g., using crypto.randomBytes) and not using Math.random().',
    keywords: ['password', 'auth', 'login', 'token', 'hash', 'bcrypt', 'security', 'session'],
    category: 'Security Policy',
    author: 'InfoSec Team',
    lastUpdated: '2025-11-04',
    intentTags: ['AUTH_BYPASS', 'SQL_INJECTION'],
    metadata: { domain: 'SECURITY_ENGINEERING' }
  },
  {
    id: 'DB-01',
    title: 'Database Query Standards (No SQLi)',
    content: 'Raw string concatenation or interpolation for SQL queries is strictly forbidden due to SQL injection risks. All database queries must use prepared statements or parameterized queries provided by the ORM or database driver. Input validation must be performed on all route parameters and request bodies before touching the database.',
    keywords: ['sql', 'query', 'select', 'database', 'db.execute', 'injection', 'orm', 'mysql', 'postgres'],
    category: 'Architecture Standard',
    author: 'Data Engineering',
    lastUpdated: '2026-01-12',
    intentTags: ['SQL_INJECTION'],
    metadata: { domain: 'DATABASE_LAYER' }
  },
  {
    id: 'DB-PERF-01',
    title: 'N+1 Query Prevention',
    content: 'Never execute database queries inside a loop (e.g., map, forEach, while). This creates an N+1 query bottleneck that severely degrades performance and database connection pools. Always use batch loading (e.g., DataLoader) or write a single SQL query using the IN operator to fetch associated records in one round trip.',
    keywords: ['loop', 'query', 'n+1', 'batch', 'dataloader', 'performance', 'database', 'select in'],
    category: 'Performance Guideline',
    author: 'Data Engineering',
    lastUpdated: '2026-03-10',
    intentTags: ['N_PLUS_ONE', 'OVERFETCHING'],
    metadata: { domain: 'DATABASE_LAYER' }
  },
  {
    id: 'PERF-01',
    title: 'Algorithmic Complexity & Loops',
    content: 'Avoid nested loops (O(N^2) complexity) when iterating over large datasets or payloads. Use Hash Maps (Objects) or Sets to achieve O(1) lookups and optimize array processing. Ensure that filtering and finding unique items are done efficiently without repetitive iterations.',
    keywords: ['loop', 'for', 'while', 'array', 'filter', 'find', 'complexity', 'o(n^2)', 'nested'],
    category: 'Performance Guideline',
    author: 'Core Platform Team',
    lastUpdated: '2025-08-22',
    intentTags: ['UNBOUNDED_LOOP'],
    metadata: { domain: 'SYSTEMS_PROGRAMMING' }
  },
  {
    id: 'PY-01',
    title: 'Python API Guardrails (Pydantic)',
    content: 'All Python API endpoints (especially FastAPI or Flask) accepting JSON payloads MUST use Pydantic models (or equivalent schemas) to validate input types, bounds, and required fields. Directly parsing raw request.json() into variables is a critical security and stability violation.',
    keywords: ['python', 'fastapi', 'request.json', 'pydantic', 'validation', 'schema', 'type', 'def'],
    category: 'Backend Guideline',
    author: 'Backend Guild',
    lastUpdated: '2026-02-10',
    intentTags: ['MISSING_VALIDATION'],
    metadata: { domain: 'BACKEND_API', framework: 'fastapi' }
  },
  {
    id: 'CPP-01',
    title: 'C++ Memory Safety & IO',
    content: 'Avoid raw pointers and manual memory management (new/delete). Use smart pointers (std::unique_ptr, std::shared_ptr) to prevent memory leaks. Do not use std::endl in tight loops as it flushes the buffer unnecessarily; use \\n instead.',
    keywords: ['c++', 'cpp', 'pointer', 'memory', 'leak', 'new', 'delete', 'std::endl', 'std::cout'],
    category: 'Systems Guideline',
    author: 'C++ Working Group',
    lastUpdated: '2025-09-15',
    intentTags: ['MEMORY_LEAK', 'RESOURCE_LEAK'],
    metadata: { domain: 'SYSTEMS_PROGRAMMING' }
  },
  {
    id: 'REACT-01',
    title: 'React Effects & State Integrity',
    content: 'Never mutate state directly. Always use the setter function provided by useState. When using useEffect, ensure all dependencies are correctly listed in the dependency array to prevent stale closures. Cleanup functions must be returned if the effect subscribes to external events or sets up intervals.',
    keywords: ['react', 'useeffect', 'usestate', 'state', 'hook', 'dependency', 'mutate'],
    category: 'Frontend Guideline',
    author: 'Frontend Core',
    lastUpdated: '2026-03-01',
    intentTags: ['INEFFICIENT_RENDER'],
    metadata: { domain: 'FRONTEND_UI', framework: 'react' }
  }
];
