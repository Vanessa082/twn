"use client";

import { useState, useTransition } from "react";
import type { Article } from "@/types";
import Link from "next/link";
import { deleteArticleAction } from "@/app/actions/articles";
import { Edit, Trash2, Plus, Search } from "lucide-react";

interface AdminArticlesListProps {
  initialArticles: Article[];
}

export default function AdminArticlesList({ initialArticles }: AdminArticlesListProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    startTransition(async () => {
      const result = await deleteArticleAction(id);
      if (result.success) {
        setArticles(articles.filter((a) => a.id !== id));
      } else {
        alert(result.error || "Failed to delete article");
      }
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-deep-navy px-4 text-sm font-semibold text-white hover:bg-deep-navy/90 dark:bg-muted-gold dark:text-charcoal-black dark:hover:bg-muted-gold/90 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {/* Articles Table */}
      <div className="overflow-x-auto border border-border rounded-xl bg-card">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-semibold text-foreground max-w-xs sm:max-w-md truncate">
                    {article.title}
                  </td>
                  <td className="p-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground">
                    {article.category}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        article.status === "published"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : article.status === "scheduled"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">
                    {formatDate(article.published_at || article.created_at)}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="inline-flex p-1.5 rounded-lg border border-border text-muted-foreground hover:text-muted-gold hover:border-muted-gold transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id, article.title)}
                      disabled={isPending}
                      className="inline-flex p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors disabled:opacity-50 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No articles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
