"use client";

/**
 * NewsletterSection — subscription card or Coming Soon.
 * Subscribe form is dynamically imported only when NEWSLETTER_ENABLED is true.
 */

import { NEWSLETTER_ENABLED } from "@/lib/feature-flags";
import { Clock, Mail } from "lucide-react";
import dynamic from "next/dynamic";

const NewsletterSubscribeForm = NEWSLETTER_ENABLED
  ? dynamic(() => import("./NewsletterSubscribeForm"), { ssr: false })
  : null;

export default function NewsletterSection() {
  return (
    <section
      id="newsletter"
      aria-label="Newsletter signup"
      className="py-14 bg-background border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <div className="bg-card border border-border rounded-[20px] p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 border border-border text-muted-foreground rounded-[12px] bg-muted">
            <Mail className="h-6 w-6" strokeWidth={1.5} />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-foreground leading-[1.25]">
              Get new notes in your inbox
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Receive new articles directly. No spam, unsubscribe anytime.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2">
            {NEWSLETTER_ENABLED && NewsletterSubscribeForm ? (
              <NewsletterSubscribeForm />
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] border border-border bg-muted text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0 text-[#AE8D64]" />
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em]">
                  Coming Soon
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
