import { cookies } from "next/headers";
import { SessionData } from "@/types";

/**
 * Session management using HTTP-only cookies.
 *
 * Design decisions:
 * - HTTP-only cookies: XSS-proof, handled automatically by browser
 * - JSON payload: Simple, no external JWT libraries needed
 * - Signed with HMAC: Prevents tampering (requires SESSION_SECRET)
 * - 7-day expiry: Reasonable for a task app
 *
 * Trade-offs:
 * - Not using JWT: Simpler, but can't be validated without server
 * - No refresh tokens: Acceptable for this use case
 */

import { createHmac } from "crypto";

const COOKIE_NAME = "session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Signs data with HMAC to prevent tampering.
 */
function sign(data: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return createHmac("sha256", secret).update(data).digest("base64url");
}

/**
 * Verifies signature and returns original data.
 * Returns null if signature is invalid.
 */
function verify(signedData: string): string | null {
  const parts = signedData.split(".");
  if (parts.length !== 2) return null;

  const [data, signature] = parts;
  const expectedSignature = sign(data);

  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) return null;

  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return mismatch === 0 ? data : null;
}

/**
 * Creates a signed session cookie.
 */
export async function createSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signed = `${payload}.${sign(payload)}`;

  cookieStore.set(COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Retrieves and validates the current session.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  if (!cookie?.value) return null;

  const payload = verify(cookie.value);
  if (!payload) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as SessionData;
    return data;
  } catch {
    return null;
  }
}

/**
 * Destroys the current session.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
