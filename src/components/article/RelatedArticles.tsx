import ArticleCard from "@/components/articles/ArticleCard";
import type { ArticleCard as ArticleCardType } from "@/types";
import { Sparkles } from "lucide-react";

interface RelatedArticlesProps {
  articles: ArticleCardType[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="border-t border-border pt-12 pb-8 max-w-[680px] sm:max-w-5xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-2 mb-8">
        <Sparkles className="h-4 w-4 text-muted-gold" />
        <h2 className="font-serif text-2xl font-black tracking-tight text-foreground">
          Continue Reading
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
