"use client";

import { AlertCircle, Link, MessageSquare, Search } from "lucide-react";
import { useState } from "react";

interface SeoPreviewProps {
  title: string;
  excerpt: string;
  coverImage: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
}

export default function SeoPreview({
  title,
  excerpt,
  coverImage,
  slug,
  seoTitle,
  seoDescription,
  ogImage,
}: SeoPreviewProps) {
  const [activeTab, setActiveTab] = useState<"google" | "linkedin" | "whatsapp">("google");

  const displayTitle = seoTitle.trim() || title || "Untitled Article";
  const displayDescription =
    seoDescription.trim() ||
    excerpt ||
    "No description provided yet. Write an excerpt or SEO description.";
  const displayImage =
    ogImage.trim() ||
    coverImage ||
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80"; // Default generic placeholder image
  const displaySlug = slug.trim() || "your-article-slug";

  // Length checks
  const isTitleLong = displayTitle.length > 60;
  const isDescLong = displayDescription.length > 155;

  return (
    <div className="space-y-6">
      {/* Tabs Selector */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border select-none">
        <button
          type="button"
          onClick={() => setActiveTab("google")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === "google"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="h-3.5 w-3.5" />
          Google
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("linkedin")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === "linkedin"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link className="h-3.5 w-3.5" />
          LinkedIn
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === "whatsapp"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          WhatsApp
        </button>
      </div>

      {/* Previews Output */}
      <div className="p-5 border border-border bg-background rounded-xl min-h-[180px] flex flex-col justify-center">
        {activeTab === "google" && (
          <div className="space-y-1.5 text-left">
            {/* Google breadcrumb/domain */}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-sans">
              <span>twn.dev</span>
              <span>›</span>
              <span>articles</span>
              <span>›</span>
              <span className="truncate max-w-[200px]">{displaySlug}</span>
            </div>
            {/* Google Title */}
            <h4 className="text-xl font-sans text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-tight font-medium">
              {displayTitle}
            </h4>
            {/* Google Snippet */}
            <p className="text-[13px] font-sans text-[#4d5156] dark:text-[#bdc1c6] leading-normal line-clamp-2">
              {displayDescription}
            </p>
          </div>
        )}

        {activeTab === "linkedin" && (
          <div className="border border-border dark:border-[#383838] bg-card rounded-lg overflow-hidden max-w-sm mx-auto shadow-sm">
            {/* Cover image preview */}
            <div className="aspect-[1.91/1] w-full bg-muted relative overflow-hidden">
              <img
                src={displayImage}
                alt="LinkedIn Preview"
                className="object-cover w-full h-full"
              />
            </div>
            {/* Context/Domain strip */}
            <div className="p-3 bg-muted/40 dark:bg-muted/10 border-t border-border/50 text-left">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                twn.dev
              </span>
              <h4 className="text-sm font-bold text-foreground line-clamp-1 mt-0.5 leading-tight">
                {displayTitle}
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1 leading-normal">
                {displayDescription}
              </p>
            </div>
          </div>
        )}

        {activeTab === "whatsapp" && (
          <div className="p-3 bg-[#efeae2] dark:bg-[#0b141a] rounded-lg max-w-xs mx-auto w-full shadow-sm">
            {/* WhatsApp Link bubble */}
            <div className="bg-[#e2f4c5] dark:bg-[#005c4b] text-foreground rounded-lg p-2.5 shadow-sm text-left relative text-xs">
              {/* Cover preview inside chat bubble */}
              <div className="rounded overflow-hidden mb-2 bg-[#d1ecc6] dark:bg-[#025042] aspect-[1.91/1]">
                <img
                  src={displayImage}
                  alt="WhatsApp Preview"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-gold dark:text-[#53bdeb] font-semibold block uppercase">
                  twn.dev
                </span>
                <span className="font-bold text-foreground dark:text-[#e9edef] block line-clamp-1">
                  {displayTitle}
                </span>
                <span className="text-muted-foreground dark:text-[#8696a0] block line-clamp-2 leading-relaxed">
                  {displayDescription}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO Optimization Warnings / Insights */}
      <div className="space-y-2 text-xs text-muted-foreground select-none">
        <div className="flex items-start gap-2">
          <AlertCircle
            className={`h-4 w-4 shrink-0 mt-0.5 ${isTitleLong ? "text-amber-500" : "text-emerald-500"}`}
          />
          <div>
            <span className="font-semibold text-foreground">SEO Title length:</span>{" "}
            <span className={isTitleLong ? "text-amber-500 font-bold" : "text-emerald-500"}>
              {displayTitle.length} / 60 characters
            </span>
            <p className="text-[10px] mt-0.5">
              Keep titles under 60 characters to ensure they do not get truncated in search engine
              result pages.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <AlertCircle
            className={`h-4 w-4 shrink-0 mt-0.5 ${isDescLong ? "text-amber-500" : "text-emerald-500"}`}
          />
          <div>
            <span className="font-semibold text-foreground">SEO Description length:</span>{" "}
            <span className={isDescLong ? "text-amber-500 font-bold" : "text-emerald-500"}>
              {displayDescription.length} / 155 characters
            </span>
            <p className="text-[10px] mt-0.5">
              Keep descriptions under 155 characters to ensure maximum readability in search
              snippets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
