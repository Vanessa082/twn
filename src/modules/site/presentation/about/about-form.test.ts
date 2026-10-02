import aboutJson from "@/content/about-data.json";
import { aboutDataSchema } from "@/lib/validation/schemas";
import { describe, expect, it } from "vitest";
import { VISIBILITY_SECTIONS, tabForPath } from "./about-form";

describe("about editor", () => {
  it("accepts the shipped About content", () => {
    expect(aboutDataSchema.safeParse(aboutJson).success).toBe(true);
  });

  it("routes a failed field to the tab that edits it", () => {
    expect(tabForPath(["hero", "image_url"])).toBe("hero");
    expect(tabForPath(["hero", "roles", 0, "label"])).toBe("voice");
    expect(tabForPath(["identity_stages", 2, "role"])).toBe("voice");
    expect(tabForPath(["open_knowledge", "topics", 1])).toBe("words");
    expect(tabForPath(["still_figuring_out", 0, "text"])).toBe("figuring");
    expect(tabForPath(undefined)).toBe("hero");
  });

  it("sends an unsafe portrait URL back to the hero tab", () => {
    const result = aboutDataSchema.safeParse({
      ...aboutJson,
      hero: { ...aboutJson.hero, image_url: "javascript:alert(1)" },
    });
    expect(result.success).toBe(false);
    expect(tabForPath(result.error?.issues[0]?.path)).toBe("hero");
  });

  it("offers a visibility toggle for every section", () => {
    const keys = VISIBILITY_SECTIONS.map((section) => section.key).sort();
    expect(keys).toEqual(Object.keys(aboutJson.section_visibility).sort());
  });
});
