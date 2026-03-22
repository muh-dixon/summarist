import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { updateUserSubscriptionServer } from "@/lib/firebaseAdmin";
import type { BillingInterval } from "@/lib/stripe";
import type { SubscriptionState, SubscriptionTier } from "@/types/subscription";

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
};

function parseStripeSignature(header: string) {
  const parts = header.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return {
    timestamp: parts.t,
    signature: parts.v1,
  };
}

function verifyStripeSignature(payload: string, header: string, secret: string) {
  const { timestamp, signature } = parseStripeSignature(header);

  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

function normalizeSubscriptionFromStripeObject(
  object: Record<string, unknown>,
): { uid: string | null; subscription: SubscriptionState | null } {
  const metadata =
    typeof object.metadata === "object" && object.metadata !== null
      ? (object.metadata as Record<string, string | undefined>)
      : {};

  const uid = metadata.uid ?? null;
  const tier = (metadata.tier as SubscriptionTier | undefined) ?? "basic";
  const interval = (metadata.interval as BillingInterval | undefined) ?? null;

  if (!uid || tier === "basic") {
    return { uid: null, subscription: null };
  }

  const status = typeof object.status === "string" ? object.status : null;
  const paymentStatus =
    typeof object.payment_status === "string" ? object.payment_status : null;
  const cancelAtPeriodEnd =
    typeof object.cancel_at_period_end === "boolean"
      ? object.cancel_at_period_end
      : false;

  const currentPeriodEnd =
    typeof object.current_period_end === "number"
      ? new Date(object.current_period_end * 1000).toISOString()
      : null;
  const trialEndsAt =
    typeof object.trial_end === "number"
      ? new Date(object.trial_end * 1000).toISOString()
      : null;

  const isActive =
    (status === "active" || status === "trialing" || status === "complete") &&
    !cancelAtPeriodEnd
      ? true
      : paymentStatus === "paid" || paymentStatus === "no_payment_required";

  return {
    uid,
    subscription: {
      isActive,
      tier,
      interval,
      trialEndsAt,
      currentPeriodEnd,
    },
  };
}

async function handleCheckoutCompleted(object: Record<string, unknown>) {
  const { uid, subscription } = normalizeSubscriptionFromStripeObject(object);

  if (!uid || !subscription) {
    return;
  }

  await updateUserSubscriptionServer(uid, subscription, {
    stripeCheckoutCompletedAt: new Date().toISOString(),
  });
}

async function handleSubscriptionChanged(object: Record<string, unknown>) {
  const { uid, subscription } = normalizeSubscriptionFromStripeObject(object);

  if (!uid || !subscription) {
    return;
  }

  await updateUserSubscriptionServer(uid, subscription, {
    stripeSubscriptionStatus:
      typeof object.status === "string" ? object.status : null,
  });
}

async function handleSubscriptionDeleted(object: Record<string, unknown>) {
  const metadata =
    typeof object.metadata === "object" && object.metadata !== null
      ? (object.metadata as Record<string, string | undefined>)
      : {};
  const uid = metadata.uid ?? null;
  const tier = (metadata.tier as SubscriptionTier | undefined) ?? "basic";

  if (!uid || tier === "basic") {
    return;
  }

  await updateUserSubscriptionServer(uid, {
    isActive: false,
    tier,
    interval: null,
    trialEndsAt: null,
    currentPeriodEnd: null,
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signatureHeader = request.headers.get("stripe-signature");

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook secret is not configured." },
      { status: 500 },
    );
  }

  if (!signatureHeader) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const payload = await request.text();

  if (!verifyStripeSignature(payload, signatureHeader, webhookSecret)) {
    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  const event = JSON.parse(payload) as StripeEvent;
  const object = event.data.object;

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionChanged(object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(object);
        break;
      default:
        break;
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
