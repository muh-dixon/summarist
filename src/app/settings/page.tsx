"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowRight,
  FiCheckCircle,
  FiCreditCard,
  FiLogOut,
  FiMail,
  FiShield,
  FiStar,
  FiUser,
} from "react-icons/fi";
import LoginButton from "@/components/shared/LoginButton";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { logoutCurrentUser, normalizeAuthError } from "@/lib/auth";
import {
  logoutUser,
  setAuthError,
  setAuthLoading,
} from "@/redux/features/authSlice";
import { selectAuthInitialized, selectCurrentUser } from "@/redux/selectors";

function formatTierLabel(tier: "basic" | "premium" | "premium-plus") {
  switch (tier) {
    case "premium-plus":
      return "Premium Plus";
    case "premium":
      return "Premium";
    default:
      return "Basic";
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authInitialized = useAppSelector(selectAuthInitialized);
  const currentUser = useAppSelector(selectCurrentUser);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const accountSummary = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    const tierLabel = formatTierLabel(currentUser.subscription.tier);
    const accessLabel = currentUser.subscription.isActive
      ? `${tierLabel} access active`
      : "Basic access";

    return {
      email: currentUser.email ?? "No email available",
      tierLabel,
      accessLabel,
      membershipLabel: currentUser.isGuest ? "Guest member" : "Registered member",
      billingLabel: currentUser.subscription.interval
        ? `${currentUser.subscription.interval} billing`
        : "No billing cycle yet",
    };
  }, [currentUser]);

  if (!authInitialized) {
    return (
      <div className="settings-page">
        <section className="settings-page__hero">
          <span className="settings-page__eyebrow">Account settings</span>
          <h1 className="settings-page__title">Loading your account</h1>
          <p className="settings-page__subtitle">
            Pulling in your membership details and account preferences.
          </p>
        </section>
      </div>
    );
  }

  async function handleLogout() {
    setLogoutError(null);
    dispatch(setAuthLoading());

    try {
      await logoutCurrentUser();
      dispatch(logoutUser());
    } catch (error) {
      const message = normalizeAuthError(error);
      dispatch(setAuthError(message));
      setLogoutError(message);
    }
  }

  if (!currentUser) {
    return (
      <div className="settings-page">
        <section className="settings-page__hero">
          <span className="settings-page__eyebrow">Account settings</span>
          <h1 className="settings-page__title">Manage your Summarist account</h1>
          <p className="settings-page__subtitle">
            Sign in to view your membership, premium access, and future billing
            details in one place.
          </p>

          <div className="settings-page__guest-card">
            <div className="settings-page__guest-copy">
              <h2 className="settings-page__section-title">You&apos;re currently signed out</h2>
              <p className="settings-page__copy">
                Log in to see your plan details, upgrade options, and account
                preferences. You can also create a new account if you&apos;re just
                getting started.
              </p>
            </div>

            <div className="settings-page__actions">
              <LoginButton className="btn settings-page__btn">Log in</LoginButton>
              <LoginButton
                className="settings-page__btn settings-page__btn--secondary"
                mode="register"
              >
                Create account
              </LoginButton>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <section className="settings-page__hero">
        <span className="settings-page__eyebrow">Account settings</span>
        <h1 className="settings-page__title">Your account</h1>
        <p className="settings-page__subtitle">
          Review your membership details, premium access, and account status.
        </p>
      </section>

      <section className="settings-page__grid">
        <article className="settings-page__card settings-page__card--primary">
          <div className="settings-page__card-header">
            <div>
              <h2 className="settings-page__section-title">Profile</h2>
              <p className="settings-page__copy">
                Your current account information and membership type.
              </p>
            </div>
            <span className="settings-page__pill">
              <FiShield />
              {accountSummary?.membershipLabel}
            </span>
          </div>

          <div className="settings-page__detail-list">
            <div className="settings-page__detail-item">
              <span className="settings-page__detail-label">
                <FiMail />
                Email
              </span>
              <strong className="settings-page__detail-value">
                {accountSummary?.email}
              </strong>
            </div>

            <div className="settings-page__detail-item">
              <span className="settings-page__detail-label">
                <FiUser />
                Membership
              </span>
              <strong className="settings-page__detail-value">
                {accountSummary?.membershipLabel}
              </strong>
            </div>
          </div>
        </article>

        <article className="settings-page__card">
          <div className="settings-page__card-header">
            <div>
              <h2 className="settings-page__section-title">Subscription</h2>
              <p className="settings-page__copy">
                View your access level and manage your next upgrade.
              </p>
            </div>
            <span className="settings-page__pill settings-page__pill--accent">
              <FiStar />
              {accountSummary?.tierLabel}
            </span>
          </div>

          <div className="settings-page__detail-list">
            <div className="settings-page__detail-item">
              <span className="settings-page__detail-label">
                <FiCheckCircle />
                Status
              </span>
              <strong className="settings-page__detail-value">
                {accountSummary?.accessLabel}
              </strong>
            </div>

            <div className="settings-page__detail-item">
              <span className="settings-page__detail-label">
                <FiCreditCard />
                Billing
              </span>
              <strong className="settings-page__detail-value">
                {accountSummary?.billingLabel}
              </strong>
            </div>
          </div>

          <div className="settings-page__actions">
            <button
              type="button"
              className="btn settings-page__btn"
              onClick={() => router.push("/choose-plan")}
            >
              {currentUser.subscription.isActive ? "Manage plan" : "Upgrade plan"}
              <FiArrowRight />
            </button>
          </div>
        </article>
      </section>

      <section className="settings-page__card settings-page__card--full">
        <div className="settings-page__card-header">
          <div>
            <h2 className="settings-page__section-title">Account actions</h2>
            <p className="settings-page__copy">
              Sign out of this device or head to plans to update access.
            </p>
          </div>
        </div>

        {logoutError ? (
          <div className="settings-page__error">{logoutError}</div>
        ) : null}

        <div className="settings-page__actions">
          <button
            type="button"
            className="settings-page__btn settings-page__btn--secondary"
            onClick={handleLogout}
          >
            <FiLogOut />
            Logout
          </button>

          <button
            type="button"
            className="btn settings-page__btn"
            onClick={() => router.push("/choose-plan")}
          >
            View plans
            <FiArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
}
