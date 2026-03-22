"use client";

import Link from "next/link";
import { FiHeadphones, FiLock, FiStar } from "react-icons/fi";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { selectCurrentUser } from "@/redux/selectors";
import type { Book } from "@/types/book";

type BookCardProps = {
  book: Book;
};

function formatRating(rating: number) {
  if (Number.isNaN(rating)) {
    return "0.0";
  }

  return rating.toFixed(1);
}

export default function BookCard({ book }: BookCardProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const hasPremiumAccess = Boolean(currentUser?.subscription.isActive);

  return (
    <Link href={`/book/${book.id}`} className="book-card">
      <div className="book-card__image-wrapper">
        {book.subscriptionRequired && (
          <span
            className={`book-card__pill${
              hasPremiumAccess ? " book-card__pill--active" : ""
            }`}
          >
            {hasPremiumAccess ? <FiStar /> : <FiLock />}
            Premium
          </span>
        )}
        <img
          className="book-card__image"
          src={book.imageLink}
          alt={`${book.title} cover`}
        />
      </div>

      <div className="book-card__body">
        <span className="book-card__author">{book.author}</span>
        <h3 className="book-card__title">{book.title}</h3>
        <p className="book-card__subtitle">{book.subTitle}</p>

        <div className="book-card__meta">
          <span className="book-card__meta-item">
            <FiStar />
            {formatRating(book.averageRating)}
          </span>
          <span className="book-card__meta-item">
            <FiHeadphones />
            {book.type}
          </span>
        </div>
      </div>
    </Link>
  );
}
