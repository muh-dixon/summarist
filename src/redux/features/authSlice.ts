import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthUser } from "@/types/auth";
import type { SubscriptionState } from "@/types/subscription";

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthLoading(state) {
      state.status = "loading";
      state.error = null;
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "unauthenticated";
      state.error = null;
      state.initialized = true;
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = "unauthenticated";
      state.initialized = true;
    },
    clearAuthError(state) {
      state.error = null;
    },
    setAuthInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;

      if (!action.payload && state.status === "idle") {
        state.status = "loading";
      }
    },
    logoutUser(state) {
      state.user = null;
      state.status = "unauthenticated";
      state.error = null;
      state.initialized = true;
    },
    updateUserSubscription(state, action: PayloadAction<SubscriptionState>) {
      if (!state.user) {
        return;
      }

      state.user.subscription = action.payload;
      state.status = "authenticated";
      state.error = null;
      state.initialized = true;
    },
  },
});

export const {
  setAuthLoading,
  setUser,
  setAuthError,
  clearAuthError,
  setAuthInitialized,
  logoutUser,
  updateUserSubscription,
} = authSlice.actions;

export default authSlice.reducer;
