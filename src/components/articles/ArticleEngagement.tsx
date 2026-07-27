"use client";

import { Bookmark, Check, HeartIcon, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ArticleEngagementProps {
  slug: string;
  title: string;
  initialLikesCount: number;
}


/**
 * InlineActionBar — Medium-style action bar that renders directly inside
 * the article content column (max-w-[680px]). No floating elements.
 */
export function InlineActionBar({
  slug,
  title,
  initialLikesCount,
}: ArticleEngagementProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikesCount);

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
        setLiked(!next);
        setLikeCount(likeCount);
        localStorage.setItem(`twn-like-${slug}`, !next ? "1" : "0");
      }
    } catch {
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
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToComments = () => {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex items-center justify-between border-y border-border/80 py-3 my-6 text-muted-foreground text-sm font-medium select-none">
      {/* Left side: Claps & Responses */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-2 hover:text-foreground transition-colors group ${liked ? "text-foreground font-bold" : ""
            }`}
          title="Clap for this story"
        >
          <HeartIcon
            fill={liked ? "currentColor" : "none"}
            className="h-5 w-5 transition-transform group-hover:scale-110"
          />          <span className="tabular-nums text-xs">{likeCount}</span>
        </button>

        <button
          type="button"
          onClick={scrollToComments}
          className="flex items-center gap-2 hover:text-foreground transition-colors group"
          title="View reflections / responses"
        >
          <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="text-xs">Responses</span>
        </button>
      </div>

      {/* Right side: Bookmark & Share */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleBookmark}
          className={`hover:text-foreground transition-colors ${bookmarked ? "text-foreground" : ""
            }`}
          title={bookmarked ? "Saved" : "Save story"}
        >
          <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="hover:text-foreground transition-colors"
          title="Share story"
        >
          {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Share2 className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

/**
 * ArticleEngagement — Floating sidebar removed completely per user request.
 * All engagement features (Claps, Responses, Save, Share) are now handled
 * exclusively by InlineActionBar inside the article column.
 */
export default function ArticleEngagement() {
  return null;
}
