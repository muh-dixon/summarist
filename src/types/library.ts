import type { Book } from "@/types/book";

export interface LibraryEntry {
  book: Book;
  savedAt: string;
  lastOpenedAt: string | null;
  currentTime: number;
  duration: number;
  progressPercent: number;
  isFinished: boolean;
  finishedAt: string | null;
}
