import ArticleCard from "@/components/articles/ArticleCard";
import { getArticlesByTag, getTagBySlug } from "@/lib/services/tags";
import { ArrowLeft, Tag as TagIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TopicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Topic Not Found | TWN" };

  return {
    title: `${tag.name} Articles | The Notebook of a Tech Woman`,
    description: `Explore all articles tagged under ${tag.name} on The Notebook of a Tech Woman.`,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    notFound();
  }

  const articles = await getArticlesByTag(slug);

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Navigation Back */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Articles
        </Link>

        {/* Topic Header */}
        <div className="border-b border-border pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted-gold/10 text-muted-gold text-xs font-bold uppercase tracking-widest border border-muted-gold/20">
            <TagIcon className="h-3.5 w-3.5" /> Topic
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-foreground">
            {tag.name}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Articles and reflections tagged under{" "}
            <span className="font-semibold text-foreground">{tag.name}</span>.
          </p>
        </div>

        {/* Article Grid */}
        {articles.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-border rounded-2xl space-y-3">
            <TagIcon className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-base font-serif font-semibold text-foreground">
              No published articles under this topic yet.
            </p>
            <p className="text-xs text-muted-foreground">
              Check back soon as new articles are tagged and published!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
