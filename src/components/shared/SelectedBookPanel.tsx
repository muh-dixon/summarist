import Link from "next/link";
import { FiArrowRight, FiBookOpen, FiHeadphones, FiZap } from "react-icons/fi";
import type { Book } from "@/types/book";

type SelectedBookPanelProps = {
  book: Book;
};

export default function SelectedBookPanel({
  book,
}: SelectedBookPanelProps) {
  return (
    <section className="selected-book">
      <div className="selected-book__content">
        <span className="selected-book__eyebrow">Selected for you</span>
        <h1 className="selected-book__title">{book.title}</h1>
        <p className="selected-book__author">by {book.author}</p>
        <p className="selected-book__subtitle">{book.subTitle}</p>

        <div className="selected-book__tags">
          {book.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="selected-book__tag">
              <FiZap />
              {tag}
            </span>
          ))}
        </div>

        <p className="selected-book__summary">{book.bookDescription}</p>

        <div className="selected-book__actions">
          <Link href={`/book/${book.id}`} className="btn selected-book__btn">
            <FiBookOpen />
            Read
          </Link>
          <Link
            href={`/book/${book.id}`}
            className="selected-book__btn selected-book__btn--secondary"
          >
            <FiHeadphones />
            Listen
          </Link>
        </div>

        <Link href={`/book/${book.id}`} className="selected-book__link">
          View full book details
          <FiArrowRight />
        </Link>
      </div>

      <div className="selected-book__visual">
        <img
          className="selected-book__image"
          src={book.imageLink}
          alt={`${book.title} cover`}
        />
      </div>
    </section>
  );
}
