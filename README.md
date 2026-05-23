<div align="center">
  <img src="https://via.placeholder.com/150/000000/FFFFFF?text=PRISM+AI" alt="PRISM AI Logo" width="120" />
  
  <h1 align="center">PRISM AI</h1>
  <p align="center"><strong>Your Autonomous Senior Engineering Teammate</strong></p>
  
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#personas">AI Personas</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#architecture">Architecture</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Gemini_1.5_Pro-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  </p>
</div>

<br />

> **Hackathon Winner Edition**: Built to instantly analyze pull requests, detect zero-day vulnerabilities, optimize algorithmic performance, and enforce architectural excellence.

![PRISM AI Dashboard Placeholder](https://via.placeholder.com/1200x600/0a0a0a/38bdf8?text=PRISM+AI+Dashboard+-+Cinematic+AI+Code+Review)

## 🚀 Features

* **Instant Code Analysis**: Paste your PR code and receive deep, actionable insights in seconds.
* **Zero-Day Prevention**: Aggressively scans for SQL injections, XSS, exposed secrets, and unhandled logic flaws.
* **Millisecond Optimization**: Detects O(n^2) complexity, memory bloat, and rendering bottlenecks.
* **Cinematic Reveal Animations**: Watch the AI "think" and simulate deep reasoning as it reveals issues.
* **Realistic Risk Metrics**: Instantly see your PR's deployment risk, health score, and merge confidence.

## 🎭 Dynamic AI Personas

Don't settle for generic feedback. Switch between 4 distinct reviewer personalities, each with their own system prompt, engineering philosophy, and unique UI theme:

1. 🚀 **Startup CTO** (Purple Theme): Focuses on shipping speed, maintainability, and business velocity. Avoids over-engineering.
2. 🛡️ **Security Expert** (Red Theme): Highly cautious, zero-tolerance for vulnerabilities. Prioritizes safety over convenience.
3. ⚡ **Performance Engineer** (Cyan Theme): Highly technical, targets algorithmic complexity, memory efficiency, and latency.
4. 💼 **FAANG Reviewer** (Amber Theme): Staff-level expectations. Enforces clean architecture, SOLID principles, and extreme clarity.

## 🛠️ Architecture

* **Frontend**: Next.js 16 (App Router), React 18, Tailwind CSS, Framer Motion
* **Editor**: `@monaco-editor/react` for intelligent, language-aware code editing
* **Backend**: Next.js API Routes (Serverless)
* **AI Engine**: Google Gemini 1.5 Pro (via OpenRouter integration)

## 💻 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/callmerishi1508/Prism-ai.git
cd Prism-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file and add your AI provider API key:
```env
GEMINI_API_KEY=your_api_key_here
```
*(Note: For hackathon demos, you can toggle **Demo Mode** in the dashboard to bypass API requirements and test the UI using curated mock data).*

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎬 Demo Guide (For Judges)

1. Launch the app and click **Try Demo Mode** on the landing page.
2. In the Dashboard header, ensure the **Demo Mode** toggle is active.
3. Use the **"Load Demo PR"** dropdown to select a curated scenario (e.g., *SQL Injection Vulnerability*).
4. Select the **Security Expert** persona.
5. Click **Analyze PR** and watch the cinematic staggered reveal animations as PRISM AI discovers the vulnerability.
6. Try switching to the **Performance Engineer** persona and load the *Inefficient Nested Loops* example for a totally different engineering perspective.

## 🔮 Roadmap

- [ ] GitHub App Integration for automated CI/CD PR reviews
- [ ] VS Code Extension
- [ ] Multi-file architecture analysis
- [ ] Auto-commit generated fixes

---

<div align="center">
  <p>Built for the AI Builders Hackathon 2026</p>
</div>
