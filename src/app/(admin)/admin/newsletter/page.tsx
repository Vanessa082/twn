import { getAllSubscribersAdmin } from "@/lib/services/subscribers";
import AdminNewsletterList from "@/components/admin/AdminNewsletterList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  // 1. Fetch all subscribers
  const subscribers = await getAllSubscribersAdmin();

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
            Newsletter Subscribers
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review and export readers of The Notebook.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-muted-gold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Main Table Interface */}
      <AdminNewsletterList subscribers={subscribers} />
    </div>
  );
}
