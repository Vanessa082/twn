/**
 * Hero — Server Component wrapper.
 *
 * The identity of the notebook (overline, title, topics) comes from homepage
 * settings; Today's Page promotes the latest published article.
 */

import HeroClient from "@/components/home/HeroClient";
import type { Article } from "@/types";

interface HeroProps {
  eyebrow: string;
  title: string;
  topics: string[];
  authorName: string;
  todaysArticle: Article | null;
}

export default function Hero(props: HeroProps) {
  return <HeroClient {...props} />;
}
