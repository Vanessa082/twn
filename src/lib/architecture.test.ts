import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!file.startsWith(".") && file !== "node_modules") {
        getAllFiles(filePath, fileList);
      }
    } else if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

describe("Architecture & Module Boundaries", () => {
  const rootDir = path.resolve(__dirname, "../../");
  const servicesDir = path.join(rootDir, "lib/services");
  const typesDir = path.join(rootDir, "types");

  it("ensures types layer is strictly decoupled from UI and framework layers", () => {
    const typeFiles = getAllFiles(typesDir);
    for (const file of typeFiles) {
      const content = fs.readFileSync(file, "utf-8");
      expect(content).not.toContain("from 'react'");
      expect(content).not.toContain('from "react"');
      expect(content).not.toContain("from 'next");
      expect(content).not.toContain('from "next');
    }
  });

  it("ensures backend service layer never imports client components or hooks", () => {
    const serviceFiles = getAllFiles(servicesDir);
    for (const file of serviceFiles) {
      const content = fs.readFileSync(file, "utf-8");
      expect(content).not.toContain("@/components/");
      expect(content).not.toContain("@/hooks/");
    }
  });
});
