export class AIQuotaError extends Error {
  constructor(message: string = 'AI quota exceeded or service unavailable') {
    super(message);
    this.name = 'AIQuotaError';
  }
}

export class VectorDBError extends Error {
  constructor(message: string = 'Vector Database connection failed') {
    super(message);
    this.name = 'VectorDBError';
  }
}

export class SyntaxValidationError extends Error {
  constructor(message: string = 'Invalid code syntax detected') {
    super(message);
    this.name = 'SyntaxValidationError';
  }
}

export class PromptInjectionError extends Error {
  constructor(message: string = 'Malicious prompt injection detected') {
    super(message);
    this.name = 'PromptInjectionError';
  }
}

export class ArtifactMismatchError extends Error {
  constructor(message: string = 'Artifact type mismatch') {
    super(message);
    this.name = 'ArtifactMismatchError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class OfflineFallbackError extends Error {
  constructor(message: string = 'Activated offline fallback due to critical failure') {
    super(message);
    this.name = 'OfflineFallbackError';
  }
}
