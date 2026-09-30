import SharedPagesSection from "@/components/home/SharedPagesSection";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { getApprovedSharedPages } from "@/modules/community";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Shared Pages",
  description:
    "Reflections from women in technology, left in the notebook one page at a time. Read them or leave your own.",
  path: routes.community,
  eyebrow: "Community",
});

export default async function CommunityPage() {
  const sharedPages = await getApprovedSharedPages();

  return (
    <div className="flex flex-col min-h-screen">
      <SharedPagesSection initialPages={sharedPages} />
    </div>
  );
}
