import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Load environment variables manually
const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1]] = val;
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing keys in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function checkPolicies() {
  console.log("Checking pg_policies on Supabase...");
  const { data, error } = await supabase.rpc("pg_get_policies");

  if (error) {
    // If RPC doesn't exist, query pg_policies using custom SQL / select
    // Wait, pg_policies is a system view, we might not be able to select it directly via PostgREST unless exposed, but let's try.
    console.log("pg_get_policies RPC failed, trying direct select on pg_policies...");

    // In PostgREST, we can't query pg_catalog tables unless they are exposed in the schema or we use raw SQL / RPC.
    // Let's see if we can query it or run a test query.
    const { data: policiesData, error: policiesErr } = await supabase
      .from("pg_policies") // this will fail if not exposed in public schema, but worth trying
      .select("*");

    if (policiesErr) {
      console.log("Direct select on pg_policies failed too:", policiesErr.message);

      // Let's test checking policies by running custom SQL via a quick RPC or checking schema migrations
      // Instead, let's list all policies by running a query on a custom RPC if available.
    } else {
      console.log("Policies:", policiesData);
    }
  } else {
    console.log("Policies:", data);
  }

  // Let's run a test insert with anon key to see the exact error message
  console.log("\nTesting anon insert on margin_notes...");
  const anonClient = createClient(supabaseUrl, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Get an article id
  const { data: articles } = await supabase.from("articles").select("id").limit(1);
  if (articles && articles.length > 0) {
    const artId = articles[0].id;
    console.log("Using article id:", artId);

    const res = await anonClient.from("margin_notes").insert({
      article_id: artId,
      author_name: "Test Anon",
      content: "Test note from script",
      status: "pending",
      display_order: 999,
    });
    console.log("margin_notes insert result:", JSON.stringify(res));
  } else {
    console.log("No articles found in DB to test with.");
  }

  console.log("\nTesting anon insert on shared_pages...");
  const res2 = await anonClient.from("shared_pages").insert({
    author_name: "Test Anon Page",
    title: "Test Title",
    content:
      "This is a test content that has to be ten words long or more in order to satisfy validation.",
    word_count: 18,
    status: "pending",
  });
  console.log("shared_pages insert result:", JSON.stringify(res2));
}

checkPolicies();
