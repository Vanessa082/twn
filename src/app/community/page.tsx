import SharedPagesSection from "@/components/home/SharedPagesSection";
import { getApprovedSharedPages } from "@/lib/services/shared-pages";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shared Pages | The Notebook of a Tech Woman",
  description:
    "Community reflections from women in technology. Read shared pages or leave your own.",
};

export default async function CommunityPage() {
  const sharedPages = await getApprovedSharedPages();

  return (
    <div className="flex flex-col min-h-screen">
      <SharedPagesSection initialPages={sharedPages} />
    </div>
  );
}
