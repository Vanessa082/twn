"use client";

import { useReaderNote } from "@/lib/client-store/reader-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Check, HeartIcon, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

interface NoteEngagementProps {
  slug: string;
  title: string;
  initialLikesCount: number;
}

const likesKey = (slug: string) => ["note", slug, "likes"] as const;

/**
 * Like count lives in the query cache, so every action bar on the page shows
 * the same number; the reader's own like/save flags live in the reader store.
 */
function useNoteLikes(slug: string, initialLikesCount: number) {
  const queryClient = useQueryClient();
  const reader = useReaderNote(slug);

  const { data: count = initialLikesCount } = useQuery({
    queryKey: likesKey(slug),
    queryFn: () => initialLikesCount,
    initialData: initialLikesCount,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const mutation = useMutation({
    mutationFn: async (like: boolean) => {
      const { toggleNoteLikeAction } = await import("@/app/actions/notes");
      const res = await toggleNoteLikeAction(slug, like);
      if (!res.success) throw new Error(res.error ?? "Like failed");
      return res.count;
    },
    onMutate: async (like) => {
      await queryClient.cancelQueries({ queryKey: likesKey(slug) });
      const previous = queryClient.getQueryData<number>(likesKey(slug)) ?? initialLikesCount;
      queryClient.setQueryData(likesKey(slug), Math.max(0, previous + (like ? 1 : -1)));
      reader.setLiked(like);
      return { previous };
    },
    onError: (_error, like, context) => {
      if (context) queryClient.setQueryData(likesKey(slug), context.previous);
      reader.setLiked(!like);
    },
    onSuccess: (serverCount) => queryClient.setQueryData(likesKey(slug), serverCount),
  });

  return {
    count,
    liked: reader.liked,
    isPending: mutation.isPending,
    toggle: () => {
      if (!mutation.isPending) mutation.mutate(!reader.liked);
    },
  };
}

/**
 * InlineActionBar   Medium-style action bar that renders directly inside
 * the note's reading column. No floating elements.
 */
export function InlineActionBar({ slug, title, initialLikesCount }: NoteEngagementProps) {
  const likes = useNoteLikes(slug, initialLikesCount);
  const { saved, setSaved } = useReaderNote(slug);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
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
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={likes.toggle}
          aria-busy={likes.isPending}
          className={`flex items-center gap-2 hover:text-foreground transition-colors group ${
            likes.liked ? "text-foreground font-bold" : ""
          }`}
          aria-pressed={likes.liked}
          aria-label={`${likes.liked ? "Remove your like" : "Like this note"} (${likes.count} likes)`}
        >
          <HeartIcon
            fill={likes.liked ? "currentColor" : "none"}
            className="size-5 transition-transform group-hover:scale-110"
          />{" "}
          <span aria-hidden="true" className="tabular-nums text-xs">
            {likes.count}
          </span>
        </button>

        <button
          type="button"
          onClick={scrollToComments}
          className="flex items-center gap-2 hover:text-foreground transition-colors group"
          aria-label="Jump to reader reflections"
        >
          <MessageCircle className="size-5 transition-transform group-hover:scale-110" />
          <span className="hidden text-xs sm:inline">Reflections</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setSaved(!saved)}
          className={`hover:text-foreground transition-colors ${saved ? "text-foreground" : ""}`}
          aria-pressed={saved}
          aria-label={saved ? "Saved on this device" : "Save this note on this device"}
        >
          <Bookmark className={`size-5 ${saved ? "fill-current" : ""}`} />
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="hover:text-foreground transition-colors"
          aria-label={copied ? "Link copied" : "Share this note"}
        >
          {copied ? <Check className="size-5 text-foreground" /> : <Share2 className="size-5" />}
        </button>
      </div>
    </div>
  );
}
