import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Book } from "@/types/book";
import type { LibraryEntry } from "@/types/library";

interface LibraryState {
  items: LibraryEntry[];
  initialized: boolean;
}

const initialState: LibraryState = {
  items: [],
  initialized: false,
};

function buildEntry(book: Book): LibraryEntry {
  return {
    book,
    savedAt: new Date().toISOString(),
    lastOpenedAt: null,
    currentTime: 0,
    duration: 0,
    progressPercent: 0,
    isFinished: false,
    finishedAt: null,
  };
}

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    setLibrary(state, action: PayloadAction<LibraryEntry[]>) {
      state.items = action.payload;
      state.initialized = true;
    },
    clearLibrary(state) {
      state.items = [];
      state.initialized = true;
    },
    addLibraryBook(state, action: PayloadAction<Book>) {
      const existingEntry = state.items.find(
        (entry) => entry.book.id === action.payload.id,
      );

      if (existingEntry) {
        return;
      }

      state.items.unshift(buildEntry(action.payload));
    },
    removeLibraryBook(state, action: PayloadAction<string>) {
      state.items = state.items.filter((entry) => entry.book.id !== action.payload);
    },
    upsertLibraryEntry(state, action: PayloadAction<LibraryEntry>) {
      const existingIndex = state.items.findIndex(
        (entry) => entry.book.id === action.payload.book.id,
      );

      if (existingIndex === -1) {
        state.items.unshift(action.payload);
        return;
      }

      state.items[existingIndex] = action.payload;
    },
    updateLibraryProgress(
      state,
      action: PayloadAction<{
        book: Book;
        currentTime: number;
        duration: number;
        progressPercent: number;
        isFinished: boolean;
      }>,
    ) {
      const { book, currentTime, duration, progressPercent, isFinished } =
        action.payload;
      const now = new Date().toISOString();
      const existingEntry = state.items.find((entry) => entry.book.id === book.id);

      if (!existingEntry) {
        state.items.unshift({
          ...buildEntry(book),
          currentTime,
          duration,
          progressPercent,
          lastOpenedAt: now,
          isFinished,
          finishedAt: isFinished ? now : null,
        });
        return;
      }

      existingEntry.book = book;
      existingEntry.currentTime = currentTime;
      existingEntry.duration = duration;
      existingEntry.progressPercent = progressPercent;
      existingEntry.lastOpenedAt = now;
      existingEntry.isFinished = isFinished;
      existingEntry.finishedAt = isFinished
        ? existingEntry.finishedAt ?? now
        : null;
    },
  },
});

export const {
  setLibrary,
  clearLibrary,
  addLibraryBook,
  removeLibraryBook,
  upsertLibraryEntry,
  updateLibraryProgress,
} = librarySlice.actions;

export default librarySlice.reducer;
