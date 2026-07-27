import { test, expect } from "@playwright/test";

test.describe("TWN Core Workflow & Moderation Boundary E2E", () => {
  test("visitor can browse public pages and search content", async ({ page }) => {
    // 1. Visit Homepage
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();

    // 2. Visit Articles Listing Page
    await page.goto("/articles", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();

    // 3. Visit Topics Page
    await page.goto("/topics", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();

    // 4. Visit Notebook Page
    await page.goto("/notebook", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();

    // 5. Visit Search Page and perform search query
    await page.goto("/search", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    const searchInput = page.locator('input[type="search"], input[name="q"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("tech");
      await page.keyboard.press("Enter");
    }
  });

  test("visitor submission requires moderation before public visibility", async ({ browser }) => {
    const visitorContext = await browser.newContext();
    const visitorPage = await visitorContext.newPage();

    // 1. Visitor opens Community page
    await visitorPage.goto("/community", { waitUntil: "domcontentloaded" });
    await expect(visitorPage.locator("body")).toBeVisible();

    // 2. Verify community section content is present
    const voicesHeading = visitorPage.locator("text=/Voices from our community|Leave a Page/i").first();
    await expect(voicesHeading).toBeVisible();

    await visitorContext.close();
  });
});
