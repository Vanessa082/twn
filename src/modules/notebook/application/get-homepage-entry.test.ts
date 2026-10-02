import { describe, expect, it, vi } from "vitest";
import type { NotebookRepository } from "../domain/ports";
import { getAllActiveEntries } from "./get-homepage-entry";

describe("homepage notebook entries", () => {
  it("keeps an empty notebook empty", async () => {
    const repository = {
      findAllActive: vi.fn().mockResolvedValue([]),
    } as unknown as NotebookRepository;

    await expect(getAllActiveEntries(repository)).resolves.toEqual([]);
  });
});
