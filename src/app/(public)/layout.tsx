import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import CustomCursor from "@/components/ui/CustomCursor";
import NotebookTimeline from "@/components/ui/NotebookTimeline";
import PageTransition from "@/components/ui/PageTransition";
import ReadingLine from "@/components/ui/ReadingLine";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CustomCursor />
      <NotebookTimeline />
      <ReadingLine />
      <PageTransition />

      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
