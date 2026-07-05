import BrowseByTopic from "@/components/home/BrowseByTopic";
import FeaturedArticle from "@/components/home/FeaturedArticle";
import Hero from "@/components/home/Hero";
import LatestNotesSection from "@/components/home/LatestNotesSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import SharedPagesSection from "@/components/home/SharedPagesSection";
import TodaysPage from "@/components/home/TodaysPage";
import { getLatestArticles } from "@/lib/services/articles";
import { getTodaysEntry } from "@/lib/services/notebook-entries";
import { getApprovedSharedPages } from "@/lib/services/shared-pages";

export const revalidate = 60; // ISR

export default async function HomePage() {
  const [articles, todaysEntry, sharedPages] = await Promise.all([
    getLatestArticles(7),
    getTodaysEntry(),
    getApprovedSharedPages(),
  ]);

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const latestArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero — animated entrance + parallax notebook */}
      <Hero />

      {/* 2. Today's Page — sequential border-draw entry */}
      {todaysEntry && <TodaysPage entry={todaysEntry} />}

      {/* 3. Featured Article */}
      {featuredArticle && <FeaturedArticle article={featuredArticle} />}

      {/* 4. Latest Notes — staggered card reveal */}
      <LatestNotesSection articles={latestArticles} />

      {/* 5. Community Shared Pages — paper-placement cards */}
      <SharedPagesSection initialPages={sharedPages} />

      {/* 6. Browse by Topic — icon-draw grid */}
      <BrowseByTopic />

      {/* 7. Newsletter — calm ending */}
      <NewsletterSection />
    </div>
  );
}
