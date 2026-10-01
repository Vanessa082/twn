import { describe, expect, it } from "vitest";
import { TWN_MARK_INK, TWN_MARK_PAPER, TWN_MARK_SIZES } from "./tokens";

describe("TWN wordmark", () => {
  it("is ink on paper, the same colours as the site", () => {
    expect(TWN_MARK_INK).toBe("#111111");
    expect(TWN_MARK_PAPER).toBe("#fcfbf8");
  });

  it("covers the favicon, apple and PWA sizes search engines expect", () => {
    expect(TWN_MARK_SIZES.favicon).toBe(32);
    expect(TWN_MARK_SIZES.apple).toBe(180);
    expect(TWN_MARK_SIZES.pwa).toEqual([192, 512]);
  });
});
