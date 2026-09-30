import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import CustomCursor from "@/components/ui/CustomCursor";
import PageTransition from "@/components/ui/PageTransition";
import ReadingLine from "@/components/ui/ReadingLine";
import { getHomepageSettings } from "@/lib/services/homepage-settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getHomepageSettings();

  return (
    <>
      <CustomCursor />
      <ReadingLine />
      <PageTransition />

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
