import { NextRequest, NextResponse } from "next/server";

const ETYMOLOGY_MAP: Record<string, {
  morphology?: { root: { text: string; language: string; meaning: string }; suffix?: { text: string; language: string; meaning: string } };
  etymology?: { language: string; word: string; meaning: string; isCurrent?: boolean }[];
}> = {
  language: {
    morphology: {
      root: { text: "lingu-", language: "Latin", meaning: "tongue" },
      suffix: { text: "-age", language: "Latin/French suffix", meaning: "state, action, or product of" },
    },
    etymology: [
      { language: "Latin", word: "lingua", meaning: "tongue, speech, language" },
      { language: "Vulgar Latin", word: "linguaticum", meaning: "of the tongue, speech" },
      { language: "Old French", word: "langage", meaning: "speech, words, oratory; a people, a nation" },
      { language: "Middle English", word: "langage", meaning: "words, what is said, conversation, talk" },
      { language: "English", word: "language", meaning: "a system of communication in speech and writing", isCurrent: true },
    ],
  },
  computer: {
    morphology: {
      root: { text: "comput-", language: "Latin", meaning: "to reckon" },
      suffix: { text: "-er", language: "English suffix", meaning: "one who does" },
    },
    etymology: [
      { language: "Latin", word: "computare", meaning: "to reckon, sum up" },
      { language: "Old French", word: "computer", meaning: "to count" },
      { language: "English", word: "computer", meaning: "one who computes; calculating machine", isCurrent: true },
    ],
  },
  beautiful: {
    morphology: {
      root: { text: "beau-", language: "Old French", meaning: "handsome, beautiful" },
      suffix: { text: "-tiful", language: "English suffix", meaning: "full of" },
    },
    etymology: [
      { language: "Latin", word: "bellus", meaning: "handsome, pretty" },
      { language: "Old French", word: "beau/bel", meaning: "beautiful" },
      { language: "Middle English", word: "beaute", meaning: "beauty, comeliness" },
      { language: "English", word: "beautiful", meaning: "pleasing to the senses or mind", isCurrent: true },
    ],
  },
  science: {
    morphology: {
      root: { text: "sci-", language: "Latin", meaning: "to know" },
      suffix: { text: "-ence", language: "Latin suffix", meaning: "state or quality of" },
    },
    etymology: [
      { language: "Latin", word: "scire", meaning: "to know" },
      { language: "Latin", word: "scientia", meaning: "knowledge" },
      { language: "Old French", word: "science", meaning: "knowledge, learning" },
      { language: "English", word: "science", meaning: "systematic study of the natural world", isCurrent: true },
    ],
  },
};

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word")?.toLowerCase().trim();
  if (!word) {
    return NextResponse.json({ error: "Missing word parameter" }, { status: 400 });
  }

  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
  if (!res.ok) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }

  const data = await res.json();
  const entry = data[0];

  const extra = ETYMOLOGY_MAP[word] ?? {};

  return NextResponse.json({
    word: entry.word,
    phonetics: entry.phonetics ?? [],
    meanings: entry.meanings ?? [],
    morphology: extra.morphology,
    etymology: extra.etymology,
  });
}
