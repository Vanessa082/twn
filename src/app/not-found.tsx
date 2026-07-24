import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "404 - Page Not Found | The Notebook of a Tech Woman",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="p-4 rounded-full bg-muted-gold/10 text-muted-gold w-fit mx-auto">
          <BookOpen className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-gold">
            Error 404
          </span>
          <h1 className="text-4xl font-serif font-black tracking-tight text-foreground sm:text-5xl">
            Page Not Found
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The note or entry you are looking for does not exist or may have been archived.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back Home
          </Link>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground font-bold text-xs uppercase tracking-wider hover:bg-muted transition-colors"
          >
            Browse Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
