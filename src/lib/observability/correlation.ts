import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export interface OperationContext {
  correlationId: string;
  actorId?: string;
  module?: string;
  operationName?: string;
}

export const contextStorage = new AsyncLocalStorage<OperationContext>();

export function getCorrelationId(): string {
  const store = contextStorage.getStore();
  return store?.correlationId ?? "no-context";
}

export function runWithContext<T>(
  context: Partial<OperationContext>,
  fn: () => Promise<T> | T
): Promise<T> | T {
  const parentStore = contextStorage.getStore();
  const mergedContext: OperationContext = {
    correlationId: context.correlationId ?? parentStore?.correlationId ?? randomUUID(),
    actorId: context.actorId ?? parentStore?.actorId,
    module: context.module ?? parentStore?.module,
    operationName: context.operationName ?? parentStore?.operationName,
  };
  return contextStorage.run(mergedContext, fn);
}
