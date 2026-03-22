import { NextResponse } from "next/server";
import type { BillingInterval } from "@/lib/stripe";
import type { SubscriptionState, SubscriptionTier } from "@/types/subscription";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return jsonError("Stripe is not configured on the server.", 500);
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return jsonError("Missing Stripe session id.", 400);
  }

  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=subscription`,
    {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    },
  );

  const data = (await response.json()) as {
    payment_status?: string;
    status?: string;
    metadata?: Record<string, string | undefined>;
    customer_details?: { email?: string | null };
    subscription?: {
      current_period_end?: number;
      trial_end?: number | null;
    };
    error?: { message?: string };
  };

  if (!response.ok) {
    return jsonError(
      data.error?.message ?? "Unable to confirm this Stripe session.",
      500,
    );
  }

  const tier = data.metadata?.tier as SubscriptionTier | undefined;
  const interval = data.metadata?.interval as BillingInterval | undefined;
  const uid = data.metadata?.uid ?? null;
  const email = data.customer_details?.email ?? data.metadata?.email ?? null;

  if (!tier || tier === "basic" || !interval || !uid) {
    return jsonError("Stripe session metadata is incomplete.", 400);
  }

  const subscription: SubscriptionState = {
    isActive: data.payment_status === "paid" || data.status === "complete",
    tier,
    interval,
    trialEndsAt: data.subscription?.trial_end
      ? new Date(data.subscription.trial_end * 1000).toISOString()
      : null,
    currentPeriodEnd: data.subscription?.current_period_end
      ? new Date(data.subscription.current_period_end * 1000).toISOString()
      : null,
  };

  return NextResponse.json({
    uid,
    email,
    subscription,
  });
}
