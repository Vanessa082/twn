export interface NoteBroadcastPayload {
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  reading_time: number | null;
  category: string;
}

export interface EmailDeliveryPort {
  sendWelcome(email: string): Promise<void>;
  sendNotePublished(to: string, note: NoteBroadcastPayload): Promise<void>;
}
