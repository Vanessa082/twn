import { HelpCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
};

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-background text-foreground transition-colors duration-300">
      <div className="p-4 rounded-full bg-muted text-muted-foreground mb-6 animate-bounce">
        <HelpCircle className="h-10 w-10 text-muted-gold" />
      </div>

      <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-foreground mb-4">
        {t("notFound")}
      </h1>

      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-sm mb-8">
        The page you are looking for does not exist, has been moved, or is temporarily unavailable.
      </p>

      <Link
        href="/"
        className="inline-flex h-12 items-center justify-center rounded-lg bg-deep-navy px-6 text-sm font-semibold text-white hover:bg-deep-navy/90 dark:bg-muted-gold dark:text-charcoal-black dark:hover:bg-muted-gold/90 shadow-md hover-lift transition-all"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
