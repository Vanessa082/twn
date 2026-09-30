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
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer
        contactEmail={settings.contact_email}
        location={settings.location}
        socialLinks={settings.social_links}
      />
    </>
  );
}
