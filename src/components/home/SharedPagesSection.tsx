"use client";

import type { SharedPage } from "@/types";
import { BookOpen, FileText, PenTool, X } from "lucide-react";
import { useState } from "react";
import LeaveAPageForm from "./LeaveAPageForm";

interface SharedPagesSectionProps {
  initialPages: SharedPage[];
}

export default function SharedPagesSection({ initialPages }: SharedPagesSectionProps) {
  const [pages, setPages] = useState<SharedPage[]>(initialPages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePage, setActivePage] = useState<SharedPage | null>(null);

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section
      aria-label="Pages from the Community"
      className="py-20 sm:py-28 bg-muted/30 border-b border-border transition-colors duration-300 relative overflow-hidden"
    >
      {/* ── Ruled journal style background effect ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 23px, color-mix(in srgb, var(--border) 10%, transparent) 24px)",
          backgroundSize: "100% 24px",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-border pb-8 mb-12">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground block mb-2">
              Community Journal
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-foreground">
              Shared Pages
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Open notes from women building, learning, and failing in tech. Click a page to read the full reflection, or add your own voice.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto inline-flex h-11 items-center gap-2 border-2 border-foreground bg-foreground px-5 text-xs font-bold uppercase tracking-wider text-background hover:bg-background hover:text-foreground transition-all-premium cursor-pointer rounded-md"
          >
            <PenTool className="h-4 w-4" /> Share Your Page
          </button>
        </div>

        {/* Notebook Cards Grid */}
        {pages.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-xl bg-card">
            <p className="text-sm text-muted-foreground">The journal is blank. Be the first to write a page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pages.map((page) => (
              <div
                key={page.id}
                onClick={() => setActivePage(page)}
                className="group relative bg-card p-6 sm:p-8 border border-border hover:border-foreground transition-all duration-300 rounded-[2px] shadow-xs cursor-pointer hover:shadow-md flex flex-col justify-between min-h-[220px]"
                style={{
                  backgroundImage: "linear-gradient(to right, rgba(220, 38, 38, 0.08) 1px, transparent 1px)",
                  backgroundSize: "40px 100%",
                  backgroundPosition: "left",
                }}
              >
                {/* Left Margin Accent Rule */}
                <div className="absolute left-[39px] inset-y-0 w-[1px] bg-red-500/15" />

                {/* Content */}
                <div className="pl-6 space-y-4">
                  {page.title && (
                    <h3 className="font-serif font-bold text-base text-foreground group-hover:text-muted-gold transition-colors line-clamp-1">
                      {page.title}
                    </h3>
                  )}
                  <p className="font-serif text-sm text-muted-foreground leading-relaxed line-clamp-5 italic">
                    &ldquo;{page.content}&rdquo;
                  </p>
                </div>

                {/* Footer Signature */}
                <div className="pl-6 mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-sans">
                  <span className="font-semibold text-foreground">— {page.author_name}</span>
                  <span>{formatDate(page.published_at || page.submitted_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox Modal for Reading Full Page ── */}
      {activePage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl bg-card border border-border rounded-[2px] shadow-xl p-8 sm:p-10 md:p-12 overflow-y-auto max-h-[85vh] transition-colors"
               style={{
                 backgroundImage: "linear-gradient(to right, rgba(220, 38, 38, 0.08) 1px, transparent 1px)",
                 backgroundSize: "40px 100%",
                 backgroundPosition: "left",
               }}>
            <div className="absolute left-[39px] inset-y-0 w-[1px] bg-red-500/15" />

            <button
              onClick={() => setActivePage(null)}
              className="absolute right-6 top-6 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pl-6 space-y-6">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/65 px-2 py-0.5 rounded-sm">
                Community Note #{activePage.id.substring(0, 4)}
              </span>

              {activePage.title && (
                <h3 className="font-serif text-2xl font-black leading-tight text-foreground">
                  {activePage.title}
                </h3>
              )}

              <p className="font-serif text-base sm:text-lg text-foreground leading-relaxed italic whitespace-pre-wrap">
                &ldquo;{activePage.content}&rdquo;
              </p>

              <div className="pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">— {activePage.author_name}</span>
                <span>Published on {formatDate(activePage.published_at || activePage.submitted_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal overlay for Share Form ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-serif font-black text-foreground">Write a notebook page</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Share a slice of your technology journey with other readers.
              </p>
            </div>

            <LeaveAPageForm onSuccess={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </section>
  );
}
