import ArticleGrid from "@/components/articles/ArticleGrid";
import CategoryCards from "@/components/home/CategoryCards";
import FeaturedArticle from "@/components/home/FeaturedArticle";
import Hero from "@/components/home/Hero";
import NewsletterSection from "@/components/home/NewsletterSection";
import { getLatestArticles } from "@/lib/services/articles";
import { getTranslations } from "next-intl/server";

export const revalidate = 60; // Revalidate homepage every 60 seconds (ISR)

export default async function HomePage() {
  // 1. Fetch latest articles on the server
  const articles = await getLatestArticles(7); // Fetch 7 articles: 1 featured + 6 grid
  const t = await getTranslations("home.latest");

  // 2. Identify featured vs latest
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const latestArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured Article Section */}
      {featuredArticle && <FeaturedArticle article={featuredArticle} />}

      {/* Latest Articles Section */}
      <section className="py-16 sm:py-24 bg-background transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-border pb-6 mb-12">
            <h2 className="text-3xl font-serif font-black tracking-tight text-foreground">
              {t("title")}
            </h2>
          </div>

          <ArticleGrid articles={latestArticles} />
        </div>
      </section>

      {/* Browse by Category Section */}
      <CategoryCards />

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}
