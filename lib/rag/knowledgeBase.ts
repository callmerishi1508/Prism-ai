export interface RagDocument {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
  author: string;
  lastUpdated: string;
}

export const COMPANY_KNOWLEDGE_BASE: RagDocument[] = [
  {
    id: 'SEC-01',
    title: 'Secure Authentication & Password Storage',
    content: 'All passwords must be securely hashed using bcrypt or Argon2 before storage. Plaintext passwords or simple MD5/SHA-1 hashing are strictly prohibited. Always implement rate limiting on authentication endpoints to prevent brute-force attacks. Tokens must be generated securely (e.g., using crypto.randomBytes) and not using Math.random().',
    keywords: ['password', 'auth', 'login', 'token', 'hash', 'bcrypt', 'security', 'session'],
    category: 'Security Policy',
    author: 'InfoSec Team',
    lastUpdated: '2025-11-04'
  },
  {
    id: 'DB-01',
    title: 'Database Query Standards (No SQLi)',
    content: 'Raw string concatenation or interpolation for SQL queries is strictly forbidden due to SQL injection risks. All database queries must use prepared statements or parameterized queries provided by the ORM or database driver. Input validation must be performed on all route parameters and request bodies before touching the database.',
    keywords: ['sql', 'query', 'select', 'database', 'db.execute', 'injection', 'orm', 'mysql', 'postgres'],
    category: 'Architecture Standard',
    author: 'Data Engineering',
    lastUpdated: '2026-01-12'
  },
  {
    id: 'PERF-01',
    title: 'Algorithmic Complexity & Loops',
    content: 'Avoid nested loops (O(N^2) complexity) when iterating over large datasets or payloads. Use Hash Maps (Objects) or Sets to achieve O(1) lookups and optimize array processing. Ensure that filtering and finding unique items are done efficiently without repetitive iterations.',
    keywords: ['loop', 'for', 'while', 'array', 'filter', 'find', 'complexity', 'o(n^2)', 'nested'],
    category: 'Performance Guideline',
    author: 'Core Platform Team',
    lastUpdated: '2025-08-22'
  },
  {
    id: 'PY-01',
    title: 'Python API Guardrails (Pydantic)',
    content: 'All Python API endpoints (especially FastAPI or Flask) accepting JSON payloads MUST use Pydantic models (or equivalent schemas) to validate input types, bounds, and required fields. Directly parsing raw request.json() into variables is a critical security and stability violation.',
    keywords: ['python', 'fastapi', 'request.json', 'pydantic', 'validation', 'schema', 'type', 'def'],
    category: 'Backend Guideline',
    author: 'Backend Guild',
    lastUpdated: '2026-02-10'
  },
  {
    id: 'REACT-01',
    title: 'React Async & State Management',
    content: 'All asynchronous operations inside useEffect hooks must include proper try/catch error handling and cleanup functions to avoid memory leaks. Loading states must be properly handled to prevent null reference errors before data is fetched.',
    keywords: ['react', 'useeffect', 'usestate', 'component', 'mount', 'hook'],
    category: 'Frontend Standard',
    author: 'Frontend Guild',
    lastUpdated: '2025-10-05'
  }
];
