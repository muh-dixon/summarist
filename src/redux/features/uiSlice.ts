import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthMode, AuthModalState } from "@/types/auth";

interface UiState {
  authModal: AuthModalState;
  mobileSidebarOpen: boolean;
}

type OpenAuthModalPayload =
  | AuthMode
  | {
      mode?: AuthMode;
      redirectTo?: string | null;
    };

const initialState: UiState = {
  authModal: {
    isOpen: false,
    mode: "login",
    redirectTo: null,
  },
  mobileSidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openAuthModal(state, action: PayloadAction<OpenAuthModalPayload | undefined>) {
      const payload = action.payload;

      state.authModal.isOpen = true;
      state.authModal.mode =
        typeof payload === "string" ? payload : payload?.mode ?? "login";
      state.authModal.redirectTo =
        typeof payload === "string" ? null : payload?.redirectTo ?? null;
    },
    closeAuthModal(state) {
      state.authModal.isOpen = false;
      state.authModal.redirectTo = null;
    },
    setAuthMode(state, action: PayloadAction<AuthMode>) {
      state.authModal.mode = action.payload;
    },
    toggleMobileSidebar(state) {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    closeMobileSidebar(state) {
      state.mobileSidebarOpen = false;
    },
  },
});

export const {
  openAuthModal,
  closeAuthModal,
  setAuthMode,
  toggleMobileSidebar,
  closeMobileSidebar,
} = uiSlice.actions;

export default uiSlice.reducer;
