import ArticleCard from "@/components/articles/ArticleCard";
import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/seo";
import { getCollectionBySlug } from "@/lib/services/collections";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection not found", robots: { index: false } };

  return pageMetadata({
    title: collection.title,
    description:
      collection.description ||
      `${collection.title}: a curated reading path through The Notebook of a Tech Woman.`,
    path: `/collections/${collection.slug}`,
    image: collection.cover_image,
    eyebrow: "Collection",
  });
}

export const revalidate = 60;

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <div className="bg-background pb-24 pt-16 sm:pt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <nav aria-label="Breadcrumb">
          <Link
            href="/collections"
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All collections
          </Link>
        </nav>

        <header className="mt-8 grid grid-cols-1 gap-10 border-b border-border pb-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>
              Reading path · {collection.items.length}{" "}
              {collection.items.length === 1 ? "part" : "parts"}
            </Eyebrow>
            <h1
              className="mt-5 font-serif font-bold leading-[1] tracking-[-0.03em] text-foreground text-balance"
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.25rem)" }}
            >
              {collection.title}
            </h1>
            {collection.description && (
              <p className="mt-5 max-w-xl font-serif text-[1.1rem] leading-[1.7] text-muted-foreground">
                {collection.description}
              </p>
            )}
          </div>
          {collection.cover_image && (
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted lg:col-span-5">
              <ImageWithSkeleton
                src={collection.cover_image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          )}
        </header>

        {collection.items.length === 0 ? (
          <p className="py-20 font-quote text-2xl italic text-muted-foreground">
            The first chapter of this path is still being written.
          </p>
        ) : (
          <ol className="mt-4">
            {collection.items.map((item, idx) => (
              <li
                key={item.article_id}
                className="grid grid-cols-[3rem_1fr] gap-4 border-b border-border py-10 sm:grid-cols-[5rem_1fr] sm:gap-8"
              >
                <span
                  className="font-serif text-3xl font-black text-foreground/20 sm:text-5xl"
                  aria-hidden="true"
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="max-w-3xl">
                  <span className="sr-only">Part {idx + 1}: </span>
                  <ArticleCard article={item.article} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
