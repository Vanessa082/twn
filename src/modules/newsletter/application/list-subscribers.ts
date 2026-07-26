import type { Subscriber } from "../domain/subscriber";
import {
  type SubscriberRepository,
  SupabaseSubscriberRepository,
} from "../infrastructure/subscriber-repository";

export async function listSubscribersAdmin(
  repository: SubscriberRepository = new SupabaseSubscriberRepository()
): Promise<Subscriber[]> {
  return repository.findAllAdmin();
}
