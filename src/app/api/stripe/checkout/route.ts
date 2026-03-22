import { NextResponse } from "next/server";
import { getStripePriceId, hasStripeServerEnv, type BillingInterval } from "@/lib/stripe";
import type { SubscriptionTier } from "@/types/subscription";

type CheckoutRequestBody = {
  tier?: SubscriptionTier;
  interval?: BillingInterval;
  uid?: string | null;
  customerEmail?: string | null;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  if (!hasStripeServerEnv()) {
    return jsonError("Stripe is not configured on the server.", 500);
  }

  let body: CheckoutRequestBody;

  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return jsonError("Invalid checkout request body.", 400);
  }

  const tier = body.tier;
  const interval = body.interval;

  if (!tier || tier === "basic" || !interval) {
    return jsonError("A paid plan tier and billing interval are required.", 400);
  }

  const priceId = getStripePriceId(tier, interval);

  if (!priceId) {
    return jsonError("This Stripe price is not configured yet.", 500);
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const successUrl = `${origin}/choose-plan?checkout=success&tier=${tier}&interval=${interval}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/choose-plan?checkout=cancel`;

  const payload = new URLSearchParams();
  payload.set("mode", "subscription");
  payload.set("success_url", successUrl);
  payload.set("cancel_url", cancelUrl);
  payload.set("line_items[0][price]", priceId);
  payload.set("line_items[0][quantity]", "1");
  payload.set("metadata[tier]", tier);
  payload.set("metadata[interval]", interval);
  payload.set("subscription_data[metadata][tier]", tier);
  payload.set("subscription_data[metadata][interval]", interval);
  if (interval === "yearly") {
    payload.set("subscription_data[trial_period_days]", "7");
  }
  if (body.uid) {
    payload.set("metadata[uid]", body.uid);
    payload.set("subscription_data[metadata][uid]", body.uid);
  }

  if (body.customerEmail) {
    payload.set("customer_email", body.customerEmail);
    payload.set("metadata[email]", body.customerEmail);
    payload.set("subscription_data[metadata][email]", body.customerEmail);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });

  const data = (await response.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.id) {
    return jsonError(
      data.error?.message ?? "Stripe could not create a checkout session.",
      500,
    );
  }

  return NextResponse.json({
    sessionId: data.id,
    url: data.url ?? null,
  });
}
