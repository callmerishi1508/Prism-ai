# PRISM AI: Hackathon Pitch & Demo Script

## 1. Core Positioning (For Judges)
**Elevator Pitch:**
"PRISM AI is an autonomous AI engineering teammate that reviews pull requests like a senior engineer. It doesn't just run static analysis—it adopts specific engineering personas to catch zero-day vulnerabilities, optimize algorithmic bottlenecks, and enforce clean architecture before bad code reaches production."

**Key Differentiation:**
- **Not just an "AI code analyzer"**: It’s an *autonomous engineering workflow* tool.
- **Persona-driven**: Reviews adapt to your team's culture (CTO vs Security Expert).
- **Startup Potential**: Developer productivity is a massive market; PRISM saves senior engineering hours.

---

## 2. 3-Minute Demo Script

### [0:00 - 0:30] Problem Statement & Product Intro
*(Show Landing Page Hero Section)*
**Speaker:** 
"Every day, engineering teams waste thousands of hours manually reviewing pull requests. Simple bugs slip through, and zero-day vulnerabilities get pushed to production because reviewers are fatigued. 

Meet PRISM AI. PRISM is your autonomous senior engineering teammate. It reviews pull requests in seconds, providing deep, persona-driven feedback."

*(Click "Launch Dashboard")*

### [0:30 - 1:15] Live Demo: Security Expert
*(On Dashboard. Ensure "Demo Mode" is active. Select "SQL Injection Vulnerability" from the Dropdown).*
**Speaker:**
"Let's look at a common scenario: A junior developer pushes a new API route. 

I'm going to set my AI Reviewer to the **Security Expert** persona. This persona has zero-tolerance for vulnerabilities and prioritizes safety over everything.

I click 'Analyze PR'. Watch how PRISM thinks."

*(Point out the cinematic loading states: "Scanning vulnerabilities...").*
*(When issues stagger in, point to the Critical SQL injection issue).*

**Speaker:**
"Instantly, PRISM catches a raw string concatenation leading to a SQL injection. It flags the deployment risk as Critical, gives the PR a failing health score, and provides the exact safe code to fix it."

### [1:15 - 2:00] Live Demo: Performance Engineer
*(Switch Persona to 'Performance Engineer'. Select "Inefficient Nested Loops" from the Dropdown).*
**Speaker:**
"But PRISM isn't just a security scanner. It understands algorithmic complexity. 

If I switch to the **Performance Engineer** persona and load a different PR, the AI's entire philosophy changes.

*(Click Analyze PR)*
Now, PRISM is looking for latency. It instantly detects an O(N^2) nested loop that would cause severe memory bloat on large datasets, and suggests a Hash Map optimization. Notice how the ambient UI and insights dynamically adapt to the persona."

### [2:00 - 2:40] Auto-Fix & Test Generation (Vision)
*(Hover over the suggested fix in an Issue Card)*
**Speaker:**
"Once PRISM identifies an issue, it provides the drop-in replacement code. In the future, this integrates directly into GitHub to auto-commit fixes and generate missing unit tests, completely autonomously."

### [2:40 - 3:00] Closing Vision
*(Return to Landing Page)*
**Speaker:**
"PRISM AI transforms the pull request from a bottleneck into a superpower. We aren't just building a code analyzer; we are building a venture-backed developer platform that scales engineering teams infinitely. 

Thank you."
