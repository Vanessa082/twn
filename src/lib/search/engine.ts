/**
 * The notebook's search engine: a small, dependency-free ranked retriever.
 *
 * - Normalises accents and case, drops stop words and applies light stemming
 *   so "leading", "leaders" and "lead" meet in the middle.
 * - Expands queries with editorial synonyms ("ai" also finds "machine learning").
 * - Tolerates typos with a bounded Damerau-Levenshtein distance.
 * - Treats the last word as a prefix so results update while typing.
 * - Ranks by field weight (title > keywords > excerpt > body), phrase matches
 *   and recency, and offers a "did you mean" correction when words were fuzzy.
 *
 * Pure functions only, so it runs identically in route handlers and tests.
 */

export const SEARCH_DOC_TYPES = [
  "note",
  "field_note",
  "project",
  "collection",
  "topic",
  "shared_page",
] as const;

export type SearchDocType = (typeof SEARCH_DOC_TYPES)[number];

export interface SearchDocument {
  id: string;
  type: SearchDocType;
  title: string;
  excerpt: string;
  /** Long text searched with the lowest weight and never returned to clients. */
  body?: string;
  keywords?: string[];
  url: string;
  image?: string | null;
  date?: string | null;
  /** Short label shown beside the result, e.g. a chapter or status. */
  meta?: string | null;
}

export type SearchResultItem = Omit<SearchDocument, "body" | "keywords"> & { score: number };

export interface SearchResponse {
  query: string;
  /** Present when typo correction changed at least one word. */
  correctedQuery: string | null;
  total: number;
  counts: Record<SearchDocType, number>;
  results: SearchResultItem[];
  /** Query completions for the word being typed. */
  suggestions: string[];
}

interface SearchOptions {
  type?: SearchDocType | null;
  limit?: number;
  now?: number;
}

const STOP_WORDS = new Set(
  "a an and are as at be but by for from has have how i in is it its of on or so that the this to was what when where which who why will with you your my me we our".split(
    " "
  )
);

const SYNONYM_GROUPS: string[][] = [
  ["ai", "artificial", "intelligence", "machine", "ml", "llm", "gpt"],
  ["career", "job", "work", "profession", "workplace"],
  ["leadership", "leader", "lead", "manager", "management", "managing"],
  ["woman", "women", "female", "girl", "she"],
  ["code", "coding", "programming", "developer", "engineer", "engineering", "software"],
  ["learn", "learning", "study", "education", "teach", "teaching", "mentor", "mentoring"],
  ["community", "network", "belonging", "together"],
  ["reflection", "journal", "thought", "diary"],
  ["robot", "robotics", "nao"],
  ["burnout", "tired", "rest", "exhaustion"],
  ["confidence", "imposter", "impostor", "doubt"],
  ["start", "begin", "beginning", "beginner", "junior"],
  ["build", "building", "project", "ship", "shipping"],
];

const FIELD_WEIGHTS = { title: 6, keywords: 4, excerpt: 2, body: 1 } as const;
type Field = keyof typeof FIELD_WEIGHTS;

const TYPE_PRIOR: Record<SearchDocType, number> = {
  note: 1.15,
  field_note: 1,
  project: 1,
  collection: 0.95,
  topic: 0.9,
  shared_page: 0.85,
};

// ── Text processing ─────────────────────────────────────────────────────────

export function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function stem(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith("ing") && word.length > 5) return undouble(word.slice(0, -3));
  if (word.endsWith("ed") && word.length > 4) return undouble(word.slice(0, -2));
  if (word.endsWith("ers") && word.length > 5) return word.slice(0, -3);
  if (word.endsWith("er") && word.length > 5) return word.slice(0, -2);
  if (word.endsWith("ly") && word.length > 5) return word.slice(0, -2);
  if (/(ss|us|is)$/.test(word)) return word;
  if (/(ches|shes|xes|sses)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
}

function undouble(word: string): string {
  return /([^aeiouls])\1$/.test(word) ? word.slice(0, -1) : word;
}

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((word) => word.length > 0 && !STOP_WORDS.has(word));
}

/** Optimal string alignment distance, abandoned early once it exceeds `max`. */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a === b) return 0;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) => {
    const row = new Array<number>(cols).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j < cols; j++) d[0][j] = j;

  for (let i = 1; i < rows; i++) {
    let rowMin = Number.POSITIVE_INFINITY;
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, d[i - 2][j - 2] + 1);
      }
      d[i][j] = value;
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

function allowedTypos(term: string): number {
  if (term.length >= 8) return 2;
  if (term.length >= 4) return 1;
  return 0;
}

// ── Index ───────────────────────────────────────────────────────────────────

interface IndexedDocument {
  doc: SearchDocument;
  normalizedTitle: string;
  fields: Record<Field, Map<string, number>>;
  timestamp: number | null;
}

export interface SearchIndex {
  docs: IndexedDocument[];
  /** stemmed term → document frequency */
  vocabulary: Map<string, number>;
  /** stemmed term → most frequent original spelling, used for corrections and completions */
  surface: Map<string, string>;
  synonyms: Map<string, string[]>;
}

function termCounts(text: string, surfaceCounts: Map<string, Map<string, number>>) {
  const counts = new Map<string, number>();
  for (const word of tokenize(text)) {
    const term = stem(word);
    counts.set(term, (counts.get(term) ?? 0) + 1);
    const spellings = surfaceCounts.get(term) ?? new Map<string, number>();
    spellings.set(word, (spellings.get(word) ?? 0) + 1);
    surfaceCounts.set(term, spellings);
  }
  return counts;
}

export function buildSearchIndex(documents: SearchDocument[]): SearchIndex {
  const surfaceCounts = new Map<string, Map<string, number>>();
  const vocabulary = new Map<string, number>();

  const docs = documents.map<IndexedDocument>((doc) => {
    const fields: Record<Field, Map<string, number>> = {
      title: termCounts(doc.title, surfaceCounts),
      keywords: termCounts((doc.keywords ?? []).join(" "), surfaceCounts),
      excerpt: termCounts(doc.excerpt, surfaceCounts),
      body: termCounts(doc.body ?? "", surfaceCounts),
    };
    const unique = new Set<string>();
    for (const field of Object.values(fields)) for (const term of field.keys()) unique.add(term);
    for (const term of unique) vocabulary.set(term, (vocabulary.get(term) ?? 0) + 1);

    const time = doc.date ? Date.parse(doc.date) : Number.NaN;
    return {
      doc,
      normalizedTitle: normalize(doc.title),
      fields,
      timestamp: Number.isNaN(time) ? null : time,
    };
  });

  const surface = new Map<string, string>();
  for (const [term, spellings] of surfaceCounts) {
    let best = term;
    let bestCount = -1;
    for (const [word, count] of spellings) {
      if (count > bestCount || (count === bestCount && word.length < best.length)) {
        best = word;
        bestCount = count;
      }
    }
    surface.set(term, best);
  }

  const synonyms = new Map<string, string[]>();
  for (const group of SYNONYM_GROUPS) {
    const stems = [...new Set(group.map(stem))];
    for (const term of stems) {
      synonyms.set(
        term,
        [...new Set([...(synonyms.get(term) ?? []), ...stems])].filter((s) => s !== term)
      );
    }
  }

  return { docs, vocabulary, surface, synonyms };
}

// ── Query ───────────────────────────────────────────────────────────────────

interface TermMatch {
  term: string;
  quality: number;
  fuzzy: boolean;
}

function expandTerm(index: SearchIndex, raw: string, isLast: boolean): TermMatch[] {
  const term = stem(raw);
  const matches = new Map<string, TermMatch>();
  const add = (candidate: string, quality: number, fuzzy: boolean) => {
    const existing = matches.get(candidate);
    if (!existing || existing.quality < quality)
      matches.set(candidate, { term: candidate, quality, fuzzy });
  };

  const typos = allowedTypos(raw);
  const canPrefix = (isLast || raw.length >= 4) && raw.length >= 2;
  for (const candidate of index.vocabulary.keys()) {
    const word = index.surface.get(candidate) ?? candidate;
    if (candidate === term || word === raw) {
      add(candidate, 1, false);
    } else if (canPrefix && (candidate.startsWith(raw) || word.startsWith(raw))) {
      add(candidate, isLast ? 0.85 : 0.7, false);
    } else if (typos > 0 && candidate.length >= 3) {
      const distance = Math.min(
        editDistance(term, candidate, typos),
        editDistance(raw, word, typos)
      );
      if (distance <= typos) add(candidate, distance === 1 ? 0.6 : 0.4, true);
    }
  }

  for (const synonym of index.synonyms.get(term) ?? []) {
    if (index.vocabulary.has(synonym)) add(synonym, 0.55, false);
  }

  return [...matches.values()];
}

function emptyCounts(): Record<SearchDocType, number> {
  return Object.fromEntries(SEARCH_DOC_TYPES.map((type) => [type, 0])) as Record<
    SearchDocType,
    number
  >;
}

export function suggestCompletions(index: SearchIndex, query: string, limit = 6): string[] {
  const words = normalize(query).split(" ").filter(Boolean);
  const last = words.at(-1);
  if (!last || last.length < 2) return [];
  const head = words.slice(0, -1).join(" ");

  const candidates = [...index.vocabulary.entries()]
    .map(([term, frequency]) => ({ word: index.surface.get(term) ?? term, frequency }))
    .filter(({ word }) => word.startsWith(last) && word !== last && word.length > 2)
    .sort((a, b) => b.frequency - a.frequency || a.word.length - b.word.length);

  const titleMatches = index.docs
    .filter(({ normalizedTitle }) => normalizedTitle.includes(normalize(query)))
    .map(({ doc }) => doc.title.toLowerCase());

  const completions = [
    ...candidates.map(({ word }) => (head ? `${head} ${word}` : word)),
    ...titleMatches,
  ];
  return [...new Set(completions)].slice(0, limit);
}

export function search(
  index: SearchIndex,
  rawQuery: string,
  options: SearchOptions = {}
): SearchResponse {
  const query = rawQuery.trim().slice(0, 120);
  const limit = Math.max(1, Math.min(options.limit ?? 20, 50));
  const now = options.now ?? Date.now();
  const words = tokenize(query);
  const empty: SearchResponse = {
    query,
    correctedQuery: null,
    total: 0,
    counts: emptyCounts(),
    results: [],
    suggestions: [],
  };
  if (words.length === 0) return empty;

  const expansions = words.map((word, i) => expandTerm(index, word, i === words.length - 1));
  const totalDocs = Math.max(index.docs.length, 1);
  const normalizedQuery = normalize(query);

  const scoreDocs = (requireAll: boolean) => {
    const scored: { item: IndexedDocument; score: number }[] = [];
    for (const item of index.docs) {
      let score = 0;
      let matchedWords = 0;
      for (const matches of expansions) {
        let best = 0;
        for (const match of matches) {
          const idf = Math.log(1 + totalDocs / (index.vocabulary.get(match.term) ?? 1));
          for (const field of Object.keys(FIELD_WEIGHTS) as Field[]) {
            const tf = item.fields[field].get(match.term);
            if (!tf) continue;
            const value = FIELD_WEIGHTS[field] * match.quality * idf * (1 + Math.log(tf));
            if (value > best) best = value;
          }
        }
        if (best > 0) matchedWords++;
        score += best;
      }
      if (matchedWords === 0 || (requireAll && matchedWords < expansions.length)) continue;
      if (!requireAll) score *= matchedWords / expansions.length;

      if (normalizedQuery.length > 2) {
        if (item.normalizedTitle === normalizedQuery) score += 25;
        else if (item.normalizedTitle.startsWith(normalizedQuery)) score += 12;
        else if (item.normalizedTitle.includes(normalizedQuery)) score += 8;
      }
      if (item.timestamp) {
        const ageDays = Math.max(0, (now - item.timestamp) / 86_400_000);
        score *= 1 + 0.25 * Math.exp(-ageDays / 120);
      }
      score *= TYPE_PRIOR[item.doc.type];
      scored.push({ item, score });
    }
    return scored;
  };

  let scored = scoreDocs(true);
  if (scored.length === 0 && expansions.length > 1) scored = scoreDocs(false);
  scored.sort((a, b) => b.score - a.score);

  const counts = emptyCounts();
  for (const { item } of scored) counts[item.doc.type]++;

  const filtered = options.type
    ? scored.filter(({ item }) => item.doc.type === options.type)
    : scored;

  let corrected = false;
  const correctedWords = words.map((word, i) => {
    const matches = expansions[i];
    if (matches.some((m) => !m.fuzzy && m.quality >= 0.7)) return word;
    const best = matches
      .filter((m) => m.fuzzy)
      .sort(
        (a, b) =>
          b.quality - a.quality ||
          (index.vocabulary.get(b.term) ?? 0) - (index.vocabulary.get(a.term) ?? 0)
      )[0];
    if (!best) return word;
    corrected = true;
    return index.surface.get(best.term) ?? best.term;
  });

  return {
    query,
    correctedQuery: corrected ? correctedWords.join(" ") : null,
    total: filtered.length,
    counts,
    results: filtered.slice(0, limit).map(({ item, score }) => {
      const { body: _body, keywords: _keywords, ...publicDoc } = item.doc;
      return { ...publicDoc, score: Math.round(score * 100) / 100 };
    }),
    suggestions: suggestCompletions(index, query),
  };
}
