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
    title: 'SQL Injection Vulnerability',
    description: 'A classic SQL injection vulnerability using raw string concatenation.',
    language: 'javascript',
    idealPersona: 'security',
    expectedIssues: ['SQL Injection', 'No Input Validation'],
    code: `// Route to fetch user profile
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // VULNERABILITY: Raw string concatenation allows SQL Injection
    const query = "SELECT * FROM users WHERE id = " + userId;
    
    const db = await getDbConnection();
    const result = await db.execute(query);
    
    // MISSING: Null checks if user doesn't exist
    res.json(result[0]);
  } catch (error) {
    // Poor error handling
    res.status(500).send("Error");
  }
});`
  },
  {
    id: 'nested-loops',
    title: 'Inefficient Nested Loops',
    description: 'An O(n^2) nested loop calculating cross-references, causing severe lag on large datasets.',
    language: 'javascript',
    idealPersona: 'performance',
    expectedIssues: ['O(N^2) Complexity', 'Memory Bloat'],
    code: `function findDuplicateTransactions(transactions) {
  const duplicates = [];
  
  // PERFORMANCE ISSUE: O(N^2) time complexity
  for(let i = 0; i < transactions.length; i++) {
    for(let j = 0; j < transactions.length; j++) {
       // Avoid self-comparison
       if (i !== j) {
         // Comparing objects inefficiently
         if (transactions[i].amount === transactions[j].amount && 
             transactions[i].merchant === transactions[j].merchant) {
            
            // Checking if already added (another O(N) operation)
            if (!duplicates.find(d => d.id === transactions[i].id)) {
              duplicates.push(transactions[i]);
            }
         }
       }
    }
  }
  
  return duplicates;
}`
  },
  {
    id: 'unsafe-auth',
    title: 'Unsafe Authentication',
    description: 'Authentication logic storing raw passwords and lacking rate limiting.',
    language: 'javascript',
    idealPersona: 'faang',
    expectedIssues: ['Plaintext Password', 'No Rate Limiting', 'Timing Attack Vulnerability'],
    code: `async function loginUser(email, password) {
  const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  // VULNERABILITY: Comparing raw passwords instead of hashes
  if (user.password === password) {
    // VULNERABILITY: Generating weak session tokens
    const token = Math.random().toString(36).substring(2);
    
    await db.query('UPDATE users SET last_login = ?, token = ? WHERE id = ?', 
      [new Date(), token, user.id]);
      
    return { success: true, token, user };
  } else {
    // Timing attack risk: early return reveals user exists vs password wrong
    return { success: false, error: 'Incorrect password' };
  }
}`
  },
  {
    id: 'missing-async-error',
    title: 'Missing Async Error Handling',
    description: 'A React component with unhandled promises and potential memory leaks.',
    language: 'typescript',
    idealPersona: 'cto',
    expectedIssues: ['Unhandled Promise Rejection', 'Race Condition', 'Missing Loading State'],
    code: `import { useState, useEffect } from 'react';
import { fetchUserData } from '../api';

export function UserDashboard({ userId }: { userId: string }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // BUG: Missing error handling (try/catch)
    // BUG: Race condition if userId changes quickly
    async function loadData() {
      const result = await fetchUserData(userId);
      setData(result);
    }
    
    loadData();
    
    // BUG: No cleanup function for unmounting
  }, [userId]);

  // BUG: No null check before rendering
  return (
    <div className="dashboard">
      <h1>Welcome {data.name}</h1>
      <p>Your balance is: {data.balance.toFixed(2)}</p>
    </div>
  );
}`
  }
];
