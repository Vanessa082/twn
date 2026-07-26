import { z } from "zod";

export const subscribeNewsletterSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  source: z.string().trim().optional().default("website"),
});

export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>;
