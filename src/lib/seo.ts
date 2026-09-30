import type { Metadata } from "next";
import { site } from "./site";

interface PageMetadataInput {
  title: string;
  description: string;
  /** Site-relative path used for the canonical URL and og:url. */
  path: string;
  image?: string | null;
  type?: "website" | "article" | "profile";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  tags?: string[];
  /** Keep the page reachable but out of search results (e.g. search results pages). */
  noIndex?: boolean;
  /** Small label printed above the title on the generated social card. */
  eyebrow?: string;
  /** Skip the "%s | TWN" title template (used by the homepage). */
  absoluteTitle?: boolean;
}

export function ogImageUrl(title: string, eyebrow?: string): string {
  const params = new URLSearchParams({ title });
  if (eyebrow) params.set("eyebrow", eyebrow);
  return `/og?${params.toString()}`;
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  noIndex = false,
  eyebrow,
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  const imageUrl = image || ogImageUrl(title, eyebrow);
  const images = [{ url: imageUrl, width: 1200, height: 630, alt: title }];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: site.locale,
      type,
      images,
      ...(type === "article"
        ? {
            publishedTime: publishedTime ?? undefined,
            modifiedTime: modifiedTime ?? undefined,
            authors: [site.author],
            tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
