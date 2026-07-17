/**
 * apply-schema-v2.mjs
 *
 * Applies the TWN database schema via the Supabase REST Management API.
 *
 * Usage:
 *   node scripts/apply-schema-v2.mjs <SUPABASE_ACCESS_TOKEN>
 *
 * You can get your personal access token from:
 *   https://supabase.com/dashboard/account/tokens
 *
 * Alternatively, if you provide no token, this script will print the SQL
 * for manual pasting into the Supabase SQL Editor.
 */

import { readFileSync } from "node:fs";

const PROJECT_REF = "ajafekyeeuvygqdyrlpu";
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

// --- Read schema ---
const schemaSQL = readFileSync("src/lib/db/schema.sql", "utf8");

const accessToken = process.argv[2];

if (!accessToken) {
  console.log("\n" + "=".repeat(70));
  console.log("  NO ACCESS TOKEN PROVIDED");
  console.log("=".repeat(70));
  console.log("");
  console.log("  To apply automatically, run:");
  console.log("  node scripts/apply-schema-v2.mjs YOUR_SUPABASE_PAT");
  console.log("");
  console.log("  Get your PAT from:");
  console.log("  https://supabase.com/dashboard/account/tokens");
  console.log("");
  console.log("  OR manually copy the SQL below and paste it into:");
  console.log(`  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
  console.log("=".repeat(70));
  console.log("\n--- SCHEMA SQL (copy everything below) ---\n");
  console.log(schemaSQL);
  process.exit(0);
}

console.log(`\nApplying schema to project: ${PROJECT_REF}`);
console.log("Connecting to Supabase Management API...\n");

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

try {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query: schemaSQL }),
  });

  const text = await response.text();
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    result = { raw: text };
  }

  if (!response.ok) {
    console.error("❌ API Error:", response.status, response.statusText);
    console.error("Response:", JSON.stringify(result, null, 2));
    console.log("\nFallback: Please paste the SQL into the Supabase SQL Editor.");
    process.exit(1);
  }

  console.log("✅ Schema applied successfully!\n");
  console.log("Tables created:");
  console.log("  ✓ categories (seeded with 5 categories)");
  console.log("  ✓ articles");
  console.log("  ✓ subscribers");
  console.log("  ✓ notebooks (seeded with default)");
  console.log("  ✓ notebook_entries");
  console.log("  ✓ shared_pages");
  console.log("  ✓ margin_notes");
  console.log("\nNext: restart the dev server and test the newsletter form.");
} catch (err) {
  console.error("❌ Request failed:", err.message);
  console.log("\nFallback: Please paste the SQL into the Supabase SQL Editor:");
  console.log(`  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
  process.exit(1);
}
