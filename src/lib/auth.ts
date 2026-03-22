import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/firebase/firebase";
import {
  defaultSubscription,
  getStoredSubscription,
  guestSubscription,
  upsertUserProfile,
} from "@/lib/userProfiles";
import type { AuthUser } from "@/types/auth";

const guestCredentials = {
  email: "guest@gmail.com",
  password: "guest123",
};

const PROFILE_TIMEOUT_MS = 2500;

export function isFirebaseAuthReady() {
  return Boolean(auth);
}

async function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), PROFILE_TIMEOUT_MS);
    }),
  ]);
}

async function resolveAuthUser(user: User): Promise<AuthUser> {
  const isGuest = user.email === guestCredentials.email;
  const fallbackSubscription = isGuest ? guestSubscription : defaultSubscription;
  const subscription = isGuest
    ? guestSubscription
    : await withTimeout(
        getStoredSubscription(user.uid, fallbackSubscription).catch(
          () => fallbackSubscription,
        ),
        fallbackSubscription,
      );

  const authUser: AuthUser = {
    uid: user.uid,
    email: user.email,
    isGuest,
    subscription,
  };

  void upsertUserProfile(authUser).catch(() => undefined);

  return authUser;
}

export function normalizeAuthError(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    switch (error.code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/missing-password":
        return "Please enter your password.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Email or password is incorrect.";
      case "auth/email-already-in-use":
        return "An account already exists with that email.";
      case "auth/operation-not-allowed":
        return "Email/password sign-in is disabled in Firebase Authentication.";
      case "auth/network-request-failed":
        return "Network error while contacting Firebase. Please try again.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again in a moment.";
      default:
        return "Authentication failed. Please try again.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Authentication failed. Please try again.";
}

export async function registerWithEmail(email: string, password: string) {
  if (!auth) {
    throw new Error("Firebase auth is not configured.");
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return resolveAuthUser(credential.user);
}

export async function loginWithEmail(email: string, password: string) {
  if (!auth) {
    throw new Error("Firebase auth is not configured.");
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return resolveAuthUser(credential.user);
}

export async function loginAsGuest() {
  return loginWithEmail(guestCredentials.email, guestCredentials.password);
}

export async function resetPassword(email: string) {
  if (!auth) {
    throw new Error("Firebase auth is not configured.");
  }

  await sendPasswordResetEmail(auth, email);
}

export async function logoutCurrentUser() {
  if (!auth) {
    throw new Error("Firebase auth is not configured.");
  }

  await signOut(auth);
}

export function subscribeToAuthState(
  callback: (user: AuthUser | null) => void
) {
  if (!auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }

    try {
      callback(await resolveAuthUser(user));
    } catch {
      callback(null);
    }
  });
}
