import type { SubscriberRepository } from "../domain/ports";
import type { Subscriber } from "../domain/subscriber";

export async function listSubscribersAdmin(
  repository: SubscriberRepository
): Promise<Subscriber[]> {
  return repository.findAllAdmin();
}
