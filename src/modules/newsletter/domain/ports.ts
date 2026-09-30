import type { NewSubscriber, Subscriber } from "./subscriber";

export interface SubscriberRepository {
  insert(subscriber: NewSubscriber): Promise<{ success: boolean; error: string | null }>;
  findAllAdmin(): Promise<Subscriber[]>;
  findAllEmailsAdmin(): Promise<string[]>;
}
