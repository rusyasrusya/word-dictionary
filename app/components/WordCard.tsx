"use client";

interface Phonetic {
  text?: string;
  audio?: string;
}

interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

interface EtymologyStep {
  language: string;
  word: string;
  meaning: string;
  isCurrent?: boolean;
}

export interface WordData {
  word: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  etymology?: EtymologyStep[];
  morphology?: {
    root: { text: string; language: string; meaning: string };
    suffix?: { text: string; language: string; meaning: string };
  };
}

const PART_OF_SPEECH_COLORS: Record<string, string> = {
  noun: "bg-blue-100 text-blue-800",
  verb: "bg-green-100 text-green-800",
  adjective: "bg-purple-100 text-purple-800",
  adverb: "bg-orange-100 text-orange-800",
  default: "bg-gray-100 text-gray-700",
};

function getPhoneticText(phonetics: Phonetic[]): string {
  return phonetics.find((p) => p.text)?.text ?? "";
}

function getAudio(phonetics: Phonetic[]): string {
  return phonetics.find((p) => p.audio)?.audio ?? "";
}

function playAudio(url: string) {
  new Audio(url).play();
}

export default function WordCard({ data }: { data: WordData }) {
  const phoneticText = getPhoneticText(data.phonetics);
  const audioUrl = getAudio(data.phonetics);

  const allSynonyms = Array.from(
    new Set(data.meanings.flatMap((m) => [...m.synonyms, ...m.definitions.flatMap((d) => d.synonyms)]))
  ).slice(0, 6);

  const allAntonyms = Array.from(
    new Set(data.meanings.flatMap((m) => [...m.antonyms, ...m.definitions.flatMap((d) => d.antonyms)]))
  ).slice(0, 4);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold italic text-gray-900">{data.word}</h1>
          {phoneticText && <p className="text-gray-400 mt-1 text-sm">{phoneticText}</p>}
        </div>
        {audioUrl && (
          <button
            onClick={() => playAudio(audioUrl)}
            className="mt-1 p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition text-gray-500"
            title="Play pronunciation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12m-4-9v6" />
            </svg>
          </button>
        )}
      </div>

      {/* Morphology */}
      {data.morphology && (
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Morphology</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              <span className="font-bold">{data.morphology.root.text}</span>
              <span className="text-green-600 ml-1">· {data.morphology.root.language} · {data.morphology.root.meaning}</span>
            </span>
            {data.morphology.suffix && (
              <>
                <span className="text-gray-400">+</span>
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                  <span className="font-bold">{data.morphology.suffix.text}</span>
                  <span className="text-yellow-600 ml-1">· {data.morphology.suffix.language} · {data.morphology.suffix.meaning}</span>
                </span>
              </>
            )}
          </div>
        </section>
      )}

      <hr className="border-gray-100" />

      {/* Meanings */}
      <section className="space-y-4">
        {data.meanings.map((meaning, i) => {
          const colorClass = PART_OF_SPEECH_COLORS[meaning.partOfSpeech] ?? PART_OF_SPEECH_COLORS.default;
          return (
            <div key={i}>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${colorClass}`}>
                {meaning.partOfSpeech}
              </span>
              <ol className="space-y-2 list-none">
                {meaning.definitions.slice(0, 3).map((def, j) => (
                  <li key={j} className="text-gray-700 text-sm leading-relaxed">
                    <span className="text-gray-400 mr-1.5">{j + 1}.</span>
                    {def.definition}
                    {def.example && (
                      <p className="text-gray-400 italic mt-0.5 ml-4">"{def.example}"</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </section>

      {/* Etymology chain */}
      {data.etymology && data.etymology.length > 0 && (
        <>
          <hr className="border-gray-100" />
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Etymological chain</p>
            <div className="space-y-2">
              {data.etymology.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center mt-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${step.isCurrent ? "bg-indigo-500" : "bg-gray-300"}`} />
                    {i < data.etymology!.length - 1 && <div className="w-px h-5 bg-gray-200 mt-1" />}
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${step.isCurrent ? "text-indigo-500" : "text-gray-400"}`}>{step.language}</p>
                    <p className="text-sm text-gray-700">
                      <em>{step.word}</em>
                      <span className="text-gray-400"> — "{step.meaning}"</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Synonyms / Antonyms / Similar */}
      {(allSynonyms.length > 0 || allAntonyms.length > 0) && (
        <>
          <hr className="border-gray-100" />
          <section className="grid grid-cols-2 gap-4">
            {allSynonyms.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Similar words</p>
                <p className="text-sm text-gray-700">{allSynonyms.join(", ")}</p>
              </div>
            )}
            {allAntonyms.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Antonyms</p>
                <p className="text-sm text-gray-700">{allAntonyms.join(", ")}</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
