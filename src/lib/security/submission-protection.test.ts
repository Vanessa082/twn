import { describe, expect, it } from "vitest";
import { enforceRateLimit, isBotSubmission, isDuplicateSubmission } from "./submission-protection";

describe("Submission Protection", () => {
  describe("isBotSubmission", () => {
    it("detects non-empty honeypot input as bot", () => {
      expect(isBotSubmission("http://spam-bot.com")).toBe(true);
      expect(isBotSubmission("   gotcha  ")).toBe(true);
    });

    it("allows empty or undefined honeypot input", () => {
      expect(isBotSubmission("")).toBe(false);
      expect(isBotSubmission(null)).toBe(false);
      expect(isBotSubmission(undefined)).toBe(false);
    });
  });

  describe("enforceRateLimit", () => {
    it("allows requests under the limit", async () => {
      const result = await enforceRateLimit("test_action", 3, 60000);
      expect(result.success).toBe(true);
    });

    it("blocks requests exceeding the limit", async () => {
      const actionKey = "test_rate_exceed";
      await enforceRateLimit(actionKey, 2, 60000);
      await enforceRateLimit(actionKey, 2, 60000);
      const blocked = await enforceRateLimit(actionKey, 2, 60000);
      expect(blocked.success).toBe(false);
      expect(blocked.error).toMatch(/too frequently/i);
    });
  });

  describe("isDuplicateSubmission", () => {
    it("detects rapid duplicate submission", async () => {
      const content = "Unique content for test duplicate protection.";
      const first = await isDuplicateSubmission(content, 10000);
      expect(first).toBe(false);

      const second = await isDuplicateSubmission(content, 10000);
      expect(second).toBe(true);
    });
  });
});
