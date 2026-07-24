import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import { getPublicCollections } from "@/lib/services/collections";
import { Layers } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Editorial Collections | The Notebook of a Tech Woman",
  description:
    "Explore curated learning series and article collections on engineering, NAO robotics, tech leadership, and self-reflection.",
};

export const revalidate = 60;

export default async function PublicCollectionsPage() {
  const collections = await getPublicCollections();

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="border-b border-border pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted-gold/10 text-muted-gold text-xs font-bold uppercase tracking-widest border border-muted-gold/20">
            <Layers className="h-3.5 w-3.5" /> Curated Series
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-foreground">
            Editorial Collections
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Thoughtfully curated reading paths and multi-part guides on software engineering,
            artificial intelligence, and leadership.
          </p>
        </div>

        {/* Grid */}
        {collections.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-border rounded-2xl space-y-3">
            <Layers className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-base font-serif font-semibold text-foreground">
              No public collections available yet.
            </p>
            <p className="text-xs text-muted-foreground">
              Check back soon as new curated editorial series are published!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className="group flex flex-col border border-border bg-card rounded-2xl overflow-hidden hover:border-border/80 transition-colors"
              >
                {col.cover_image && (
                  <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden">
                    <ImageWithSkeleton
                      src={col.cover_image}
                      alt={col.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-gold">
                      Curated Path
                    </span>
                    <h2 className="text-xl font-serif font-bold text-foreground group-hover:text-muted-gold transition-colors">
                      {col.title}
                    </h2>
                    {col.description && (
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {col.description}
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-border/60 text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                    <span>Explore Series</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
