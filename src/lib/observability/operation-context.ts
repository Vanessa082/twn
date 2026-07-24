import { contextStorage } from "./correlation";

export function getActorId(): string | undefined {
  return contextStorage.getStore()?.actorId;
}

export function getModuleContext(): string | undefined {
  return contextStorage.getStore()?.module;
}

export function getOperationName(): string | undefined {
  return contextStorage.getStore()?.operationName;
}
