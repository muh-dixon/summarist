import type { SubscriptionState } from "@/types/subscription";

export type AuthMode = "login" | "register";

export interface AuthUser {
  uid: string;
  email: string | null;
  isGuest: boolean;
  subscription: SubscriptionState;
}

export interface AuthState {
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  initialized: boolean;
}

export interface AuthModalState {
  isOpen: boolean;
  mode: AuthMode;
  redirectTo: string | null;
}
