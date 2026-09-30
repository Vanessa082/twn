import type { Subscriber } from "../domain/subscriber";
import type { SubscriberRepository } from "../domain/ports";

export async function listSubscribersAdmin(
  repository: SubscriberRepository
): Promise<Subscriber[]> {
  return repository.findAllAdmin();
}
