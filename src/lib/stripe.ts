import type { SubscriptionTier } from "@/types/subscription";

export type BillingInterval = "monthly" | "yearly";

type PriceMap = Record<SubscriptionTier, Partial<Record<BillingInterval, string>>>;

const stripePriceMap: PriceMap = {
  basic: {},
  premium: {
    monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
  },
  "premium-plus": {
    monthly: process.env.STRIPE_PRICE_PREMIUM_PLUS_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PREMIUM_PLUS_YEARLY,
  },
};

export function hasStripeClientEnv() {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export function hasStripeServerEnv() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
}

export function getStripePriceId(
  tier: Exclude<SubscriptionTier, "basic">,
  interval: BillingInterval,
) {
  return stripePriceMap[tier][interval] ?? null;
}
