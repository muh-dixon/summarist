import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type { AuthUser } from "@/types/auth";
import type { Book } from "@/types/book";
import type { LibraryEntry } from "@/types/library";
import type { SubscriptionState } from "@/types/subscription";

const LIBRARY_STORAGE_PREFIX = "summarist-library";

export const defaultSubscription: SubscriptionState = {
  isActive: false,
  tier: "basic",
  interval: null,
  trialEndsAt: null,
  currentPeriodEnd: null,
};

export const guestSubscription: SubscriptionState = {
  isActive: true,
  tier: "premium",
  interval: null,
  trialEndsAt: null,
  currentPeriodEnd: null,
};

type UserProfileDocument = {
  email?: string | null;
  isGuest?: boolean;
  subscription?: Partial<SubscriptionState>;
};

function normalizeSubscription(
  value: Partial<SubscriptionState> | undefined,
  fallback: SubscriptionState,
): SubscriptionState {
  if (!value) {
    return fallback;
  }

  return {
    isActive: value.isActive ?? fallback.isActive,
    tier: value.tier ?? fallback.tier,
    interval: value.interval ?? fallback.interval,
    trialEndsAt: value.trialEndsAt ?? fallback.trialEndsAt,
    currentPeriodEnd: value.currentPeriodEnd ?? fallback.currentPeriodEnd,
  };
}

export async function getStoredSubscription(
  uid: string,
  fallback: SubscriptionState,
) {
  if (!db) {
    return fallback;
  }

  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    return fallback;
  }

  const data = snapshot.data() as UserProfileDocument;
  return normalizeSubscription(data.subscription, fallback);
}

export async function upsertUserProfile(user: AuthUser) {
  if (!db) {
    return;
  }

  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      isGuest: user.isGuest,
      subscription: user.subscription,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateStoredSubscription(
  uid: string,
  subscription: SubscriptionState,
) {
  if (!db) {
    return;
  }

  await setDoc(
    doc(db, "users", uid),
    {
      subscription,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

type LibraryEntryDocument = {
  book?: Book;
  savedAt?: string;
  lastOpenedAt?: string | null;
  currentTime?: number;
  duration?: number;
  progressPercent?: number;
  isFinished?: boolean;
  finishedAt?: string | null;
};

function normalizeLibraryEntry(
  value: LibraryEntryDocument,
  fallbackBook: Book,
): LibraryEntry {
  return {
    book: value.book ?? fallbackBook,
    savedAt: value.savedAt ?? new Date().toISOString(),
    lastOpenedAt: value.lastOpenedAt ?? null,
    currentTime: value.currentTime ?? 0,
    duration: value.duration ?? 0,
    progressPercent: value.progressPercent ?? 0,
    isFinished: value.isFinished ?? false,
    finishedAt: value.finishedAt ?? null,
  };
}

function getLibraryStorageKey(uid: string) {
  return `${LIBRARY_STORAGE_PREFIX}:${uid}`;
}

export function getCachedLibrary(uid: string) {
  if (typeof window === "undefined") {
    return [] as LibraryEntry[];
  }

  try {
    const rawValue = window.localStorage.getItem(getLibraryStorageKey(uid));

    if (!rawValue) {
      return [] as LibraryEntry[];
    }

    const parsed = JSON.parse(rawValue) as LibraryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as LibraryEntry[];
  }
}

function writeCachedLibrary(uid: string, entries: LibraryEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(getLibraryStorageKey(uid), JSON.stringify(entries));
  } catch {
    // Ignore local cache write failures and keep app behavior moving.
  }
}

function upsertCachedLibraryEntry(uid: string, entry: LibraryEntry) {
  const currentEntries = getCachedLibrary(uid);
  const existingIndex = currentEntries.findIndex(
    (currentEntry) => currentEntry.book.id === entry.book.id,
  );

  if (existingIndex === -1) {
    writeCachedLibrary(uid, [entry, ...currentEntries]);
    return;
  }

  const nextEntries = [...currentEntries];
  nextEntries[existingIndex] = entry;
  writeCachedLibrary(uid, nextEntries);
}

function removeCachedLibraryEntry(uid: string, bookId: string) {
  const nextEntries = getCachedLibrary(uid).filter(
    (entry) => entry.book.id !== bookId,
  );
  writeCachedLibrary(uid, nextEntries);
}

export async function getStoredLibrary(uid: string) {
  const cachedEntries = getCachedLibrary(uid);

  if (!db) {
    return cachedEntries;
  }

  try {
    const snapshot = await getDocs(collection(db, "users", uid, "library"));

    const remoteEntries = snapshot.docs
      .map((documentSnapshot) => {
        const data = documentSnapshot.data() as LibraryEntryDocument;

        if (!data.book) {
          return null;
        }

        return normalizeLibraryEntry(data, data.book);
      })
      .filter((entry): entry is LibraryEntry => Boolean(entry));

    const mergedEntries =
      remoteEntries.length > 0
        ? [
            ...remoteEntries,
            ...cachedEntries.filter(
              (cachedEntry) =>
                !remoteEntries.some(
                  (remoteEntry) => remoteEntry.book.id === cachedEntry.book.id,
                ),
            ),
          ]
        : cachedEntries;

    writeCachedLibrary(uid, mergedEntries);
    return mergedEntries;
  } catch {
    return cachedEntries;
  }
}

export async function upsertLibraryEntry(uid: string, entry: LibraryEntry) {
  upsertCachedLibraryEntry(uid, entry);

  if (!db) {
    return;
  }

  await setDoc(
    doc(db, "users", uid, "library", entry.book.id),
    {
      ...entry,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function removeStoredLibraryEntry(uid: string, bookId: string) {
  removeCachedLibraryEntry(uid, bookId);

  if (!db) {
    return;
  }

  await deleteDoc(doc(db, "users", uid, "library", bookId));
}
