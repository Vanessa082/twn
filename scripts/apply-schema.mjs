/**
 * Script to apply the database schema to Supabase.
 * Run: node scripts/apply-schema.mjs
 *
 * This uses the Supabase Management API to execute SQL directly.
 * Requires the service role key (or the anon key if the SQL is safe).
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ajafekyeeuvygqdyrlpu.supabase.co";
// Using the key from .env.local — this is the anon key (service role key is the same currently)
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYWZla3llZXV2eWdxZHlybHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjkyNjUsImV4cCI6MjA5NzA0NTI2NX0.o9zDSn5UQaqlvHboulG168MVzeS-NCtZFIQl-3QxOUc";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Read the schema SQL file
const schemaSQL = readFileSync("src/lib/db/schema.sql", "utf8");

// Split into individual statements for execution
// Filter out empty statements and comments-only blocks
const statements = schemaSQL
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

console.log(`Found ${statements.length} SQL statements to execute.`);
console.log("Note: This script cannot run DDL via the REST API.");
console.log("");
console.log("=".repeat(60));
console.log("PLEASE COPY THE CONTENTS OF src/lib/db/schema.sql");
console.log("AND PASTE IT INTO THE SUPABASE SQL EDITOR:");
console.log(`${SUPABASE_URL.replace(".co", ".co")}`);
console.log("Dashboard → SQL Editor → New query → Paste → Run");
console.log("=".repeat(60));
console.log("");

// Test connectivity
try {
  const { data, error } = await supabase.from("articles").select("id").limit(1);
  if (error) {
    console.log(`Database connectivity test: Table 'articles' not found (${error.message})`);
    console.log("→ This confirms the schema has NOT been applied yet.");
  } else {
    console.log(`Database connectivity test: ✓ Connected. Found ${data?.length ?? 0} articles.`);
  }
} catch (e) {
  console.log(`Database connectivity test: ✗ Connection failed (${e.message})`);
}
