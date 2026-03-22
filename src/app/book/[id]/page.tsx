"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiBookmark, FiHeadphones, FiStar, FiTag, FiEye } from "react-icons/fi";
import BackButton from "@/components/shared/BackButton";
import BookDetailActions from "@/components/shared/BookDetailActions";
import BookDetailSkeleton from "@/components/shared/BookDetailSkeleton";
import { getBookById } from "@/lib/books";
import type { Book } from "@/types/book";

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadBook() {
      try {
        setIsLoading(true);
        const nextBook = await getBookById(params.id);

        if (!isCancelled) {
          setBook(nextBook);
          setError(null);
        }
      } catch (nextError) {
        const message =
          nextError instanceof Error
            ? nextError.message
            : "Unable to load this book right now.";

        if (!isCancelled) {
          setError(message);
          setBook(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      isCancelled = true;
    };
  }, [params.id]);

  if (isLoading) {
    return <BookDetailSkeleton />;
  }

  if (error || !book) {
    return (
      <div className="book-detail__error">
        {error ?? "We couldn&apos;t find that book."}
      </div>
    );
  }

  return (
    <div className="book-detail">
      <BackButton className="book-detail__back" />

      <section className="book-detail__hero">
        <div className="book-detail__main">
          <span className="book-detail__eyebrow">Book summary</span>
          <h1 className="book-detail__title">{book.title}</h1>
          <p className="book-detail__author">by {book.author}</p>
          <p className="book-detail__subtitle">{book.subTitle}</p>

          <div className="book-detail__meta">
            <span className="book-detail__meta-item">
              <FiStar />
              {book.averageRating.toFixed(1)} average rating
            </span>
            <span className="book-detail__meta-item">
              <FiHeadphones />
              {book.type}
            </span>
            <span className="book-detail__meta-item">
              <FiBookmark />
              {book.totalRating} ratings
            </span>
            <span className="book-detail__meta-item">
              <FiEye />
              {book.keyIdeas} key Ideas
            </span>
          </div>

          <BookDetailActions
            book={book}
            subscriptionRequired={book.subscriptionRequired}
          />
        </div>

        <div className="book-detail__cover-card">
          <img
            className="book-detail__cover"
            src={book.imageLink}
            alt={`${book.title} cover`}
          />
        </div>
      </section>

      <section className="book-detail__grid book-detail__grid--details">
        <div className="book-detail__panel">
          <h2 className="book-detail__panel-title">What you&apos;ll learn</h2>
          <p className="book-detail__body book-detail__body--compact">
            {book.bookDescription}
          </p>
        </div>

        <div className="book-detail__panel">
          <h2 className="book-detail__panel-title">About the author</h2>
          <p className="book-detail__body">{book.authorDescription}</p>
        </div>
      </section>

      <section className="book-detail__tags-panel">
        <h2 className="book-detail__panel-title">Tags</h2>
        <div className="book-detail__tags">
          {book.tags.map((tag) => (
            <span className="book-detail__tag" key={tag}>
              <FiTag />
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
