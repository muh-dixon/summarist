"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiStar,
  FiZap,
} from "react-icons/fi";
import BackButton from "@/components/shared/BackButton";
import LoginButton from "@/components/shared/LoginButton";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { updateStoredSubscription } from "@/lib/userProfiles";
import { updateUserSubscription } from "@/redux/features/authSlice";
import type { BillingInterval } from "@/lib/stripe";
import { selectCurrentUser } from "@/redux/selectors";
import type { SubscriptionTier } from "@/types/subscription";

type PlanDefinition = {
  id: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyEquivalent: string;
  badge?: string;
  features: string[];
};

const PLANS: PlanDefinition[] = [
  {
    id: "premium",
    name: "Premium",
    description: "Unlimited access to audio and text summaries for everyday growth.",
    monthlyPrice: "$12.99",
    yearlyPrice: "$99.99",
    yearlyEquivalent: "$8.33/mo billed yearly",
    badge: "Most popular",
    features: [
      "Unlimited access to premium books",
      "Audio and text summaries on every device",
      "Reader controls with playback speed and text sizing",
      "Priority access to newly added summaries",
    ],
  },
  {
    id: "premium-plus",
    name: "Premium Plus",
    description: "For readers who want the full Summarist experience and deeper learning tools.",
    monthlyPrice: "$19.99",
    yearlyPrice: "$149.99",
    yearlyEquivalent: "$12.50/mo billed yearly",
    badge: "Best value",
    features: [
      "Everything in Premium",
      "Extended learning collections and curated playlists",
      "Future access to notes, highlights, and library features",
      "Early access to new premium experiences",
    ],
  },
];

const FAQS = [
  {
    question: "What changes when I upgrade?",
    answer:
      "Upgrading unlocks premium titles across the app, including the protected books on your dashboard and their full player access.",
  },
  {
    question: "Can I switch between monthly and yearly later?",
    answer:
      "Yes. You can return to this page anytime to choose a different billing interval or premium tier.",
  },
  {
    question: "Will my subscription persist after refresh?",
    answer:
      "Yes. Once checkout is confirmed, your subscription is stored with your account so it can be restored after refresh and sign-in.",
  },
];

function planPrice(plan: PlanDefinition, interval: BillingInterval) {
  return interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
}

export default function ChoosePlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("yearly");
  const [expandedFaq, setExpandedFaq] = useState(FAQS[0]?.question ?? "");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [activeCheckoutPlan, setActiveCheckoutPlan] = useState<string | null>(null);

  const currentTier = currentUser?.subscription.tier ?? "basic";

  const planSummary = useMemo(() => {
    if (!currentUser) {
      return "Sign in to choose a plan and unlock premium content.";
    }

    if (currentUser.subscription.isActive) {
      return `You currently have ${currentUser.subscription.tier.replace("-", " ")} access.`;
    }

    return "Choose a plan to unlock premium reading and listening.";
  }, [currentUser]);

  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");

    if (checkoutStatus === "cancel") {
      setSuccessMessage(null);
      setCheckoutError("Checkout was canceled before the subscription was completed.");
      return;
    }

    if (checkoutStatus !== "success" || !currentUser || !sessionId) {
      return;
    }

    const confirmedSessionId = sessionId;

    let isCancelled = false;

    async function confirmCheckout() {
      try {
        const response = await fetch(
          `/api/stripe/confirm?session_id=${encodeURIComponent(confirmedSessionId)}`,
        );
        const data = (await response.json()) as {
          uid?: string;
          subscription?: {
            isActive: boolean;
            tier: SubscriptionTier;
            interval: BillingInterval | null;
            trialEndsAt: string | null;
            currentPeriodEnd: string | null;
          };
          error?: string;
        };

        if (!response.ok || !data.subscription || data.uid !== currentUser.uid) {
          throw new Error(data.error ?? "Unable to verify Stripe checkout.");
        }

        await updateStoredSubscription(currentUser.uid, data.subscription);
        dispatch(updateUserSubscription(data.subscription));

        if (!isCancelled) {
          setCheckoutError(null);
          setSuccessMessage(
            `${data.subscription.tier.replace("-", " ")} access is now active.`,
          );
        }
      } catch (error) {
        if (!isCancelled) {
          setCheckoutError(
            error instanceof Error
              ? error.message
              : "Unable to verify Stripe checkout.",
          );
        }
      }
    }

    void confirmCheckout();

    return () => {
      isCancelled = true;
    };
  }, [currentUser, dispatch, searchParams]);

  async function handleChoosePlan(plan: PlanDefinition) {
    if (!currentUser) {
      return;
    }

    setCheckoutError(null);
    setSuccessMessage(null);
    setActiveCheckoutPlan(plan.id);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier: plan.id,
          interval: billingInterval,
          uid: currentUser.uid,
          customerEmail: currentUser.email,
        }),
      });

      const data = (await response.json()) as {
        sessionId?: string;
        url?: string | null;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Unable to start Stripe checkout.");
      }
      window.location.assign(data.url);
      return;
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Unable to start Stripe checkout.",
      );
    } finally {
      setActiveCheckoutPlan(null);
    }
  }

  return (
    <main className="choose-plan-page">
      <section className="choose-plan-page__hero">
        <BackButton
          className="choose-plan-page__back"
          fallbackHref="/settings"
          label="Back to settings"
          useHistory={false}
        />
        <span className="choose-plan-page__eyebrow">Premium membership</span>
        <h1 className="choose-plan-page__title">Choose the plan that fits your reading rhythm</h1>
        <p className="choose-plan-page__subtitle">
          Unlock premium summaries, audio listening, and a smoother learning flow
          across the entire Summarist experience.
        </p>

        <div className="choose-plan-page__hero-row">
          <div className="choose-plan-page__toggle" role="tablist" aria-label="Billing interval">
            <button
              type="button"
              className={`choose-plan-page__toggle-btn${
                billingInterval === "yearly" ? " choose-plan-page__toggle-btn--active" : ""
              }`}
              onClick={() => setBillingInterval("yearly")}
            >
              Yearly
              <span className="choose-plan-page__toggle-badge">Save more + 7-day trial</span>
            </button>
            <button
              type="button"
              className={`choose-plan-page__toggle-btn${
                billingInterval === "monthly" ? " choose-plan-page__toggle-btn--active" : ""
              }`}
              onClick={() => setBillingInterval("monthly")}
            >
              Monthly
            </button>
          </div>

          <div className="choose-plan-page__status">
            <FiCheckCircle />
            <span>{planSummary}</span>
          </div>
        </div>

        {successMessage ? (
          <div className="choose-plan-page__success">
            <FiCheckCircle />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {checkoutError ? (
          <div className="choose-plan-page__error">
            <span>{checkoutError}</span>
          </div>
        ) : null}
      </section>

      <section className="choose-plan-page__plans">
        {PLANS.map((plan) => {
          const isCurrentPlan =
            currentUser?.subscription.isActive && currentTier === plan.id;

          return (
            <article
              className={`choose-plan-page__plan${
                plan.badge ? " choose-plan-page__plan--featured" : ""
              }`}
              key={plan.id}
            >
              <div className="choose-plan-page__plan-top">
                <div>
                  <div className="choose-plan-page__plan-title-row">
                    <h2 className="choose-plan-page__plan-title">{plan.name}</h2>
                    {plan.badge ? (
                      <span className="choose-plan-page__plan-badge">
                        <FiStar />
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="choose-plan-page__plan-description">{plan.description}</p>
                </div>

                <div className="choose-plan-page__price-block">
                  <span className="choose-plan-page__price">
                    {planPrice(plan, billingInterval)}
                  </span>
                  <span className="choose-plan-page__price-caption">
                    {billingInterval === "yearly"
                      ? plan.yearlyEquivalent
                      : "Billed monthly"}
                  </span>
                </div>
              </div>

              <ul className="choose-plan-page__feature-list">
                {plan.features.map((feature) => (
                  <li className="choose-plan-page__feature" key={feature}>
                    <FiCheck />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {!currentUser ? (
                <LoginButton
                  className="btn choose-plan-page__cta"
                  redirectTo="/choose-plan"
                >
                  Sign in to continue
                </LoginButton>
              ) : isCurrentPlan ? (
                <button
                  type="button"
                  className="choose-plan-page__cta choose-plan-page__cta--secondary"
                  onClick={() => router.push("/settings")}
                >
                  Current plan
                </button>
              ) : (
                <button
                  type="button"
                  className="btn choose-plan-page__cta"
                  onClick={() => handleChoosePlan(plan)}
                  disabled={activeCheckoutPlan === plan.id}
                >
                  {activeCheckoutPlan === plan.id ? "Redirecting..." : `Choose ${plan.name}`}
                  <FiArrowRight />
                </button>
              )}
            </article>
          );
        })}
      </section>

      <section className="choose-plan-page__comparison">
        <div className="choose-plan-page__comparison-copy">
          <span className="choose-plan-page__eyebrow">Why upgrade</span>
          <h2 className="choose-plan-page__section-title">Build momentum without interruption</h2>
          <p className="choose-plan-page__subtitle">
            Premium unlocks protected titles, while Premium Plus sets you up for
            the deeper study tools and library workflows that come next.
          </p>
        </div>

        <div className="choose-plan-page__comparison-grid">
          <div className="choose-plan-page__comparison-item">
            <FiZap />
            <strong>Instant access</strong>
            <span>Open premium books and continue straight into the player.</span>
          </div>
          <div className="choose-plan-page__comparison-item">
            <FiStar />
            <strong>Stronger focus</strong>
            <span>Keep audio, text, and adjustable controls together in one flow.</span>
          </div>
          <div className="choose-plan-page__comparison-item">
            <FiCheckCircle />
            <strong>Built for what’s next</strong>
            <span>The page is ready for Stripe wiring and long-term subscription persistence.</span>
          </div>
        </div>
      </section>

      <section className="choose-plan-page__faq">
        <div className="choose-plan-page__faq-head">
          <span className="choose-plan-page__eyebrow">Questions</span>
          <h2 className="choose-plan-page__section-title">Common plan questions</h2>
        </div>

        <div className="choose-plan-page__faq-list">
          {FAQS.map((faq) => {
            const isOpen = expandedFaq === faq.question;

            return (
              <div className="choose-plan-page__faq-item" key={faq.question}>
                <button
                  type="button"
                  className="choose-plan-page__faq-trigger"
                  onClick={() =>
                    setExpandedFaq((current) => (current === faq.question ? "" : faq.question))
                  }
                >
                  <span>{faq.question}</span>
                  <FiChevronDown
                    className={`choose-plan-page__faq-icon${
                      isOpen ? " choose-plan-page__faq-icon--open" : ""
                    }`}
                  />
                </button>

                {isOpen ? <p className="choose-plan-page__faq-answer">{faq.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
