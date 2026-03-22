"use client";

import Link from "next/link";
import { FiArrowRight, FiBookOpen, FiCheckCircle, FiClock, FiHeadphones } from "react-icons/fi";
import LoginButton from "@/components/shared/LoginButton";
import { useAppSelector } from "@/hooks/useAppDispatch";
import {
  selectAuthInitialized,
  selectCurrentUser,
  selectLibraryItems,
} from "@/redux/selectors";

function formatProgress(progressPercent: number) {
  return `${Math.round(progressPercent)}% complete`;
}

export default function LibraryPage() {
  const authInitialized = useAppSelector(selectAuthInitialized);
  const currentUser = useAppSelector(selectCurrentUser);
  const libraryItems = useAppSelector(selectLibraryItems);

  const savedItems = [...libraryItems].sort((left, right) =>
    right.savedAt.localeCompare(left.savedAt),
  );
  const finishedItems = savedItems.filter((entry) => entry.isFinished);
  const activeSavedItems = savedItems.filter((entry) => !entry.isFinished);
  const inProgressItems = savedItems.filter(
    (entry) => !entry.isFinished && entry.progressPercent > 0,
  );

  if (!authInitialized) {
    return (
      <div className="library-page">
        <section className="library-page__hero">
          <span className="library-page__eyebrow">My library</span>
          <h1 className="library-page__title">Loading your library</h1>
          <p className="library-page__subtitle">
            Pulling in saved books, in-progress listening, and finished titles.
          </p>
        </section>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="library-page">
        <section className="library-page__hero">
          <span className="library-page__eyebrow">My library</span>
          <h1 className="library-page__title">Save books and keep your progress in one place</h1>
          <p className="library-page__subtitle">
            Sign in to build your personal library, track progress, and revisit
            the books you&apos;ve already finished.
          </p>
        </section>

        <section className="library-page__empty-card">
          <h2 className="library-page__section-title">You&apos;re currently signed out</h2>
          <p className="library-page__copy">
            Log in to save books from the detail page and have your library follow
            you across the app.
          </p>
          <div className="library-page__actions">
            <LoginButton className="btn library-page__btn">Log in</LoginButton>
            <Link href="/for-you" className="library-page__btn library-page__btn--secondary">
              Browse books
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (savedItems.length === 0) {
    return (
      <div className="library-page">
        <section className="library-page__hero">
          <span className="library-page__eyebrow">My library</span>
          <h1 className="library-page__title">Your saved books will show up here</h1>
          <p className="library-page__subtitle">
            Save a title from its book page and we&apos;ll keep track of it here,
            including your listening progress and completed reads.
          </p>
        </section>

        <section className="library-page__empty-card">
          <h2 className="library-page__section-title">Nothing saved yet</h2>
          <p className="library-page__copy">
            Head to your recommendations and save a few books to start building
            your library.
          </p>
          <div className="library-page__actions">
            <Link href="/for-you" className="btn library-page__btn">
              Explore for you
              <FiArrowRight />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="library-page">
      <section className="library-page__hero">
        <span className="library-page__eyebrow">My library</span>
        <h1 className="library-page__title">Your saved and completed books</h1>
        <p className="library-page__subtitle">
          Pick up where you left off, revisit finished titles, and keep your
          personal reading stack organized.
        </p>
      </section>

      {inProgressItems.length > 0 ? (
        <section className="library-page__section">
          <div className="library-page__section-head">
            <div>
              <h2 className="library-page__section-title">In progress</h2>
              <p className="library-page__copy">Books you&apos;ve already started in the player.</p>
            </div>
          </div>

          <div className="library-page__grid">
            {inProgressItems.map((entry) => (
              <Link className="library-page__card" href={`/player/${entry.book.id}`} key={entry.book.id}>
                <div className="library-page__image-wrap">
                  <img
                    className="library-page__image"
                    src={entry.book.imageLink}
                    alt={`${entry.book.title} cover`}
                  />
                </div>
                <div className="library-page__card-body">
                  <span className="library-page__author">{entry.book.author}</span>
                  <h3 className="library-page__card-title">{entry.book.title}</h3>
                  <p className="library-page__card-subtitle">{entry.book.subTitle}</p>
                  <div className="library-page__progress">
                    <div className="library-page__progress-bar">
                      <span
                        className="library-page__progress-fill"
                        style={{ width: `${entry.progressPercent}%` }}
                      />
                    </div>
                    <span className="library-page__progress-label">
                      {formatProgress(entry.progressPercent)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="library-page__section">
        <div className="library-page__section-head">
          <div>
            <h2 className="library-page__section-title">Saved books</h2>
            <p className="library-page__copy">Everything you&apos;ve added from the book detail page.</p>
          </div>
        </div>

        <div className="library-page__grid">
          {activeSavedItems.map((entry) => (
            <Link className="library-page__card" href={`/book/${entry.book.id}`} key={entry.book.id}>
              <div className="library-page__image-wrap">
                <img
                  className="library-page__image"
                  src={entry.book.imageLink}
                  alt={`${entry.book.title} cover`}
                />
              </div>
              <div className="library-page__card-body">
                <span className="library-page__author">{entry.book.author}</span>
                <h3 className="library-page__card-title">{entry.book.title}</h3>
                <p className="library-page__card-subtitle">{entry.book.subTitle}</p>
                <div className="library-page__meta">
                  <span className="library-page__meta-item">
                    <FiBookOpen />
                    Saved
                  </span>
                  <span className="library-page__meta-item">
                    <FiHeadphones />
                    {entry.book.type}
                  </span>
                  {entry.progressPercent > 0 ? (
                    <span className="library-page__meta-item">
                      <FiClock />
                      {formatProgress(entry.progressPercent)}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {finishedItems.length > 0 ? (
        <section className="library-page__section">
          <div className="library-page__section-head">
            <div>
              <h2 className="library-page__section-title">Finished</h2>
              <p className="library-page__copy">Books you&apos;ve completed in the player.</p>
            </div>
          </div>

          <div className="library-page__grid">
            {finishedItems.map((entry) => (
              <Link className="library-page__card" href={`/player/${entry.book.id}`} key={`finished-${entry.book.id}`}>
                <div className="library-page__image-wrap">
                  <img
                    className="library-page__image"
                    src={entry.book.imageLink}
                    alt={`${entry.book.title} cover`}
                  />
                  <span className="library-page__pill library-page__pill--finished">
                    <FiCheckCircle />
                    Completed
                  </span>
                </div>
                <div className="library-page__card-body">
                  <span className="library-page__author">{entry.book.author}</span>
                  <h3 className="library-page__card-title">{entry.book.title}</h3>
                  <p className="library-page__card-subtitle">{entry.book.subTitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
