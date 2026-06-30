import { NextRequest, NextResponse } from "next/server";

const WIKTIONARY_API = "https://en.wiktionary.org/w/api.php";
const FREE_DICT_API = "https://api.dictionaryapi.dev/api/v2/entries/en";

async function getEtymologyText(word: string): Promise<string | null> {
  const sectionsRes = await fetch(
    `${WIKTIONARY_API}?action=parse&page=${encodeURIComponent(word)}&prop=sections&format=json`,
    { next: { revalidate: 86400 } }
  );
  if (!sectionsRes.ok) return null;
  const sectionsData = await sectionsRes.json();
  const sections: { index: string; line: string }[] = sectionsData?.parse?.sections ?? [];

  const etymSection = sections.find((s) =>
    s.line.toLowerCase().startsWith("etymology")
  );
  if (!etymSection) return null;

  const htmlRes = await fetch(
    `${WIKTIONARY_API}?action=parse&page=${encodeURIComponent(word)}&prop=text&section=${etymSection.index}&format=json`,
    { next: { revalidate: 86400 } }
  );
  if (!htmlRes.ok) return null;
  const htmlData = await htmlRes.json();
  const html: string = htmlData?.parse?.text?.["*"] ?? "";

  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)];
  for (const [, inner] of paragraphs) {
    const text = inner
      .replace(/<[^>]+>/g, "")
      .replace(/&#?\w+;/g, "")
      .replace(/\[edit\]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > 20) return text;
  }
  return null;
}

async function getWiktionaryDefinitions(word: string) {
  const res = await fetch(
    `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const entries: { partOfSpeech: string; definitions: { definition: string; parsedExamples?: { example: string }[] }[] }[] =
    data?.en ?? [];

  return entries.slice(0, 4).map((entry) => ({
    partOfSpeech: entry.partOfSpeech,
    definitions: entry.definitions.slice(0, 3).map((d) => ({
      definition: d.definition.replace(/<[^>]+>/g, "").trim(),
      example: d.parsedExamples?.[0]?.example?.replace(/<[^>]+>/g, "").trim(),
      synonyms: [] as string[],
      antonyms: [] as string[],
    })),
    synonyms: [] as string[],
    antonyms: [] as string[],
  }));
}

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word")?.toLowerCase().trim();
  if (!word) {
    return NextResponse.json({ error: "Missing word parameter" }, { status: 400 });
  }

  const [wiktDefs, etymText, freeDictRes] = await Promise.all([
    getWiktionaryDefinitions(word),
    getEtymologyText(word),
    fetch(`${FREE_DICT_API}/${encodeURIComponent(word)}`),
  ]);

  const phonetics: { text?: string; audio?: string }[] = [];
  let freeMeanings: unknown[] = [];

  if (freeDictRes.ok) {
    const freeDictData = await freeDictRes.json();
    const entry = freeDictData[0];
    phonetics.push(...(entry?.phonetics ?? []));
    freeMeanings = entry?.meanings ?? [];
  }

  const meanings = wiktDefs && wiktDefs.length > 0 ? wiktDefs : freeMeanings;

  if (meanings.length === 0) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }

  return NextResponse.json({
    word,
    phonetics,
    meanings,
    etymologyText: etymText ?? null,
  });
}
