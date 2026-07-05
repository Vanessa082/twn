/**
 * Hero — Server Component wrapper.
 * Fetches data on the server and passes it to the HeroClient (which needs
 * 'use client' for mouse parallax tracking).
 */
import HeroClient from "@/components/home/HeroClient";
import { getAllActiveEntries, getRandomEntry } from "@/lib/services/notebook-entries";
import { getTranslations } from "next-intl/server";

export default async function Hero() {
  const [t, initialEntry, allEntries] = await Promise.all([
    getTranslations("home.hero"),
    getRandomEntry(),
    getAllActiveEntries(),
  ]);

  return (
    <HeroClient
      initialEntry={initialEntry}
      allEntries={allEntries}
      title={t("title")}
    />
  );
}
