export type SubscriptionTier = "basic" | "premium" | "premium-plus";

export interface SubscriptionState {
  isActive: boolean;
  tier: SubscriptionTier;
  interval: "monthly" | "yearly" | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
}
