"use client";

import { useRouter } from "next/navigation";
import { FiBookOpen, FiHeadphones, FiLock, FiStar } from "react-icons/fi";
import LibraryToggleButton from "@/components/shared/LibraryToggleButton";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { openAuthModal } from "@/redux/features/uiSlice";
import { selectCurrentUser } from "@/redux/selectors";
import type { Book } from "@/types/book";

type BookDetailActionsProps = {
  book: Book;
  subscriptionRequired: boolean;
};

export default function BookDetailActions({
  book,
  subscriptionRequired,
}: BookDetailActionsProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const hasPremiumAccess = Boolean(currentUser?.subscription.isActive);

  const handleStart = () => {
    if (!currentUser) {
      dispatch(
        openAuthModal({
          mode: "login",
          redirectTo: subscriptionRequired ? "/choose-plan" : `/player/${book.id}`,
        })
      );
      return;
    }

    if (subscriptionRequired && !hasPremiumAccess) {
      router.push("/choose-plan");
      return;
    }

    router.push(`/player/${book.id}`);
  };

  return (
    <div className="book-detail__actions">
      <button className="btn book-detail__btn" type="button" onClick={handleStart}>
        <FiBookOpen />
        Read
      </button>

      <button
        className="book-detail__btn book-detail__btn--secondary"
        type="button"
        onClick={handleStart}
      >
        <FiHeadphones />
        Listen
      </button>

      <LibraryToggleButton book={book} />

      {subscriptionRequired && (
        <div className="book-detail__premium-note">
          {hasPremiumAccess ? <FiStar /> : <FiLock />}
          {hasPremiumAccess
            ? "Premium access active."
            : "Premium access required unless your subscription is active."}
        </div>
      )}
    </div>
  );
}
