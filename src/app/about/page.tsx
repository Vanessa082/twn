import { Award, BookOpen, Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "About",
  description:
    "Learn more about the author and the inspiration behind The Notebook of a Tech Woman.",
};

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="py-16 sm:py-24 bg-background transition-colors duration-300 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="border-b border-border pb-10 mb-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground font-serif italic">{t("subtitle")}</p>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Story */}
          <div className="md:col-span-8 space-y-6 text-foreground/90 font-sans text-base sm:text-lg leading-relaxed">
            <p>
              Welcome to the Notebook. I'm Vanessa, a software engineer, technical writer, and
              community builder. Here, technical concepts meet personal observations on leadership,
              learning, and the journey of building a career in tech.
            </p>
            <p>
              I created this space as an intellectual logbook. A permanent archive of ideas,
              mistakes made, problems solved, and lessons gathered while working in technical spaces
              and contributing to open-source environments.
            </p>
            <p>
              My focus spans across distributed systems, web architectures, community initiatives,
              and the African tech ecosystem. Whether analyzing the complexities of security
              protocols or reflecting on the nuances of managing engineering teams, this notebook
              records it all.
            </p>

            {/* Core Values / Themes */}
            <div className="pt-8">
              <h3 className="text-xl font-serif font-bold text-foreground mb-4">Core Dimensions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 text-deep-navy dark:text-muted-gold font-bold mb-2">
                    <BookOpen className="h-4.5 w-4.5" />
                    <span className="text-sm uppercase tracking-wider">Education</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Teaching in a way that simplifies complex systems, supporting students and
                    contributors.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 text-deep-navy dark:text-muted-gold font-bold mb-2">
                    <Award className="h-4.5 w-4.5" />
                    <span className="text-sm uppercase tracking-wider">Leadership</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sharing methods on leading with empathy, building tech communities, and
                    mentoring.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Sidebar */}
          <div className="md:col-span-4 space-y-6">
            {/* Visual Monogram Card */}
            <div className="relative p-6 rounded-2xl border border-border bg-card text-center flex flex-col items-center shadow-xs">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-deep-navy bg-white text-deep-navy dark:border-muted-gold dark:bg-charcoal-black dark:text-muted-gold shadow-sm mb-4">
                <span className="font-serif text-3xl font-black tracking-tighter">TNW</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-foreground">Vanessa</h4>
              <p className="text-xs text-muted-foreground mb-4">Founder & Writer</p>
              <div className="w-full border-t border-border pt-4 text-xs text-left space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span className="font-semibold">Focus:</span>
                  <span>Architecture & Comm</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Format:</span>
                  <span>Digital Journal</span>
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div className="p-5 rounded-2xl bg-muted text-muted-foreground text-xs leading-relaxed flex items-start gap-3">
              <Heart className="h-5 w-5 text-muted-gold shrink-0 mt-0.5" />
              <p>
                Thank you for being here and taking time to read. I hope you find something that
                sparks curiosity or helps you on your own path.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
