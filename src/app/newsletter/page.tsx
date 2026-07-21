/**
 * /newsletter — Dedicated newsletter subscription page.
 *
 * ─── NEWSLETTER_ENABLED flag ──────────────────────────────────────────────────
 * When false, the subscription form is replaced with a professional
 * "Coming Soon" announcement. The page itself remains accessible and looks
 * intentional — it describes what the newsletter will be, builds anticipation,
 * and tells visitors it is on its way.
 *
 * To activate:
 *   1. Purchase a domain and verify it in Resend (resend.com/domains)
 *   2. Update FROM_ADDRESS + SITE_URL in src/lib/services/email.ts
 *   3. Set NEWSLETTER_ENABLED = true in src/lib/feature-flags.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import NewsletterSection from "@/components/home/NewsletterSection";
import { NEWSLETTER_ENABLED } from "@/lib/feature-flags";
import { Calendar, Clock, Heart, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Newsletter",
  description: "Subscribe to the newsletter and receive new notes directly in your inbox.",
};

export default async function NewsletterPage() {
  const t = await getTranslations("newsletter");

  const highlights = [
    {
      icon: Sparkles,
      title: "Curation",
      desc: "Thoughtful write-ups covering technical designs and leadership lessons.",
    },
    {
      icon: Calendar,
      title: "Cadence",
      desc: "Sent every two weeks. Respects your time and your inbox capacity.",
    },
    {
      icon: Heart,
      title: "Connection",
      desc: "Join a growing circle of developers, educators, and leaders.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      {/* Editorial Intro */}
      <section className="py-16 sm:py-24 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-gold mb-4 inline-block">
            Subscription
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-foreground mb-6">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {t("description")}
          </p>

          {/* Coming Soon badge — visible only while newsletter is disabled */}
          {!NEWSLETTER_ENABLED && (
            <div className="mt-8 inline-flex items-center gap-2.5 px-5 py-3 rounded-full border border-border bg-card text-muted-foreground">
              <Clock className="h-4 w-4 text-[#AE8D64] shrink-0" />
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.18em]">
                Launching Soon
              </p>
            </div>
          )}

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12 text-left">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-5 rounded-xl border border-border bg-card">
                  <div className="p-2 rounded-lg bg-deep-navy/5 dark:bg-muted-gold/10 text-deep-navy dark:text-muted-gold w-fit mb-3">
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <h3 className="font-serif font-bold text-sm text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Form Section (shows form or coming-soon depending on flag) */}
      <NewsletterSection />
    </div>
  );
}
