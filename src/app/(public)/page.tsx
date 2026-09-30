import ChapterStrip from "@/components/home/ChapterStrip";
import FeaturedArticle from "@/components/home/FeaturedArticle";
import FieldNotesSection from "@/components/home/FieldNotesSection";
import FromTheNotebookSection from "@/components/home/FromTheNotebookSection";
import Hero from "@/components/home/Hero";
import VersionsOfMeSection from "@/components/home/VersionsOfMeSection";
import WorkbenchSection from "@/components/home/WorkbenchSection";
import { getAboutData } from "@/lib/services/about";
import { getLatestArticles } from "@/lib/services/articles";
import { getPublishedFieldNotes } from "@/lib/services/field-notes";
import { getHomepageSettings } from "@/lib/services/homepage-settings";
import { getPublishedProjects } from "@/lib/services/projects";

export const revalidate = 60; // ISR

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
          portraitUrl={about.hero.image_url}
          lead={about.hero.lead}
        />
      )}

      <ChapterStrip />
    </div>
  );
}
