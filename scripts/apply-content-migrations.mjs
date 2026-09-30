/**
 * Applies the editorial CMS migrations and seeds only existing, real content.
 *
 * Required environment:
 *   SUPABASE_ACCESS_TOKEN — personal access token from
 *   https://supabase.com/dashboard/account/tokens
 *
 * Application credentials are loaded from .env. The access token is read from
 * the environment (not a command-line argument) so it does not enter shell
 * history or process listings.
 *
 * Run:
 *   SUPABASE_ACCESS_TOKEN=... node scripts/apply-content-migrations.mjs
 */

import { readFileSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";

try {
  loadEnvFile(".env");
} catch {
  // CI and hosting environments inject variables without an .env file.
}
try {
  loadEnvFile(".env.local");
} catch {
  // Optional local-only secrets, including SUPABASE_ACCESS_TOKEN.
}

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!accessToken) {
  throw new Error(
    "SUPABASE_ACCESS_TOKEN is required. Create one in Supabase Account → Access Tokens."
  );
}
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
if (!projectRef) throw new Error("Could not determine the Supabase project reference.");

const migrationFiles = [
  "src/lib/db/migration_about_sections.sql",
  "src/lib/db/migration_projects.sql",
  "src/lib/db/migration_field_notes.sql",
  "src/lib/db/migration_homepage_settings.sql",
  "src/lib/db/migration_notebook_entry_validation.sql",
];

const migrationSql = migrationFiles
  .map((file) => `-- Source: ${file}\n${readFileSync(file, "utf8")}`)
  .join("\n\n");

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: migrationSql }),
});

if (!response.ok) {
  const result = await response.text();
  throw new Error(`Supabase migration failed (${response.status}): ${result}`);
}

// about-data.json is existing author content, not generated seed content.
const aboutData = JSON.parse(readFileSync("src/content/about-data.json", "utf8"));
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error: aboutError } = await supabase.from("about_settings").upsert(
  {
    id: "default",
    data: aboutData,
    updated_at: new Date().toISOString(),
  },
  { onConflict: "id" }
);
if (aboutError) throw new Error(`About seed failed: ${aboutError.message}`);

for (const table of ["about_settings", "homepage_settings", "projects", "field_notes"]) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw new Error(`Verification failed for ${table}: ${error.message}`);
  console.log(`${table}: ${count ?? 0} row(s)`);
}

console.log("Editorial migrations and existing-content seed completed.");
