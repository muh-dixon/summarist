"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { subscribeToAuthState } from "@/lib/auth";
import { getCachedLibrary, getStoredLibrary } from "@/lib/userProfiles";
import {
  setAuthError,
  setAuthInitialized,
  setUser,
} from "@/redux/features/authSlice";
import { clearLibrary, setLibrary } from "@/redux/features/librarySlice";

export default function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let isCancelled = false;
    let libraryRequestId = 0;

    dispatch(setAuthInitialized(false));

    try {
      const unsubscribe = subscribeToAuthState(async (user) => {
        const requestId = ++libraryRequestId;

        if (isCancelled) {
          return;
        }

        dispatch(setUser(user));

        if (!user) {
          dispatch(clearLibrary());
          return;
        }

        const cachedLibraryItems = getCachedLibrary(user.uid);

        if (!isCancelled && requestId === libraryRequestId) {
          dispatch(setLibrary(cachedLibraryItems));
        }

        try {
          const libraryItems = await getStoredLibrary(user.uid);

          if (!isCancelled && requestId === libraryRequestId) {
            dispatch(setLibrary(libraryItems));
          }
        } catch {
          if (!isCancelled && requestId === libraryRequestId) {
            dispatch(setLibrary([]));
          }
        }
      });

      return () => {
        isCancelled = true;
        unsubscribe();
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to initialize auth.";
      dispatch(setAuthError(message));
    }
  }, [dispatch]);

  return null;
}
