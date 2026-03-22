import type { RootState } from "@/redux/store";

export const selectAuth = (state: RootState) => state.auth;
export const selectAuthInitialized = (state: RootState) => state.auth.initialized;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthModal = (state: RootState) => state.ui.authModal;
export const selectAuthRedirectTo = (state: RootState) =>
  state.ui.authModal.redirectTo;
export const selectLibrary = (state: RootState) => state.library;
export const selectLibraryItems = (state: RootState) => state.library.items;
export const selectMobileSidebarOpen = (state: RootState) =>
  state.ui.mobileSidebarOpen;
export const selectPlayer = (state: RootState) => state.player;
