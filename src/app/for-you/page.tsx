"use client";

import { useEffect, useState } from "react";
import BookCard from "@/components/shared/BookCard";
import BookCarouselSection from "@/components/shared/BookCarouselSection";
import {
  BookCardSkeleton,
  SelectedBookSkeleton,
} from "@/components/shared/BookSkeleton";
import SelectedBookPanel from "@/components/shared/SelectedBookPanel";
import {
  getRecommendedBooks,
  getSelectedBook,
  getSuggestedBooks,
} from "@/lib/books";
import type { Book } from "@/types/book";

type PageState = {
  selectedBook: Book | null;
  recommendedBooks: Book[];
  suggestedBooks: Book[];
  isLoading: boolean;
  error: string | null;
};

const initialState: PageState = {
  selectedBook: null,
  recommendedBooks: [],
  suggestedBooks: [],
  isLoading: true,
  error: null,
};

export default function ForYouPage() {
  const [state, setState] = useState<PageState>(initialState);

  useEffect(() => {
    let isCancelled = false;

    async function loadBooks() {
      try {
        const [selectedBook, recommendedBooks, suggestedBooks] =
          await Promise.all([
            getSelectedBook(),
            getRecommendedBooks(),
            getSuggestedBooks(),
          ]);

        if (!isCancelled) {
          setState({
            selectedBook,
            recommendedBooks,
            suggestedBooks,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load your recommendations right now.";

        if (!isCancelled) {
          setState((previous) => ({
            ...previous,
            isLoading: false,
            error: message,
          }));
        }
      }
    }

    loadBooks();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="for-you-page">
      <div className="for-you-page__intro">
        <span className="for-you-page__eyebrow">Your reading dashboard</span>
        <h1 className="for-you-page__title">For you</h1>
        <p className="for-you-page__subtitle">
          Pick up where curiosity left off with your featured summary, smart
          recommendations, and fresh suggestions.
        </p>
      </div>

      {state.error && (
        <div className="for-you-page__error">
          {state.error}
        </div>
      )}

      {state.isLoading ? (
        <SelectedBookSkeleton />
      ) : state.selectedBook ? (
        <SelectedBookPanel book={state.selectedBook} />
      ) : null}

      <BookCarouselSection
        title="Recommended reads"
        description="A focused set of ideas aligned with your current interests."
      >
        {state.isLoading
          ? <BookCardSkeleton count={4} />
          : state.recommendedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
      </BookCarouselSection>

      <BookCarouselSection
        title="Suggested by Summarist"
        description="Explore books that broaden your perspective and keep momentum going."
      >
        {state.isLoading
          ? <BookCardSkeleton count={4} />
          : state.suggestedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
      </BookCarouselSection>
    </div>
  );
}
