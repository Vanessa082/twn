import { broadcastNewNote as deliverNewNote } from "./application/broadcast-new-note";
import { listSubscribersAdmin as listFromRepo } from "./application/list-subscribers";
import { subscribeToNewsletter as addSubscriber } from "./application/subscribe";
import { mailer, subscribers } from "./compose";
import type { NoteBroadcastPayload } from "./domain/email-port";

export async function subscribeToNewsletter(email: string) {
  return addSubscriber(email, subscribers(), mailer());
}

export async function listSubscribersAdmin() {
  return listFromRepo(subscribers());
}

export async function broadcastNewNote(note: NoteBroadcastPayload) {
  return deliverNewNote(note, subscribers(), mailer());
}

export { subscribeAction } from "./actions";
export { subscribeNewsletterSchema } from "./presentation/schemas/subscriber-input-schema";
export type { NoteBroadcastPayload } from "./domain/email-port";
export type { NewSubscriber, Subscriber, SubscribeResult } from "./domain/subscriber";
