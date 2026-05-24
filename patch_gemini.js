const fs = require('fs');

const file = 'c:\\AI Hackathon for Builders\\prism-ai\\lib\\GeminiService.ts';
let content = fs.readFileSync(file, 'utf8');

const newBlocks = `
    if (matchedDemo?.id === 'bad-react-key') {
      return {
        issues: [
          { title: 'Unstable React Key Usage', severity: 'Medium', line: 4, explanation: 'Using array indices as keys leads to unpredictable component state and severe reconciliation bugs if the list is mutated.', suggested_fix: '<div key={user.id}>', confidence: 0.95 }
        ],
        health_score: 55,
        merge_recommendation: 'Needs Changes',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: getDoc('REACT-01') || fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'react-memory-leak') {
      return {
        issues: [
          { title: 'Missing Cleanup / Memory Leak', severity: 'High', line: 7, explanation: 'Setting an interval inside useEffect without returning a cleanup function will cause stale closures and massive memory leaks on unmount.', suggested_fix: 'const id = setInterval(...); return () => clearInterval(id);', confidence: 0.98 }
        ],
        health_score: 40,
        merge_recommendation: 'High Risk',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: getDoc('REACT-01') || fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'hardcoded-auth') {
      return {
        issues: [
          { title: 'Hardcoded Credentials', severity: 'Critical', line: 4, explanation: 'Storing raw passwords and admin credentials directly in the source code is a catastrophic security violation.', suggested_fix: 'Validate against a hashed database password using bcrypt.', confidence: 1.0 },
          { title: 'Token Exposure', severity: 'Critical', line: 6, explanation: 'Returning a hardcoded, static super-secret-token provides zero cryptographic security.', suggested_fix: 'Generate a dynamic JWT via a secure secret manager.', confidence: 1.0 }
        ],
        health_score: 0,
        merge_recommendation: 'Do Not Deploy',
        confidenceMetrics: { ...defaultConfidence, manual_review_recommended: true },
        promptVersion: 'v2.0',
        ragContext: getDoc('SEC-01') || fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'event-loop-blocking') {
      return {
        issues: [
          { title: 'Event Loop Blocking', severity: 'Critical', line: 4, explanation: 'A synchronous billion-iteration loop will completely block the Node.js event loop, preventing all other requests from being processed.', suggested_fix: 'Offload heavy computation to a worker_thread or chunk the processing.', confidence: 0.98 }
        ],
        health_score: 20,
        merge_recommendation: 'High Risk',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: getDoc('PERF-01') || fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'n-plus-one') {
      return {
        issues: [
          { title: 'N+1 Query Issue', severity: 'High', line: 4, explanation: 'Querying posts inside a loop creates an N+1 query bottleneck. If there are 1000 users, this executes 1001 sequential database queries.', suggested_fix: 'Use a batch query or a DataLoader to fetch all posts in a single round trip.', confidence: 0.95 }
        ],
        health_score: 50,
        merge_recommendation: 'Needs Changes',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: getDoc('DB-01') || fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'gpu-memory-leak') {
      return {
        issues: [
          { title: 'GPU Memory Exhaustion (CUDA Leak)', severity: 'Critical', line: 6, explanation: 'Continuously allocating CUDA tensors inside an infinite loop without detaching or garbage collecting will crash the GPU instantly (OOM).', suggested_fix: 'model.cpu().detach() or carefully manage tensor references.', confidence: 0.99 }
        ],
        health_score: 10,
        merge_recommendation: 'High Risk',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'docker-security') {
      return {
        issues: [
          { title: 'Latest Tag Used', severity: 'Medium', line: 1, explanation: 'Using the ubuntu:latest tag breaks deterministic builds and risks pulling breaking changes.', suggested_fix: 'Pin to a specific SHA or version (e.g. ubuntu:22.04).', confidence: 0.90 },
          { title: 'Unoptimized Layers', severity: 'Low', line: 3, explanation: 'apt-get install without cleaning up apt lists bloats the final image size.', suggested_fix: 'RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*', confidence: 0.85 }
        ],
        health_score: 70,
        merge_recommendation: 'Needs Changes',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'unsafe-file-upload') {
      return {
        issues: [
          { title: 'Path Traversal', severity: 'Critical', line: 2, explanation: 'Directly concatenating req.file.originalname allows an attacker to upload files to arbitrary server paths (e.g., ../../../etc/passwd).', suggested_fix: 'Use path.basename() and generate a secure random filename.', confidence: 1.0 },
          { title: 'Missing Validation', severity: 'High', line: 1, explanation: 'Accepting any file upload without checking mime-types or extensions allows malware execution.', suggested_fix: 'Validate mime-types and enforce file size limits in multer.', confidence: 0.95 }
        ],
        health_score: 15,
        merge_recommendation: 'Do Not Deploy',
        confidenceMetrics: { ...defaultConfidence, manual_review_recommended: true },
        promptVersion: 'v2.0',
        ragContext: getDoc('SEC-01') || fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'race-condition') {
      return {
        issues: [
          { title: 'Race Condition (Double Spend)', severity: 'Critical', line: 4, explanation: 'Asynchronous state mutation without transaction locking allows concurrent requests to process multiple withdrawals before the balance updates.', suggested_fix: 'Implement a distributed lock, Redis Mutex, or database-level row locking.', confidence: 0.98 }
        ],
        health_score: 25,
        merge_recommendation: 'High Risk',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'bad-async-pattern') {
      return {
        issues: [
          { title: 'Async forEach Issue', severity: 'High', line: 4, explanation: 'Array.forEach does not await asynchronous callbacks. The function will print "Done" immediately and process users concurrently in a detached manner.', suggested_fix: 'Use a for...of loop or await Promise.all(users.map(...)).', confidence: 0.95 }
        ],
        health_score: 60,
        merge_recommendation: 'Needs Changes',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'redis-cache-antipattern') {
      return {
        issues: [
          { title: 'Cache Miss Persistence Issue', severity: 'High', line: 10, explanation: 'If a cache miss occurs, the data is fetched from the database but NEVER written back to Redis. Every subsequent request will also miss the cache.', suggested_fix: 'await redis.set(id, JSON.stringify(user)); before returning.', confidence: 0.96 }
        ],
        health_score: 55,
        merge_recommendation: 'Needs Changes',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: getDoc('PERF-01') || fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'clean-code') {
      return {
        issues: [],
        health_score: 100,
        merge_recommendation: 'Safe to Merge',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'huge-code-stress') {
      return {
        issues: [
          { title: 'Memory Pressure / Large Allocation', severity: 'High', line: 3, explanation: 'Allocating 10 million large objects simultaneously will crash the V8 heap (OOM) or trigger aggressive GC pauses.', suggested_fix: 'Use Node streams, chunk the allocation, or write directly to a file.', confidence: 0.92 }
        ],
        health_score: 45,
        merge_recommendation: 'Needs Changes',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: getDoc('PERF-01') || fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'ts-any-abuse') {
      return {
        issues: [
          { title: 'Unsafe Any Casting', severity: 'Medium', line: 1, explanation: 'Bypassing the TypeScript compiler with \\'any\\' defeats the purpose of strong typing and guarantees runtime errors if the shape changes.', suggested_fix: 'Define an explicit interface for the data payload.', confidence: 0.85 }
        ],
        health_score: 75,
        merge_recommendation: 'Needs Changes',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'graphql-dos') {
      return {
        issues: [
          { title: 'Query Depth Attack (DoS)', severity: 'Critical', line: 1, explanation: 'Deeply nested GraphQL queries allow an attacker to easily exhaust server resources and take down the database through excessive joins.', suggested_fix: 'Implement GraphQL query depth limiting middleware (e.g., max depth of 5).', confidence: 0.97 }
        ],
        health_score: 10,
        merge_recommendation: 'High Risk',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: getDoc('SEC-01') || fallbackRagContext
      };
    }
    if (matchedDemo?.id === 'xss-vulnerability') {
      return {
        issues: [
          { title: 'Reflected XSS', severity: 'Critical', line: 3, explanation: 'Directly interpolating user input into an HTML string enables Cross-Site Scripting (XSS).', suggested_fix: 'Sanitize the payload using DOMPurify before rendering.', confidence: 1.0 }
        ],
        health_score: 30,
        merge_recommendation: 'Do Not Deploy',
        confidenceMetrics: defaultConfidence,
        promptVersion: 'v2.0',
        ragContext: getDoc('SEC-01') || fallbackRagContext
      };
    }
`;

content = content.replace('    // Fallback Mock for everything else', newBlocks + '\n    // Fallback Mock for everything else');
fs.writeFileSync(file, content);
console.log("Successfully patched GeminiService.ts");
