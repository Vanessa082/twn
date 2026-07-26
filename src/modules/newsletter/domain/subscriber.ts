export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface NewSubscriber {
  email: string;
}

export interface SubscribeResult {
  success: boolean;
  error: string | null;
}
