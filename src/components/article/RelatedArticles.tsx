import ArticleCard from "@/components/articles/ArticleCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { routes } from "@/lib/site";
import type { ArticleCard as ArticleCardType } from "@/types";

interface RelatedArticlesProps {
  articles: ArticleCardType[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="related-notes" className="border-t border-border py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <SectionHeading
          eyebrow="Keep reading"
          title={<span id="related-notes">More from the notebook</span>}
          action={{ label: "All notes", href: routes.notebook }}
        />
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
