"use client";

import { useState } from "react";
import type { Subscriber } from "@/types";
import { Search, Mail, Download } from "lucide-react";

interface AdminNewsletterListProps {
  subscribers: Subscriber[];
}

export default function AdminNewsletterList({ subscribers }: AdminNewsletterListProps) {
  const [search, setSearch] = useState("");

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to export emails as plain text CSV/list
  const handleExport = () => {
    const emailsList = subscribers.map((sub) => sub.email).join("\n");
    const blob = new Blob([emailsList], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `twn_subscribers_${new Date().toISOString().split("T")[0]}.txt`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search & Export bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        <button
          onClick={handleExport}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Export Emails
        </button>
      </div>

      {/* Subscribers Table */}
      <div className="overflow-x-auto border border-border rounded-xl bg-card">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
              <th className="p-4">Email Address</th>
              <th className="p-4">Subscribed Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredSubscribers.length > 0 ? (
              filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-semibold text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {sub.email}
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">
                    {formatDate(sub.created_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="p-8 text-center text-muted-foreground">
                  No subscribers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
