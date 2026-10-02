import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { requireAdmin } from "@/modules/identity";
import { getHomepageSettings } from "@/modules/site";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Admin-only previews rendered inside the public chrome, so a draft looks
 * exactly as it will once published.
 */
export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch {
    redirect("/?error=forbidden");
  }

  const settings = await getHomepageSettings();

  return (
    <>
      <Navbar />
      <main id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>
      <Footer
        contactEmail={settings.contact_email}
        location={settings.location}
        socialLinks={settings.social_links}
      />
    </>
  );
}
