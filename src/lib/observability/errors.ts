export class BusinessRuleError extends Error {
  constructor(message: string, public readonly code = "BUSINESS_RULE_VIOLATION") {
    super(message);
    this.name = "BusinessRuleError";
  }
}

export class InfrastructureError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = "InfrastructureError";
  }
}

export function classifyError(err: unknown): { type: string; message: string } {
  if (err instanceof BusinessRuleError) {
    return { type: "BUSINESS", message: err.message };
  }
  if (err instanceof InfrastructureError) {
    return { type: "INFRASTRUCTURE", message: err.message };
  }
  if (err instanceof Error) {
    return { type: "SYSTEM", message: err.message };
  }
  return { type: "UNKNOWN", message: String(err) };
}
