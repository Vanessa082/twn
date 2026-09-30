import ChapterStrip from "@/components/home/ChapterStrip";
import FieldNotesSection from "@/components/home/FieldNotesSection";
import FromTheNotebookSection from "@/components/home/FromTheNotebookSection";
import Hero from "@/components/home/Hero";
import VersionsOfMeSection from "@/components/home/VersionsOfMeSection";
import WorkbenchSection from "@/components/home/WorkbenchSection";
import { getAuthorPortrait } from "@/lib/about/portrait";
import { pageMetadata } from "@/lib/seo";
import { getAboutData } from "@/lib/services/about";
import { getLatestArticles } from "@/lib/services/articles";
import { getPublishedFieldNotes } from "@/lib/services/field-notes";
import { getHomepageSettings } from "@/lib/services/homepage-settings";
import { getPublishedProjects } from "@/lib/services/projects";
import { routes, site } from "@/lib/site";

export const revalidate = 60; // ISR

export const metadata = pageMetadata({
  title: `${site.name} | ${site.shortName}`,
  description: site.description,
  path: routes.home,
  absoluteTitle: true,
});

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  alternateName: site.shortName,
  url: site.url,
  author: { "@type": "Person", name: site.author },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${site.url}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

/**
 * Every section is fed by the CMS and disappears when its source is empty:
 *   Hero, volume, featured note → Admin → Homepage
 *   From the notebook           → Admin → Articles
 *   Field notes                 → Admin → Field Notes
 *   Workbench                   → Admin → Workbench
 *   Versions of me              → Admin → About Page → Voice & Versions
 *   Today's page (hero margin)  → latest published article's required excerpt
 *   The notebook continues      → Admin → Tags (categories)
 */
export default async function HomePage() {
  const [settings, articles, fieldNotes, projects, about] = await Promise.all([
    getHomepageSettings(),
    getLatestArticles(6),
    getPublishedFieldNotes(3),
    getPublishedProjects(3),
    getAboutData(),
  ]);

  const todaysArticle = articles[0] ?? null;
  const featured =
    settings.featured_article ??
    articles.find((article) => article.id !== todaysArticle?.id) ??
    null;
  const recent = articles
    .filter((article) => article.id !== todaysArticle?.id && article.id !== featured?.id)
    .slice(0, 4);
  const authorName = about.hero.title;
  const showVersions = about.section_visibility.identity_stages !== false;

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from trusted config
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Hero
        eyebrow={settings.hero_eyebrow}
        title={settings.hero_title}
        topics={settings.hero_topics}
        authorName={authorName}
        todaysArticle={todaysArticle}
      />

      {/* {featured && (
        <FeaturedArticle
          article={featured}
          volume={{
            label: settings.volume_label,
            season: settings.volume_season,
            theme: settings.volume_subtitle,
          }}
        />
      )} */}

      <FromTheNotebookSection articles={recent} />

      <FieldNotesSection notes={fieldNotes} />

      <WorkbenchSection projects={projects} />

      {showVersions && (
        <VersionsOfMeSection
          versions={about.identity_stages ?? []}
          authorName={authorName}
          portrait={getAuthorPortrait(about.hero)}
          lead={about.hero.lead}
        />
      )}

      <ChapterStrip />
    </div>
  );
}
