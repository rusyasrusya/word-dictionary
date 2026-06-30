"use client";

import { useState } from "react";
import SearchBar from "./components/SearchBar";
import WordCard, { WordData } from "./components/WordCard";

export default function Home() {
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(word: string) {
    setLoading(true);
    setError(null);
    setWordData(null);

    try {
      const res = await fetch(`/api/word?word=${encodeURIComponent(word)}`);
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Word not found");
        return;
      }
      const data: WordData = await res.json();
      setWordData(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center px-4 py-12 gap-8 min-h-screen">
      <div className="text-center space-y-1">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Word Dictionary</h1>
        <p className="text-gray-400 text-sm">Definitions, etymology, morphology</p>
      </div>

      <SearchBar onSearch={handleSearch} loading={loading} />

      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm mt-4">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Looking up...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 max-w-xl w-full">
          {error}
        </div>
      )}

      {wordData && <WordCard data={wordData} />}

      {!wordData && !loading && !error && (
        <div className="text-center text-gray-300 mt-8 text-sm">
          <p>
            Try:{" "}
            <button onClick={() => handleSearch("language")} className="underline hover:text-gray-400 transition">language</button>
            {", "}
            <button onClick={() => handleSearch("beautiful")} className="underline hover:text-gray-400 transition">beautiful</button>
            {", "}
            <button onClick={() => handleSearch("science")} className="underline hover:text-gray-400 transition">science</button>
          </p>
        </div>
      )}
    </main>
  );
}
