/**
 * Structured logger for TWN server-side operations.
 *
 * Rules:
 * - Never log secrets, tokens, passwords, or full draft content.
 * - Use correlation IDs for traceability across a request lifecycle.
 * - Distinguish operational logs (why did this fail?) from audit logs (who changed what?).
 *
 * Usage:
 *   logger.info("article.published", { articleId, actorId });
 *   logger.error("cloudinary.upload.failed", { correlationId }, err);
 */

import { classifyError } from "./errors";
import { getCorrelationId } from "./correlation";
import { redactObject } from "./redact";

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  event: string;
  correlationId: string;
  timestamp: string;
  module?: string;
  meta?: unknown;
  error?: { type: string; message: string };
}

function emit(entry: LogEntry): void {
  const line = JSON.stringify(entry);
  if (entry.level === "error") {
    console.error(line);
  } else if (entry.level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

function buildEntry(
  level: LogLevel,
  event: string,
  meta?: Record<string, unknown>,
  err?: unknown,
  module?: string
): LogEntry {
  return {
    level,
    event,
    correlationId: getCorrelationId(),
    timestamp: new Date().toISOString(),
    module,
    meta: meta ? redactObject(meta) : undefined,
    error: err !== undefined ? classifyError(err) : undefined,
  };
}

export const logger = {
  info(event: string, meta?: Record<string, unknown>, module?: string): void {
    emit(buildEntry("info", event, meta, undefined, module));
  },
  warn(event: string, meta?: Record<string, unknown>, module?: string): void {
    emit(buildEntry("warn", event, meta, undefined, module));
  },
  error(event: string, err?: unknown, meta?: Record<string, unknown>, module?: string): void {
    emit(buildEntry("error", event, meta, err, module));
  },
};
