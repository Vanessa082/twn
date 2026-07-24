import SearchClient from "@/components/search/SearchClient";
import { getLatestArticles } from "@/lib/services/articles";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Search Articles",
  description: "Search all published articles and reflections in The Notebook of a Tech Woman.",
};

export const revalidate = 60; // Revalidate index every 60 seconds

export default async function SearchPage() {
  // 1. Fetch published articles for local client-side search index
  const articles = await getLatestArticles(100);
  const t = await getTranslations("search");

  return (
    <div className="py-16 sm:py-24 bg-background transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-gold mb-4 inline-block">
            Permanent Archive
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Search our records by title, excerpt, content, or category tag.
          </p>
        </div>

        {/* Client-side search interface */}
        <SearchClient articles={articles} />
      </div>
    </div>
  );
}
