import ArticleCard from "@/components/articles/ArticleCard";
import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import { getCollectionBySlug } from "@/lib/services/collections";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection Not Found | TWN" };

  return {
    title: `${collection.title} | The Notebook of a Tech Woman`,
    description: collection.description || `Curated editorial collection on TWN.`,
  };
}

export const revalidate = 60;

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Navigation Back */}
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> All Collections
        </Link>

        {/* Collection Banner */}
        <div className="border-b border-border pb-10 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted-gold/10 text-muted-gold text-xs font-bold uppercase tracking-widest border border-muted-gold/20">
              <Layers className="h-3.5 w-3.5" /> Series ({collection.items.length} Parts)
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-foreground">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>

          {collection.cover_image && (
            <div className="relative aspect-[21/9] w-full bg-muted rounded-2xl overflow-hidden">
              <ImageWithSkeleton
                src={collection.cover_image}
                alt={collection.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Article Series Steps */}
        <div className="space-y-8">
          <h2 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-gold" /> Reading Path
          </h2>

          {collection.items.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-xl">
              <p className="text-sm text-muted-foreground">
                This collection has no articles added yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {collection.items.map((item, idx) => (
                <div
                  key={item.article_id}
                  className="flex flex-col sm:flex-row items-start gap-4 p-6 border border-border bg-card rounded-2xl relative overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-foreground text-background font-bold text-sm flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 w-full">
                    <ArticleCard article={item.article} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
