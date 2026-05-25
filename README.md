# PRISM AI
### Enterprise-Grade Code Intelligence & Review Platform

> PRISM AI is an intelligent codebase understanding tool that automates PR reviews, visualizes architectural dependencies, and actively generates self-healing patches using advanced AI engines.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

---

# Overview

PRISM AI bridges the gap between static code analysis and human review by leveraging Gemini-powered AI models and vector embeddings. It proactively intercepts invalid syntax, analyzes Git Patch artifacts intelligently, and repairs malicious or corrupted changes before they merge.

---

# Features

- **Automated Pull Request Reviews**: Direct integration to fetch and analyze raw Git patches.
- **Universal Syntax Guardrails**: Intelligent interceptors that halt LLM hallucinations and invalid code structures before AI analysis.
- **Self-Healing Output Pipeline**: Automatic correction of LLM artifacts to seamlessly convert patch analysis into deployable repaired code.
- **Context-Aware RAG**: High-fidelity retrieval system utilizing Pinecone Vector DB to inform architectural analysis.

---

# Architecture

```text
GitHub / Raw Diff Input
  ↓
Patch Parsing & Categorization
  ↓
Universal Syntax Guardrails (Validation)
  ↓
Gemini AI Engine (Analysis & Repair)
  ↓
Reconstructed Source Output & Telemetry
```

---

# Tech Stack

## Frontend

* Next.js (React)
* TailwindCSS
* Monaco Editor & Framer Motion

## Backend

* Next.js App Router (Serverless APIs)

## AI / Infrastructure

* Google Gemini AI API
* Pinecone Vector Database
* GitHub API Integration

---

# Supported Capabilities

* Semantic Git Patch Parsing & Reconstruction
* Intelligent Error Healing & Fallback Mechanisms
* Comprehensive Code Quality & Security Telemetry
* Interactive Diff Mode with Auto-Language Detection

---

# Installation

```bash
git clone https://github.com/callmerishi1508/Prism-ai.git
cd Prism-ai
npm install
```

---

# Environment Variables

Create a `.env.local` file with the following keys:

```env
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name
GITHUB_TOKEN=your_github_token_optional
```

---

# Run Locally

```bash
npm run dev
```

---

# Production Build

```bash
npm run build
```

---

# Example Workflow

1. Paste a raw Git patch or fetch a Pull Request link.
2. Review the auto-generated PR Health Score and Insights Panel.
3. Click "Generate Fully Repaired File" to instantly heal syntax bugs and architectural flaws.

---

# Security & Stability

* **Strict Diff Sanitization**: Explicit parsing mechanisms to ensure diff artifacts (`---`, `@@`) never leak into deployable source code.
* **Deterministic Syntax Validation**: Brace-matching safety bounds protect against LLM structural breakdown.
* **Fallback Engines**: Degrades gracefully to heuristic engines and mock responses if API bounds or limits are exceeded.

---

# Testing

```bash
npm run test
```

---

# Roadmap

## V1 (Current)

* Semantic Git Patch Parsing & Reconstruction Engine
* Universal Syntax Guardrails & Line Number Error Mapping
* Self-Healing Code Repair Pipeline
* Context-Aware RAG Architecture using Pinecone
* Interactive Monaco Editor with Custom Patch Diff Tokenization
* Code Quality, Security Telemetry, and PR Health Scoring
* Dark-themed, responsive Dashboard UI with Framer Motion animations

## V2 (Planned)

* Direct GitHub OAuth Integration for one-click PR fetching
* Native CI/CD Pipeline integrations (GitHub Actions / GitLab CI)
* Expanded syntax validation for non-C-style languages
* Webhooks for real-time pull request monitoring

## V3 (Future Vision)

* Automated large-scale codebase refactoring agents
* Multi-file contextual repair coordination
* Native IDE Extensions (VS Code, JetBrains)

---

# Contributing

1. Fork the repository
2. Create a Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



# Author

**Rishi**
Building next-generation developer tooling.

---

# Acknowledgements

* Google Gemini Team
* Monaco Editor
* Next.js ecosystem
