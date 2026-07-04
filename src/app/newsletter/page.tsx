import NewsletterSection from "@/components/home/NewsletterSection";
import { Calendar, Heart, Sparkles } from "lucide-react";
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

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12 text-left">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-5 rounded-xl border border-border bg-card">
                  <div className="p-2 rounded-lg bg-deep-navy/5 dark:bg-muted-gold/10 text-deep-navy dark:text-muted-gold w-fit mb-3">
                    <Icon className="h-4.5 w-4.5" />
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

      {/* Main Form Section */}
      <NewsletterSection />
    </div>
  );
}
