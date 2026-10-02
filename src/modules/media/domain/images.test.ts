import { describe, expect, it } from "vitest";
import { IMAGE_MAX_BYTES, optimizeImageUrl, sniffImageType, validateImageFile } from "./images";

describe("validateImageFile", () => {
  it("accepts supported images within the size limit", () => {
    expect(validateImageFile({ type: "image/webp", size: 200_000 })).toBeNull();
  });

  it("rejects unsupported types, empty files and oversized files", () => {
    expect(validateImageFile({ type: "image/svg+xml", size: 10 })).toMatch(/isn't supported/);
    expect(validateImageFile({ type: "image/png", size: 0 })).toMatch(/empty/);
    expect(validateImageFile({ type: "image/jpeg", size: IMAGE_MAX_BYTES + 1 })).toMatch(
      /under 5\.0 MB/
    );
  });
});

describe("sniffImageType", () => {
  it("recognises real image signatures", () => {
    expect(sniffImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(
      "image/png"
    );
    const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
    expect(sniffImageType(webp)).toBe("image/webp");
  });

  it("rejects files that only claim to be images", () => {
    expect(sniffImageType(new TextEncoder().encode("<script>alert(1)</script>"))).toBeNull();
  });
});

describe("optimizeImageUrl", () => {
  const cloud = "https://res.cloudinary.com/demo/image/upload/v1/twn/cover/a.jpg";

  it("adds Cloudinary transforms once", () => {
    const once = optimizeImageUrl(cloud, { width: 800 });
    expect(once).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto:good,w_800,c_fill/v1/twn/cover/a.jpg"
    );
    expect(optimizeImageUrl(once, { width: 400 })).toBe(once);
  });

  it("leaves other hosts alone", () => {
    expect(optimizeImageUrl("/images/vanessa.jpg", { width: 200 })).toBe("/images/vanessa.jpg");
  });
});
