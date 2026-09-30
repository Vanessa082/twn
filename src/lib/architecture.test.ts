import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC = path.resolve(__dirname, "..");

const PUBLIC_ENTRY_FILES = new Set([
  "index.ts",
  "index.tsx",
  "actions.ts",
  "actions.tsx",
  "ui.ts",
  "ui.tsx",
  "admin-ui.ts",
  "admin-ui.tsx",
]);
const PUBLIC_ROOTS = new Set(["contracts", "actions", "ui", "admin-ui"]);

function isPublicModulePath(rest: string): boolean {
  if (!rest) return true;
  const first = rest.split("/")[0];
  return PUBLIC_ROOTS.has(first) || PUBLIC_ENTRY_FILES.has(rest) || PUBLIC_ENTRY_FILES.has(first);
}

function walk(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      walk(full, files);
    } else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

function importsIn(file: string): string[] {
  const content = fs.readFileSync(file, "utf-8");
  const matches = content.matchAll(/from\s+["']([^"']+)["']/g);
  return [...matches].map((match) => match[1]);
}

function moduleNameFromImport(spec: string): { module: string; rest: string } | null {
  const match = spec.match(/^@\/modules\/([^/]+)(?:\/(.*))?$/);
  if (!match) return null;
  return { module: match[1], rest: match[2] ?? "" };
}

describe("Modular monolith boundaries", () => {
  const srcFiles = walk(SRC);

  it("outside a module may only import that module's public API", () => {
    const violations: string[] = [];
    for (const file of srcFiles) {
      if (file.includes(`${path.sep}modules${path.sep}`)) continue;
      for (const spec of importsIn(file)) {
        const parsed = moduleNameFromImport(spec);
        if (!parsed) continue;
        if (!isPublicModulePath(parsed.rest)) {
          violations.push(`${path.relative(SRC, file)} imports ${spec}`);
        }
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("modules never import the app transport layer", () => {
    const violations: string[] = [];
    for (const file of srcFiles) {
      if (!file.includes(`${path.sep}modules${path.sep}`)) continue;
      for (const spec of importsIn(file)) {
        if (spec.startsWith("@/app")) {
          violations.push(`${path.relative(SRC, file)} imports ${spec}`);
        }
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("nothing uses the old lib hallways for a capability", () => {
    const closed = ["@/lib/services", "@/lib/auth", "@/lib/about", "@/lib/search", "@/lib/media"];
    const violations: string[] = [];
    for (const file of srcFiles) {
      for (const spec of importsIn(file)) {
        if (closed.some((prefix) => spec === prefix || spec.startsWith(`${prefix}/`))) {
          violations.push(`${path.relative(SRC, file)} imports ${spec}`);
        }
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("modules never import a sibling module's internals", () => {
    const violations: string[] = [];
    for (const file of srcFiles) {
      const own = file.match(/modules[\\/]([^\\/]+)/);
      if (!own) continue;
      for (const spec of importsIn(file)) {
        const parsed = moduleNameFromImport(spec);
        if (!parsed || parsed.module === own[1]) continue;
        if (!isPublicModulePath(parsed.rest)) {
          violations.push(`${path.relative(SRC, file)} imports ${spec}`);
        }
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("only the owning module reads its tables", () => {
    const ownerByTable: Record<string, string> = {
      articles: "editorial",
      article_tags: "editorial",
      article_revisions: "editorial",
      collection_articles: "editorial",
      collections: "editorial",
      tags: "editorial",
      categories: "editorial",
      field_notes: "editorial",
      margin_notes: "community",
      shared_pages: "community",
      subscribers: "newsletter",
      homepage_settings: "site",
      about_settings: "site",
      projects: "workbench",
      notebook_entries: "notebook",
      notebooks: "notebook",
      audit_logs: "platform",
    };
    const violations: string[] = [];

    for (const file of srcFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const mentioned = new Set<string>();
      for (const match of content.matchAll(/\.from\(\s*["']([a-z_]+)["']\s*\)/g)) {
        mentioned.add(match[1]);
      }
      for (const table of Object.keys(ownerByTable)) {
        if (content.includes(`${table}(`)) mentioned.add(table);
      }

      for (const table of mentioned) {
        const owner = ownerByTable[table];
        const owned =
          owner === "platform"
            ? file.includes(`${path.sep}platform${path.sep}`)
            : file.includes(`${path.sep}modules${path.sep}${owner}${path.sep}`);
        if (!owned) {
          violations.push(`${path.relative(SRC, file)} reads ${table}, owned by ${owner}`);
        }
      }
    }

    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("module domain files stay free of Next.js, React, and Supabase", () => {
    const violations: string[] = [];
    const domainFiles = srcFiles.filter(
      (file) =>
        file.includes(`${path.sep}modules${path.sep}`) &&
        file.includes(`${path.sep}domain${path.sep}`)
    );
    for (const file of domainFiles) {
      if (file.endsWith(".test.ts")) continue;
      const content = fs.readFileSync(file, "utf-8");
      if (/from\s+["'](react|next|@supabase\/)/.test(content)) {
        violations.push(path.relative(SRC, file));
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("the shared types bag does not own domain language", () => {
    const content = fs.readFileSync(path.join(SRC, "types", "index.ts"), "utf-8");
    const leaked = [
      "export interface Note ",
      "export interface SharedPage",
      "export interface MarginNote",
      "export interface Notebook ",
      "export interface Project ",
      "export interface Subscriber",
    ].filter((noun) => content.includes(noun));
    expect(leaked, leaked.join("\n")).toEqual([]);
  });

  it("application use cases take ports and do not import adapters", () => {
    const violations: string[] = [];
    const applicationFiles = srcFiles.filter(
      (file) =>
        file.includes(`${path.sep}modules${path.sep}`) &&
        file.includes(`${path.sep}application${path.sep}`) &&
        !file.endsWith(".test.ts")
    );
    for (const file of applicationFiles) {
      for (const spec of importsIn(file)) {
        if (spec.includes("/infrastructure/") || spec.startsWith("../infrastructure")) {
          violations.push(`${path.relative(SRC, file)} imports ${spec}`);
        }
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("the module door does not re-export infrastructure", () => {
    const violations: string[] = [];
    const modulesDir = path.join(SRC, "modules");
    for (const name of fs.readdirSync(modulesDir)) {
      const indexPath = path.join(modulesDir, name, "index.ts");
      if (!fs.existsSync(indexPath)) continue;
      const content = fs.readFileSync(indexPath, "utf-8");
      const reexports = content.matchAll(
        /export\s+(?:type\s+)?\{[^}]*\}\s+from\s+["'](\.\/infrastructure[^"']*)["']/g
      );
      for (const match of reexports) {
        violations.push(`modules/${name}/index.ts re-exports ${match[1]}`);
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });
});
