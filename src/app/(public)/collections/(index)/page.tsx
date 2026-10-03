import { TwnMark } from "@/brand";
import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import { Eyebrow, TextLink } from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { getPublicCollections } from "@/modules/editorial";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Collections",
  description:
    "Curated reading paths through the notebook: multi-part series on engineering, leadership and self-reflection.",
  path: "/collections",
  eyebrow: "Collections",
});

export const revalidate = 60;

export default async function PublicCollectionsPage() {
  const collections = await getPublicCollections();

  return (
    <div className="bg-background pb-24 pt-16 sm:pt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <header className="max-w-2xl border-b border-border pb-10">
          <Eyebrow>Curated reading paths</Eyebrow>
          <h1
            className="mt-5 font-serif font-bold leading-[0.98] tracking-[-0.03em] text-foreground"
            style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)" }}
          >
            Collections
          </h1>
          <p className="mt-5 font-serif text-[1.1rem] leading-[1.7] text-muted-foreground">
            Notes gathered into series, so you can read a subject from its first page to its latest.
          </p>
        </header>

        {collections.length === 0 ? (
          <div className="py-20">
            <p className="font-quote text-2xl italic text-muted-foreground">
              No reading paths have been gathered yet.
            </p>
            <div className="mt-8">
              <TextLink href={routes.notebook}>Read every note instead</TextLink>
            </div>
          </div>
        ) : (
          <ul className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((col) => (
              <li key={col.id}>
                <Link href={`/collections/${col.slug}`} className="group block">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    {col.cover_image ? (
                      <ImageWithSkeleton
                        src={col.cover_image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center">
                        <TwnMark title="TWN" className="text-3xl opacity-15" />
                      </span>
                    )}
                  </div>
                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-accent">
                    {col.kind === "series" ? "Series" : "Reading path"}
                  </p>
                  <h2 className="mt-2 font-serif text-xl font-bold leading-snug text-foreground text-balance transition-opacity group-hover:opacity-70 sm:text-2xl">
                    {col.title}
                  </h2>
                  {col.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {col.description}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
                    {col.kind === "series" ? "Start reading" : "Follow the path"}{" "}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
