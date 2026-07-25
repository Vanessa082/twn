"use client";

/**
 * ArticleEngagement — floating sidebar + inline bottom bar with clap/share/bookmark.
 *
 * Design: Medium-inspired engagement patterns:
 *  - A sticky floating column on the LEFT of the reading area (desktop) shows
 *    action icons vertically — they feel "at hand" without interrupting reading.
 *  - On mobile, a fixed bottom bar appears instead.
 *
 * State is local (no DB) — claps/bookmarks use localStorage so they persist
 * across page refreshes without needing a login system.
 * Share uses the Web Share API (mobile) or copies the URL to clipboard (desktop).
 */

import { Bookmark, Check, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ArticleEngagementProps {
  slug: string;
  title: string;
  initialLikesCount: number;
}

/** Medium-style clap hand SVG */
function ClapIcon({ filled, className }: { filled?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* palm */}
      <path d="M8.5 3.5 L9 10 M11 2 L11.5 10 M13.5 3.5 L13 10" />
      {/* hand body */}
      <path d="M6.5 10.5 C5.7 10.5 5 11.2 5 12 L5 15 C5 18.3 7.7 21 11 21 L13 21 C16.3 21 19 18.3 19 15 L19 13 C19 11.9 18.1 11 17 11 L16.5 11 L16 10 C15.6 9.3 14.8 9 14 9.3 L13 10 L13 3.5 C13 2.7 12.3 2 11.5 2 C10.7 2 10 2.7 10 3.5 L10 10 L9 10 L9 3.5 C9 2.7 8.3 2 7.5 2 C6.7 2 6 2.7 6 3.5 L6 10.5 L6.5 10.5 Z" />
    </svg>
  );
}

export default function ArticleEngagement({
  slug,
  title,
  initialLikesCount,
}: ArticleEngagementProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikesCount);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // IntersectionObserver to hide floating sidebar near comments/footer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSidebarVisible(!entry.isIntersecting);
      },
      {
        rootMargin: "-80px 0px 0px 0px",
        threshold: 0.05,
      }
    );

    const target = document.getElementById("comments");
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, []);

  // Hydrate from localStorage on mount (persists user's state across refreshes)
  useEffect(() => {
    const storedLike = localStorage.getItem(`twn-like-${slug}`);
    const storedBookmark = localStorage.getItem(`twn-bookmark-${slug}`);
    if (storedLike === "1") setLiked(true);
    if (storedBookmark === "1") setBookmarked(true);
  }, [slug]);

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    const nextCount = next ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLikeCount(nextCount);
    localStorage.setItem(`twn-like-${slug}`, next ? "1" : "0");

    try {
      const { toggleArticleLikeAction } = await import("@/app/actions/articles");
      const res = await toggleArticleLikeAction(slug, next);
      if (res.success) {
        setLikeCount(res.count);
      } else {
        console.error("Failed to sync like with server:", res.error);
        setLiked(!next);
        setLikeCount(likeCount);
        localStorage.setItem(`twn-like-${slug}`, !next ? "1" : "0");
      }
    } catch (err) {
      console.error("Like toggle failed:", err);
      setLiked(!next);
      setLikeCount(likeCount);
      localStorage.setItem(`twn-like-${slug}`, !next ? "1" : "0");
    }
  };

  const handleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    localStorage.setItem(`twn-bookmark-${slug}`, next ? "1" : "0");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      // Native share sheet on mobile
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled — not an error
      }
    } else {
      // Desktop fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToComments = () => {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* ── Desktop: Sticky floating sidebar (left of reading area) ── */}
      <div
        className={`hidden lg:flex fixed left-[max(1rem,calc(50vw-480px-80px))] top-1/2 -translate-y-1/2 flex-col items-center gap-5 z-20 transition-all duration-300 ${
          sidebarVisible
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 -translate-x-4 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={handleLike}
          aria-label={liked ? "Remove clap" : "Clap"}
          className="group flex flex-col items-center gap-1.5"
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 ${
              liked
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            <ClapIcon filled={liked} className="h-4 w-4" />
          </span>
          <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
            {likeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={scrollToComments}
          aria-label="Jump to comments"
          className="flex flex-col items-center gap-1.5"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-300">
            <MessageCircle className="h-4 w-4" />
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">Discuss</span>
        </button>

        <button
          type="button"
          onClick={handleBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
          className="flex flex-col items-center gap-1.5"
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 ${
              bookmarked
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">Save</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Share"
          className="flex flex-col items-center gap-1.5"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-300">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">
            {copied ? "Copied!" : "Share"}
          </span>
        </button>
      </div>

      {/* ── Mobile: Fixed bottom bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-around px-4 py-3 max-w-lg mx-auto">
          <button
            type="button"
            onClick={handleLike}
            aria-label={liked ? "Remove clap" : "Clap"}
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              liked ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <ClapIcon filled={liked} className="h-5 w-5" />
            <span className="text-[10px] font-bold">{likeCount}</span>
          </button>

          <button
            type="button"
            onClick={scrollToComments}
            aria-label="Comments"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-[10px] font-bold">Discuss</span>
          </button>

          <button
            type="button"
            onClick={handleBookmark}
            aria-label="Bookmark"
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              bookmarked ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
            <span className="text-[10px] font-bold">Save</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
            <span className="text-[10px] font-bold">{copied ? "Copied!" : "Share"}</span>
          </button>
        </div>
      </div>
    </>
  );
}
