"use client";

import { useState, FormEvent } from "react";

interface SearchBarProps {
  onSearch: (word: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a word..."
        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      />
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {loading ? "..." : "Search"}
      </button>
    </form>
  );
}
