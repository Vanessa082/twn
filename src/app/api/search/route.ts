import { getPopularSearches, getSearchIndex } from "@/modules/search";
import { search } from "@/modules/search";
import { searchQuerySchema } from "@/modules/search";
import { NextResponse } from "next/server";

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = searchQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "That search could not be read." },
      { status: 400 }
    );
  }

  const { q, type, limit } = parsed.data;

  try {
    if (!q) {
      const index = await getSearchIndex();
      const latest = index.docs
        .filter(({ doc }) => doc.type === "note")
        .slice(0, 4)
        .map(({ doc }) => {
          const { body: _body, keywords: _keywords, ...publicDoc } = doc;
          return { ...publicDoc, score: 0 };
        });
      return NextResponse.json(
        { popular: await getPopularSearches(), latest },
        { headers: CACHE_HEADERS }
      );
    }

    const index = await getSearchIndex();
    return NextResponse.json(search(index, q, { type, limit: limit ?? 12 }), {
      headers: CACHE_HEADERS,
    });
  } catch {
    return NextResponse.json(
      { error: "The notebook's index is resting for a moment. Please try again shortly." },
      { status: 503 }
    );
  }
}
