import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log("--- STARTING E2E DB TESTS (ANON KEY) ---");

  // 1. Test Newsletter Subscription
  console.log("\n1. Testing Newsletter Subscription...");
  const email = `test-${Date.now()}@example.com`;
  const { error: subErr } = await supabase.from("subscribers").insert({ email });
  if (subErr) console.error("❌ Newsletter failed:", subErr.message);
  else console.log("✅ Newsletter subscription successful");

  // 2. Test Leave a Page (Shared Pages)
  console.log('\n2. Testing "Leave a Page" Submission...');
  const { error: pageErr } = await supabase.from("shared_pages").insert({
    author_name: "Jane Doe",
    title: "A Moment of Clarity",
    content:
      "Today I realized that simple solutions are often the hardest to discover, but they are always the most rewarding to implement.",
    word_count: 21,
    status: "pending",
  });
  if (pageErr) console.error("❌ Shared Page failed:", pageErr.message);
  else console.log("✅ Shared Page submitted successfully");

  // 3. Test Margin Note
  console.log("\n3. Testing Margin Note Submission...");
  // First, we need an article to attach the note to. Let's create a test article using Service Role Key.
  const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: article, error: artErr } = await adminClient
    .from("articles")
    .insert({
      title: "Test Article",
      slug: `test-article-${Date.now()}`,
      excerpt: "Test excerpt",
      content: "Test content",
      status: "published",
    })
    .select()
    .single();

  if (artErr) {
    console.error("❌ Failed to setup test article:", artErr.message);
  } else {
    // Now test Margin Note insert with Anon Key
    const { error: mnErr } = await supabase.from("margin_notes").insert({
      article_id: article.id,
      author_name: "Tester",
      content: "Thoughtful designs always stand the test of time.",
      status: "pending",
    });
    if (mnErr) console.error("❌ Margin Note failed:", mnErr.message);
    else console.log("✅ Margin Note submitted successfully");
  }

  console.log("\n--- TESTS COMPLETED ---");
}

runTests();
