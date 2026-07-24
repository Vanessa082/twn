import { isAuthorizedAdmin, parseAdminUserIds } from "@/lib/auth/admin-access";
import { describe, expect, it } from "vitest";

describe("parseAdminUserIds", () => {
  it("parses comma-separated ids", () => {
    expect(parseAdminUserIds("user_a, user_b ,user_c")).toEqual(["user_a", "user_b", "user_c"]);
  });

  it("returns empty array for null/empty/invalid", () => {
    expect(parseAdminUserIds(null)).toEqual([]);
    expect(parseAdminUserIds(undefined)).toEqual([]);
    expect(parseAdminUserIds("")).toEqual([]);
    expect(parseAdminUserIds("   ,  , ")).toEqual([]);
  });
});

describe("isAuthorizedAdmin", () => {
  it("allows allowlisted user", () => {
    expect(
      isAuthorizedAdmin({
        userId: "user_1",
        allowlistRaw: "user_1,user_2",
        role: null,
        nodeEnv: "production",
      })
    ).toBe(true);
  });

  it("denies signed-in user not on allowlist", () => {
    expect(
      isAuthorizedAdmin({
        userId: "user_other",
        allowlistRaw: "user_1",
        role: "admin",
        nodeEnv: "production",
      })
    ).toBe(false);
  });

  it("allows role=admin when allowlist empty", () => {
    expect(
      isAuthorizedAdmin({
        userId: "user_1",
        allowlistRaw: "",
        role: "admin",
        nodeEnv: "production",
      })
    ).toBe(true);
  });

  it("denies production user with empty allowlist and no role", () => {
    expect(
      isAuthorizedAdmin({
        userId: "user_1",
        allowlistRaw: "",
        role: null,
        nodeEnv: "production",
      })
    ).toBe(false);
  });

  it("denies user in development when allowlist empty and role not admin", () => {
    expect(
      isAuthorizedAdmin({
        userId: "user_1",
        allowlistRaw: null,
        role: null,
        nodeEnv: "development",
      })
    ).toBe(false);
  });

  it("denies missing userId", () => {
    expect(
      isAuthorizedAdmin({
        userId: null,
        allowlistRaw: "user_1",
        role: "admin",
        nodeEnv: "development",
      })
    ).toBe(false);
  });
});
