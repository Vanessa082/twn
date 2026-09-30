import { AboutEditor } from "@/modules/site/admin-ui";
import { getAboutData } from "@/modules/site";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage About Page | Admin Dashboard",
  description: "Customize and publish sections on the About Page of The Notebook of a Tech Woman.",
};

export default async function AdminAboutPage() {
  const aboutData = await getAboutData();

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Main CMS Manager */}
      <AboutEditor initialData={aboutData} />
    </div>
  );
}
