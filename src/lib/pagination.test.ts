import { describe, expect, it } from "vitest";
import { pageRange, pageWindow, parsePageParam, totalPagesFor, withPageParam } from "./pagination";

describe("parsePageParam", () => {
  it("accepts positive whole numbers", () => {
    expect(parsePageParam("3")).toBe(3);
    expect(parsePageParam(["4", "9"])).toBe(4);
  });

  it("falls back to page 1 for anything else", () => {
    for (const value of [undefined, "", "0", "-2", "1.5", "abc", "2e3", "999999"]) {
      expect(parsePageParam(value)).toBe(1);
    }
  });
});

describe("totalPagesFor / pageRange", () => {
  it("always has at least one page", () => {
    expect(totalPagesFor(0, 12)).toBe(1);
    expect(totalPagesFor(25, 12)).toBe(3);
  });

  it("returns inclusive zero-based ranges", () => {
    expect(pageRange(1, 12)).toEqual({ from: 0, to: 11 });
    expect(pageRange(3, 12)).toEqual({ from: 24, to: 35 });
  });
});

describe("withPageParam", () => {
  it("keeps page 1 clean and preserves other params", () => {
    expect(withPageParam("/notebook", 1)).toBe("/notebook");
    expect(withPageParam("/notebook", 2)).toBe("/notebook?page=2");
    expect(withPageParam("/notebook?category=learning&page=3", 1)).toBe(
      "/notebook?category=learning"
    );
    expect(withPageParam("/search?q=lead", 4)).toBe("/search?q=lead&page=4");
  });
});

describe("pageWindow", () => {
  it("lists every page when there are few", () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageWindow(1, 1)).toEqual([1]);
  });

  it("collapses long runs into gaps", () => {
    expect(pageWindow(1, 10)).toEqual([1, 2, 3, 4, 5, "gap", 10]);
    expect(pageWindow(5, 10)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
    expect(pageWindow(10, 10)).toEqual([1, "gap", 6, 7, 8, 9, 10]);
  });

  it("keeps a constant length so the control does not jump", () => {
    const lengths = new Set(Array.from({ length: 20 }, (_, i) => pageWindow(i + 1, 20).length));
    expect(lengths).toEqual(new Set([7]));
  });
});
