import { createSign } from "crypto";
import type { SubscriptionState } from "@/types/subscription";

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL ?? "";
const FIREBASE_PRIVATE_KEY = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(
  /\\n/g,
  "\n",
);

const FIREBASE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FIREBASE_SCOPE = "https://www.googleapis.com/auth/datastore";
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

type TokenCache = {
  accessToken: string;
  expiresAt: number;
} | null;

let cachedToken: TokenCache = null;

export function hasFirebaseAdminEnv() {
  return Boolean(
    FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY,
  );
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createSignedJwt() {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: FIREBASE_CLIENT_EMAIL,
    sub: FIREBASE_CLIENT_EMAIL,
    aud: FIREBASE_TOKEN_URL,
    scope: FIREBASE_SCOPE,
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  const signature = signer
    .sign(FIREBASE_PRIVATE_KEY, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${unsignedToken}.${signature}`;
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const assertion = createSignedJwt();
  const response = await fetch(FIREBASE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ?? "Unable to obtain Firebase admin access token.",
    );
  }

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };

  return data.access_token;
}

function buildSubscriptionFields(subscription: SubscriptionState) {
  return {
    isActive: { booleanValue: subscription.isActive },
    tier: { stringValue: subscription.tier },
    interval: subscription.interval
      ? { stringValue: subscription.interval }
      : { nullValue: null },
    trialEndsAt: subscription.trialEndsAt
      ? { stringValue: subscription.trialEndsAt }
      : { nullValue: null },
    currentPeriodEnd: subscription.currentPeriodEnd
      ? { stringValue: subscription.currentPeriodEnd }
      : { nullValue: null },
  };
}

export async function updateUserSubscriptionServer(
  uid: string,
  subscription: SubscriptionState,
  extras?: Record<string, string | null | undefined>,
) {
  if (!hasFirebaseAdminEnv()) {
    throw new Error("Firebase admin environment variables are missing.");
  }

  const accessToken = await getAccessToken();
  const documentUrl = `${FIRESTORE_BASE_URL}/users/${uid}`;
  const query = new URLSearchParams({
    "updateMask.fieldPaths": "subscription",
  });

  if (extras) {
    for (const key of Object.keys(extras)) {
      query.append("updateMask.fieldPaths", key);
    }
  }

  const extraFields = Object.fromEntries(
    Object.entries(extras ?? {}).map(([key, value]) => [
      key,
      value ? { stringValue: value } : { nullValue: null },
    ]),
  );

  const response = await fetch(`${documentUrl}?${query.toString()}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        subscription: {
          mapValue: {
            fields: buildSubscriptionFields(subscription),
          },
        },
        ...extraFields,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Unable to update Firestore subscription.");
  }
}
