"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import {
  isFirebaseAuthReady,
  loginAsGuest,
  loginWithEmail,
  normalizeAuthError,
  registerWithEmail,
  resetPassword,
} from "@/lib/auth";
import {
  clearAuthError,
  setAuthError,
  setAuthLoading,
  setUser,
} from "@/redux/features/authSlice";
import {
  selectAuth,
  selectAuthModal,
  selectAuthRedirectTo,
} from "@/redux/selectors";
import { closeAuthModal, setAuthMode } from "@/redux/features/uiSlice";

export default function AuthModal() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isOpen, mode } = useAppSelector(selectAuthModal);
  const redirectTo = useAppSelector(selectAuthRedirectTo);
  const { status, error } = useAppSelector(selectAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dispatch(closeAuthModal());
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [dispatch, isOpen]);

  if (!isOpen) {
    return null;
  }

  const isLogin = mode === "login";
  const isResetView = isLogin && isResetMode;

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setNotice("");
    setIsResetMode(false);
    setIsResetSubmitting(false);
    dispatch(clearAuthError());
    dispatch(closeAuthModal());
  };

  const handleSubmit = async () => {
    setNotice("");

    if (!isFirebaseAuthReady()) {
      dispatch(
        setAuthError(
          "Firebase auth is not configured yet. Add your NEXT_PUBLIC_FIREBASE_* variables first."
        )
      );
      return;
    }

    try {
      if (isResetView) {
        setIsResetSubmitting(true);
        await resetPassword(email);
        dispatch(clearAuthError());
        setNotice("Password reset email sent. Check your inbox.");
        return;
      }

      dispatch(setAuthLoading());
      const nextDestination = redirectTo ?? "/for-you";
      const user = isLogin
        ? await loginWithEmail(email, password)
        : await registerWithEmail(email, password);

      dispatch(setUser(user));
      handleClose();
      router.push(nextDestination);
    } catch (error) {
      dispatch(setAuthError(normalizeAuthError(error)));
    } finally {
      if (isResetView) {
        setIsResetSubmitting(false);
      }
    }
  };

  const handleGuestLogin = async () => {
    dispatch(setAuthMode("login"));
    setEmail("guest@gmail.com");
    setPassword("guest123");
    setNotice("");

    if (!isFirebaseAuthReady()) {
      dispatch(
        setAuthError(
          "Firebase auth is not configured yet. Add your guest account after Firebase is ready."
        )
      );
      return;
    }

    dispatch(setAuthLoading());

    try {
      const nextDestination = redirectTo ?? "/for-you";
      const user = await loginAsGuest();
      dispatch(setUser(user));
      handleClose();
      router.push(nextDestination);
    } catch (error) {
      dispatch(setAuthError(normalizeAuthError(error)));
    }
  };

  return (
    <div
      className="auth-modal__backdrop"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="auth-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          className="auth-modal__close"
          type="button"
          onClick={handleClose}
          aria-label="Close authentication modal"
        >
          <IoClose />
        </button>

        <div className="auth-modal__content">
          <span className="auth-modal__eyebrow">Welcome to Summarist</span>
          <h2 id="auth-modal-title" className="auth-modal__title">
            {isResetView
              ? "Reset your password"
              : isLogin
                ? "Log in to continue"
                : "Create your account"}
          </h2>
          <p className="auth-modal__subtitle">
            {isResetView
              ? "Enter your email and we will send you a reset link."
              : isLogin
              ? "Access your books, settings, and premium features."
              : "Start reading smarter with summaries, audio, and personalized picks."}
          </p>

          {!isResetView ? (
            <div className="auth-modal__toggle">
              <button
                className={`auth-modal__toggle-btn ${
                  isLogin ? "auth-modal__toggle-btn--active" : ""
                }`}
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  dispatch(setAuthMode("login"));
                }}
              >
                Login
              </button>
              <button
                className={`auth-modal__toggle-btn ${
                  !isLogin ? "auth-modal__toggle-btn--active" : ""
                }`}
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  dispatch(setAuthMode("register"));
                }}
              >
                Register
              </button>
            </div>
          ) : null}

          <form
            className="auth-modal__form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <label className="auth-modal__label" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              className="auth-modal__input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setNotice("");
                dispatch(clearAuthError());
              }}
            />

            {!isResetView ? (
              <>
                <label className="auth-modal__label" htmlFor="auth-password">
                  Password
                </label>
                <input
                  id="auth-password"
                  className="auth-modal__input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setNotice("");
                    dispatch(clearAuthError());
                  }}
                />
              </>
            ) : null}

            <button className="btn auth-modal__submit" type="submit">
              {isResetView
                ? "Send reset link"
                : isLogin
                  ? "Login"
                  : "Create account"}
            </button>
          </form>

          {isLogin ? (
            <div className="auth-modal__helper-row">
              <button
                className="auth-modal__switch"
                type="button"
                onClick={() => {
                  setIsResetMode((current) => !current);
                  setNotice("");
                  dispatch(clearAuthError());
                }}
              >
                {isResetView ? "Back to login" : "Forgot password?"}
              </button>
            </div>
          ) : null}

          {!isResetView ? (
            <>
              <button
                className="auth-modal__guest"
                type="button"
                onClick={handleGuestLogin}
              >
                Continue as guest
              </button>

              <p className="auth-modal__footer">
                {isLogin ? "Need an account?" : "Already have an account?"}{" "}
                <button
                  className="auth-modal__switch"
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    dispatch(setAuthMode(isLogin ? "register" : "login"));
                  }}
                >
                  {isLogin ? "Register" : "Login"}
                </button>
              </p>
            </>
          ) : null}

          <div className="auth-modal__status">
            {status === "loading"
              ? isResetView || isResetSubmitting
                ? "Sending reset email..."
                : "Authenticating..."
              : isResetSubmitting
                ? "Sending reset email..."
                : error ?? notice}
          </div>
        </div>
      </div>
    </div>
  );
}
