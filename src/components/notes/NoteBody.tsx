const proseClasses = [
  "twn-prose text-foreground/90 leading-[1.85] text-[17px] sm:text-[18px] lg:text-[20px] font-sans space-y-6",
  "[&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:lg:text-4xl [&_h2]:font-serif [&_h2]:font-black [&_h2]:text-foreground [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:tracking-tight [&_h2]:scroll-mt-28",
  "[&_h3]:text-xl [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-3",
  "[&_p]:text-foreground/85 [&_p]:leading-[1.85]",
  "[&_a]:text-ink-accent [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-ink-accent/40 hover:[&_a]:decoration-ink-accent [&_a]:transition-all",
  "[&_blockquote]:border-l-[3px] [&_blockquote]:border-foreground [&_blockquote]:pl-6 [&_blockquote]:my-8 [&_blockquote]:not-italic",
  "[&_blockquote_p]:text-xl [&_blockquote_p]:sm:text-2xl [&_blockquote_p]:lg:text-3xl [&_blockquote_p]:font-serif [&_blockquote_p]:italic [&_blockquote_p]:text-foreground [&_blockquote_p]:leading-snug",
  "[&_code]:bg-muted [&_code]:text-foreground [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:text-[0.85em] [&_code]:font-mono",
  "[&_pre]:bg-card [&_pre]:border [&_pre]:border-border [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:overflow-x-auto",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2",
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2",
  "[&_li]:text-foreground/85",
  "[&_hr]:border-border [&_hr]:my-10",
].join(" ");

interface NoteBodyProps {
  /** Must already be sanitised by the caller. */
  html: string;
}

export default function NoteBody({ html }: NoteBodyProps) {
  return (
    <div
      className={proseClasses}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: callers pass allow-list sanitised HTML
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
