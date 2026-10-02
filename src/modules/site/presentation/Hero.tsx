/**
 * Hero — Server Component wrapper.
 *
 * The identity of the notebook (overline, title, topics) comes from homepage
 * settings; Today's Page promotes the latest published note.
 */

import type { Note } from "@/modules/editorial/contracts";
import HeroClient from "./HeroClient";
interface HeroProps {
  eyebrow: string;
  title: string;
  topics: string[];
  authorName: string;
  todaysNote: Note | null;
}

export default function Hero(props: HeroProps) {
  return <HeroClient {...props} />;
}
