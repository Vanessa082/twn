import { createAdminClient, createClient } from "@/lib/db/server";
import type { NewSubscriber, Subscriber } from "../domain/subscriber";

export interface SubscriberRepository {
  insert(subscriber: NewSubscriber): Promise<{ success: boolean; error: string | null }>;
  findAllAdmin(): Promise<Subscriber[]>;
  findAllEmailsAdmin(): Promise<string[]>;
}

export class SupabaseSubscriberRepository implements SubscriberRepository {
  async insert(subscriber: NewSubscriber): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("subscribers").insert({ email: subscriber.email });

      if (error) {
        if (error.code === "23505") {
          return { success: true, error: null }; // Silent success for existing emails
        }
        console.error("[SupabaseSubscriberRepository] DB error:", error.message);
        let errMsg = "Database registration failed.";
        if (
          error.message.includes("fetch failed") ||
          error.message.includes("TypeError") ||
          error.message.includes("failed to fetch")
        ) {
          errMsg = "Unable to connect to the database right now. Please try again later.";
        }
        return { success: false, error: errMsg };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("[SupabaseSubscriberRepository] Service error:", error);
      return { success: false, error: "An unexpected error occurred." };
    }
  }

  async findAllAdmin(): Promise<Subscriber[]> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[SupabaseSubscriberRepository] Admin DB error:", error.message);
      throw new Error(error.message);
    }

    return data || [];
  }

  async findAllEmailsAdmin(): Promise<string[]> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase.from("subscribers").select("email");

    if (error) {
      console.error("[SupabaseSubscriberRepository] Failed to fetch emails:", error.message);
      return [];
    }

    return (data || []).map((row) => row.email);
  }
}
