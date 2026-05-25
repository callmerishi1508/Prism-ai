export type EngineeringDomain = 
  | 'MACHINE_LEARNING'
  | 'BACKEND_API'
  | 'FRONTEND_UI'
  | 'SYSTEMS_PROGRAMMING'
  | 'DATABASE_LAYER'
  | 'DEVOPS_INFRASTRUCTURE'
  | 'SECURITY_ENGINEERING'
  | 'DISTRIBUTED_SYSTEMS'
  | 'MOBILE'
  | 'DATA_ENGINEERING'
  | 'CONFIGURATION'
  | 'MARKUP'
  | 'DOCUMENTATION'
  | 'UNKNOWN';

export interface DomainScore {
  domain: EngineeringDomain;
  confidence: number;
}

export interface ExecutionContext {
  runtime: string | null;
  environment: string | null;
}

export interface ClassificationResult {
  domains: DomainScore[];
  primaryDomain: EngineeringDomain;
  secondaryDomains: EngineeringDomain[];
  framework: string | null;
  executionContext: ExecutionContext;
  blockedDomains: EngineeringDomain[];
}

const FORBIDDEN_DOMAIN_PAIRS: Record<EngineeringDomain, EngineeringDomain[]> = {
  MACHINE_LEARNING: ['FRONTEND_UI', 'MARKUP'],
  FRONTEND_UI: ['MACHINE_LEARNING', 'SYSTEMS_PROGRAMMING', 'DATABASE_LAYER'],
  BACKEND_API: ['MARKUP'],
  SYSTEMS_PROGRAMMING: ['FRONTEND_UI', 'MARKUP'],
  DATABASE_LAYER: ['FRONTEND_UI'],
  DEVOPS_INFRASTRUCTURE: ['FRONTEND_UI'],
  SECURITY_ENGINEERING: [],
  DISTRIBUTED_SYSTEMS: ['MARKUP'],
  MOBILE: ['MACHINE_LEARNING'],
  DATA_ENGINEERING: ['FRONTEND_UI'],
  CONFIGURATION: [],
  MARKUP: ['MACHINE_LEARNING', 'SYSTEMS_PROGRAMMING', 'BACKEND_API', 'DATABASE_LAYER', 'DISTRIBUTED_SYSTEMS'],
  DOCUMENTATION: [],
  UNKNOWN: []
};

export function classifyCode(code: string, language: string, embeddedDSLs: {type: string, confidence: number}[] = []): ClassificationResult {
  // Strip comments to prevent spoofing
  const codeWithoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, '') // multi-line JS/CSS/C++
    .replace(/\/\/.*/g, '')           // single-line JS/C++
    .replace(/#.*/g, '')              // Python/Ruby/Shell/Dockerfile
    .replace(/<!--[\s\S]*?-->/g, '')  // HTML/XML
    .replace(/--.*/g, '');            // SQL/Lua

  const lowerCode = codeWithoutComments.toLowerCase();
  const domains: DomainScore[] = [];
  const secondaryDomains: EngineeringDomain[] = [];
  
  // Map Embedded DSLs to Secondary Domains
  embeddedDSLs.forEach(dsl => {
    if (dsl.type === 'sql') {
      if (!secondaryDomains.includes('DATABASE_LAYER')) secondaryDomains.push('DATABASE_LAYER');
      if (!secondaryDomains.includes('SECURITY_ENGINEERING')) secondaryDomains.push('SECURITY_ENGINEERING');
    }
    if (dsl.type === 'graphql') if (!secondaryDomains.includes('BACKEND_API')) secondaryDomains.push('BACKEND_API');
    if (dsl.type === 'jsx') if (!secondaryDomains.includes('FRONTEND_UI')) secondaryDomains.push('FRONTEND_UI');
    if (dsl.type === 'cuda') if (!secondaryDomains.includes('MACHINE_LEARNING')) secondaryDomains.push('MACHINE_LEARNING');
    if (dsl.type === 'bash') if (!secondaryDomains.includes('DEVOPS_INFRASTRUCTURE')) secondaryDomains.push('DEVOPS_INFRASTRUCTURE');
    if (dsl.type === 'yaml') if (!secondaryDomains.includes('CONFIGURATION')) secondaryDomains.push('CONFIGURATION');
  });

  const detectedFrameworks = [];
  let runtime: string | null = null;
  let environment: string | null = null;

  // 1. Framework & Runtime Detection (Independent, not else if)
  if (lowerCode.includes('pytorch') || lowerCode.includes('import torch')) {
    detectedFrameworks.push('pytorch');
    if (!runtime) runtime = lowerCode.includes('cuda') ? 'cuda' : 'python_runtime';
    if (!environment) environment = 'gpu_training_loop';
  }
  if (lowerCode.includes('tensorflow') || lowerCode.includes('import tensorflow')) {
    detectedFrameworks.push('tensorflow');
    if (!runtime) runtime = lowerCode.includes('cuda') ? 'cuda' : 'python_runtime';
    if (!environment) environment = 'gpu_training_loop';
  }
  if (lowerCode.includes('react') || lowerCode.includes('useeffect') || lowerCode.includes('usestate')) {
    detectedFrameworks.push('react');
    if (!runtime) runtime = 'browser';
    if (!environment) environment = 'client_side';
  }
  if (lowerCode.includes('next.js') || lowerCode.includes('use client') || lowerCode.includes('getserversideprops')) {
    detectedFrameworks.push('nextjs');
    if (!runtime) runtime = 'node_browser_hybrid';
    if (!environment) environment = 'ssr_environment';
  }
  if (lowerCode.includes('fastapi') || lowerCode.includes('from fastapi')) {
    detectedFrameworks.push('fastapi');
    if (!runtime) runtime = 'uvicorn_asgi';
    if (!environment) environment = 'serverless_or_container';
  }
  if (lowerCode.includes('django')) {
    detectedFrameworks.push('django');
    if (!runtime) runtime = 'wsgi';
    if (!environment) environment = 'server_side';
  }
  if (lowerCode.includes('express') || lowerCode.includes('app.get(')) {
    detectedFrameworks.push('express');
    if (!runtime) runtime = 'node';
    if (!environment) environment = 'server_side';
  }
  if (lowerCode.includes('spring') || lowerCode.includes('@restcontroller')) {
    detectedFrameworks.push('spring');
    if (!runtime) runtime = 'jvm';
    if (!environment) environment = 'server_side';
  }
  if (language === 'rust' && (lowerCode.includes('tokio') || lowerCode.includes('async'))) {
    detectedFrameworks.push('tokio');
    if (!runtime) runtime = 'rust_async';
    if (!environment) environment = 'systems_level';
  }
  if (lowerCode.includes('dockerfile') || (lowerCode.includes('from ') && language === 'dockerfile') || lowerCode.includes('cmd [')) {
    detectedFrameworks.push('docker');
    if (!runtime) runtime = 'container_engine';
    if (!environment) environment = 'ci_cd_or_host';
  }
  if (lowerCode.includes('kubernetes') || lowerCode.includes('apiversion: v1') || lowerCode.includes('kind: pod')) {
    detectedFrameworks.push('kubernetes');
    if (!runtime) runtime = 'k8s_cluster';
    if (!environment) environment = 'orchestration';
  }
  if (lowerCode.includes('graphql')) {
    detectedFrameworks.push('graphql');
    if (!runtime) runtime = 'api_layer';
  }
  if (lowerCode.includes('redis')) {
    detectedFrameworks.push('redis');
    if (!runtime) runtime = 'in_memory_store';
  }

  const primaryFramework = detectedFrameworks.length > 0 ? detectedFrameworks[0] : null;

  // 2. Domain Scoring
  let mlScore = 0;
  let backendScore = 0;
  let frontendScore = 0;
  let systemsScore = 0;
  let dbScore = 0;
  let devopsScore = 0;
  let securityScore = 0;
  
  if (detectedFrameworks.includes('pytorch') || detectedFrameworks.includes('tensorflow') || lowerCode.includes('cuda') || lowerCode.includes('tensor')) mlScore += 0.9;
  if (detectedFrameworks.includes('react') || detectedFrameworks.includes('nextjs') || language === 'html' || language === 'css') frontendScore += 0.9;
  if (detectedFrameworks.includes('fastapi') || detectedFrameworks.includes('django') || detectedFrameworks.includes('express') || detectedFrameworks.includes('spring') || lowerCode.includes('@app.route') || lowerCode.includes('@app.post') || lowerCode.includes('request.json')) backendScore += 0.85;
  if (language === 'c' || language === 'cpp' || language === 'rust' || lowerCode.includes('malloc') || lowerCode.includes('pointer')) systemsScore += 0.8;
  if (language === 'sql' || lowerCode.includes('select ') || lowerCode.includes('db.execute') || detectedFrameworks.includes('redis')) dbScore += 0.85;
  if (language === 'dockerfile' || language === 'yaml' || detectedFrameworks.includes('docker') || detectedFrameworks.includes('kubernetes')) devopsScore += 0.9;
  if (lowerCode.includes('password') || lowerCode.includes('jwt') || lowerCode.includes('auth') || lowerCode.includes('encrypt') || lowerCode.includes('hash')) securityScore += 0.6;
  
  // Normalize and push
  if (mlScore > 0) domains.push({ domain: 'MACHINE_LEARNING', confidence: Math.min(mlScore, 1.0) });
  if (backendScore > 0) domains.push({ domain: 'BACKEND_API', confidence: Math.min(backendScore, 1.0) });
  if (frontendScore > 0) domains.push({ domain: 'FRONTEND_UI', confidence: Math.min(frontendScore, 1.0) });
  if (systemsScore > 0) domains.push({ domain: 'SYSTEMS_PROGRAMMING', confidence: Math.min(systemsScore, 1.0) });
  if (dbScore > 0) domains.push({ domain: 'DATABASE_LAYER', confidence: Math.min(dbScore, 1.0) });
  if (devopsScore > 0) domains.push({ domain: 'DEVOPS_INFRASTRUCTURE', confidence: Math.min(devopsScore, 1.0) });
  if (securityScore > 0) domains.push({ domain: 'SECURITY_ENGINEERING', confidence: Math.min(securityScore, 1.0) });
  
  if (domains.length === 0) {
    if (language === 'markdown' || language === 'txt') {
      domains.push({ domain: 'DOCUMENTATION', confidence: 0.9 });
    } else if (language === 'json' || language === 'xml') {
      domains.push({ domain: 'CONFIGURATION', confidence: 0.8 });
    } else {
      domains.push({ domain: 'UNKNOWN', confidence: 1.0 });
    }
  }

  // Sort by confidence desc
  domains.sort((a, b) => b.confidence - a.confidence);

  const primaryDomain = domains[0].domain;
  const blockedDomains = FORBIDDEN_DOMAIN_PAIRS[primaryDomain] || [];

  // Remove primary domain from secondary domains to prevent overlap
  const finalSecondaryDomains = secondaryDomains.filter(d => d !== primaryDomain);

  return {
    domains,
    primaryDomain,
    secondaryDomains: finalSecondaryDomains,
    framework: primaryFramework,
    executionContext: {
      runtime,
      environment
    },
    blockedDomains
  };
}
