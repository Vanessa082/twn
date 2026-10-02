import { pageMetadata } from "@/lib/seo";
import { routes, site } from "@/lib/site";
import { getCategories, getLatestNotes, getPublishedFieldNotes } from "@/modules/editorial";
import { ChapterStrip, FieldNotesSection, FromTheNotebookSection } from "@/modules/editorial/ui";
import { getAboutData, getAuthorPortrait, getHomepageSettings } from "@/modules/site";
import { Hero, VersionsOfMeSection } from "@/modules/site/ui";
import { getPublishedProjects } from "@/modules/workbench";
import { WorkbenchSection } from "@/modules/workbench/ui";

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
 *   From the notebook           → Admin → Notes
 *   Field notes                 → Admin → Field Notes
 *   Workbench                   → Admin → Workbench
 *   Versions of me              → Admin → About Page → Voice & Versions
 *   Today's page (hero margin)  → latest published note's required excerpt
 *   The notebook continues      → Admin → Tags (categories)
 */
export default async function HomePage() {
  const [settings, notes, fieldNotes, projects, about, categories] = await Promise.all([
    getHomepageSettings(),
    getLatestNotes(6),
    getPublishedFieldNotes(3),
    getPublishedProjects(3),
    getAboutData(),
    getCategories(),
  ]);

  const todaysNote = notes[0] ?? null;
  const featured =
    settings.featured_note ?? notes.find((note) => note.id !== todaysNote?.id) ?? null;
  const recent = notes
    .filter((note) => note.id !== todaysNote?.id && note.id !== featured?.id)
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
        todaysNote={todaysNote}
      />

      {/* {featured && (
        <FeaturedNote
          note={featured}
          volume={{
            label: settings.volume_label,
            season: settings.volume_season,
            theme: settings.volume_subtitle,
          }}
        />
      )} */}

      <FromTheNotebookSection notes={recent} />

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

      <ChapterStrip categories={categories} />
    </div>
  );
}
