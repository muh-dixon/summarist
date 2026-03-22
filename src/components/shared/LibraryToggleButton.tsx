"use client";

import { FiBookmark, FiCheck } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import {
  removeStoredLibraryEntry,
  upsertLibraryEntry as persistLibraryEntry,
} from "@/lib/userProfiles";
import {
  addLibraryBook,
  removeLibraryBook,
  upsertLibraryEntry,
} from "@/redux/features/librarySlice";
import { selectCurrentUser, selectLibraryItems } from "@/redux/selectors";
import { openAuthModal } from "@/redux/features/uiSlice";
import type { Book } from "@/types/book";

type LibraryToggleButtonProps = {
  book: Book;
};

export default function LibraryToggleButton({
  book,
}: LibraryToggleButtonProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const libraryItems = useAppSelector(selectLibraryItems);
  const existingEntry = libraryItems.find((entry) => entry.book.id === book.id);
  const isSaved = libraryItems.some((entry) => entry.book.id === book.id);

  function handleToggle() {
    if (!currentUser) {
      dispatch(
        openAuthModal({
          mode: "login",
          redirectTo: `/book/${book.id}`,
        }),
      );
      return;
    }

    if (isSaved) {
      dispatch(removeLibraryBook(book.id));
      void removeStoredLibraryEntry(currentUser.uid, book.id).catch(() => {
        if (existingEntry) {
          dispatch(upsertLibraryEntry(existingEntry));
        } else {
          dispatch(addLibraryBook(book));
        }
      });
      return;
    }

    dispatch(addLibraryBook(book));
    void persistLibraryEntry(currentUser.uid, {
      book,
      savedAt: existingEntry?.savedAt ?? new Date().toISOString(),
      lastOpenedAt: existingEntry?.lastOpenedAt ?? null,
      currentTime: existingEntry?.currentTime ?? 0,
      duration: existingEntry?.duration ?? 0,
      progressPercent: existingEntry?.progressPercent ?? 0,
      isFinished: existingEntry?.isFinished ?? false,
      finishedAt: existingEntry?.finishedAt ?? null,
    }).catch(() => {
      dispatch(removeLibraryBook(book.id));
    });
  }

  return (
    <button
      className={`book-detail__btn book-detail__btn--ghost${
        isSaved ? " book-detail__btn--saved" : ""
      }`}
      type="button"
      onClick={handleToggle}
    >
      {isSaved ? <FiCheck /> : <FiBookmark />}
      {isSaved ? "Saved" : "Save to library"}
    </button>
  );
}
