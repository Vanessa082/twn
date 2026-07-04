import { getAllArticlesAdmin } from "@/lib/services/articles";
import { getAllSubscribersAdmin } from "@/lib/services/subscribers";
import { getAllEntriesAdmin } from "@/lib/services/notebook-entries";
import { ArrowLeft, BookOpen, ChevronRight, FileText, PenSquare, Users, BookOpenIcon, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Fetch real statistics from database using admin clients
  let articlesCount = 0;
  let publishedCount = 0;
  let draftsCount = 0;
  let subscribersCount = 0;
  let notebookEntriesCount = 0;

  try {
    const articles = await getAllArticlesAdmin();
    articlesCount = articles.length;
    publishedCount = articles.filter((a) => a.status === "published").length;
    draftsCount = articles.filter((a) => a.status === "draft").length;

    const subscribers = await getAllSubscribersAdmin();
    subscribersCount = subscribers.length;

    const notebookEntries = await getAllEntriesAdmin();
    notebookEntriesCount = notebookEntries.length;
  } catch (error) {
    console.error("[AdminDashboard] Error loading dashboard stats:", error);
  }

  const stats = [
    {
      label: "Total Articles",
      value: articlesCount,
      icon: BookOpen,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Notebook Entries",
      value: notebookEntriesCount,
      icon: Sparkles,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Subscribers",
      value: subscribersCount,
      icon: Users,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            The Notebook of a Tech Woman • Administrative Panel
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-muted-gold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          View Live Website
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
                <span className="block text-3xl font-bold font-serif text-foreground mt-2">
                  {stat.value}
                </span>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Shortcuts */}
      <h2 className="text-xl font-serif font-bold text-foreground mb-4">Quick Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/articles/new"
          className="p-6 rounded-xl border border-border bg-card hover:border-muted-gold hover-lift transition-all-premium flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-sm text-foreground mb-1">Create New Article</h3>
            <p className="text-xs text-muted-foreground">Compose a draft or publish a new note.</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-muted-gold group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/articles"
          className="p-6 rounded-xl border border-border bg-card hover:border-muted-gold hover-lift transition-all-premium flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-sm text-foreground mb-1">Manage Articles</h3>
            <p className="text-xs text-muted-foreground">
              Edit metadata, change categories, delete notes.
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-muted-gold group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/content/notebook"
          className="p-6 rounded-xl border border-border bg-card hover:border-muted-gold hover-lift transition-all-premium flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-sm text-foreground mb-1">Manage Notebook Entries</h3>
            <p className="text-xs text-muted-foreground">
              Add sentences and thoughts to the drying-ink hero rotation.
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-muted-gold group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/newsletter"
          className="p-6 rounded-xl border border-border bg-card hover:border-muted-gold hover-lift transition-all-premium flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-sm text-foreground mb-1">View Newsletter Subscribers</h3>
            <p className="text-xs text-muted-foreground">
              Export subscriber emails and inspect connections.
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-muted-gold group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
}
