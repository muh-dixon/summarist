"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useDebounce } from "@/hooks/useDebounce";
import { searchBooks } from "@/lib/books";
import type { Book } from "@/types/book";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    let isCancelled = false;

    async function runSearch() {
      const trimmedQuery = debouncedQuery.trim();

      if (!trimmedQuery) {
        setResults([]);
        setHasSearched(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const books = await searchBooks(trimmedQuery);

        if (!isCancelled) {
          setResults(Array.isArray(books) ? books : []);
        }
      } catch {
        if (!isCancelled) {
          setResults([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    runSearch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <div className="searchbar">
      <div className="searchbar__input-wrapper">
        <FiSearch className="searchbar__icon" />
        <input
          className="searchbar__input"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title or author"
          aria-label="Search by title or author"
        />
      </div>

      {(isLoading || hasSearched) && (
        <div className="searchbar__results">
          {isLoading && <div className="searchbar__status">Searching...</div>}

          {!isLoading && results.length === 0 && (
            <div className="searchbar__status">No books found.</div>
          )}

          {!isLoading &&
            results.slice(0, 6).map((book) => (
              <Link
                key={book.id}
                href={`/book/${book.id}`}
                className="searchbar__result"
              >
                <span className="searchbar__result-title">{book.title}</span>
                <span className="searchbar__result-author">{book.author}</span>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
