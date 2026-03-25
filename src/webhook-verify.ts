/**
 * Webhook signature verification utility.
 *
 * When HyperMid sends a webhook, it includes:
 *   - `X-Hypermid-Signature`: HMAC-SHA256 hex digest of the raw body
 *   - `X-Hypermid-Event`: event type (e.g. "swap.completed")
 *
 * Use `verifyWebhookSignature()` to validate incoming webhooks.
 *
 * @example Express / Node.js
 * ```ts
 * import { verifyWebhookSignature } from "@hypermid/sdk";
 *
 * app.post("/webhooks/hypermid", express.raw({ type: "application/json" }), (req, res) => {
 *   const signature = req.headers["x-hypermid-signature"] as string;
 *   const isValid = verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET);
 *
 *   if (!isValid) {
 *     return res.status(401).send("Invalid signature");
 *   }
 *
 *   const event = req.headers["x-hypermid-event"];
 *   const payload = JSON.parse(req.body.toString());
 *   // Handle event...
 *   res.sendStatus(200);
 * });
 * ```
 */

/**
 * Verify a webhook signature using HMAC-SHA256.
 *
 * Works in both Node.js (using `crypto`) and edge runtimes (using `SubtleCrypto`).
 *
 * @param body - The raw request body (string or Buffer/Uint8Array)
 * @param signature - The `X-Hypermid-Signature` header value
 * @param secret - Your webhook signing secret (from webhook creation)
 * @returns `true` if the signature is valid
 */
export async function verifyWebhookSignature(
  body: string | Uint8Array,
  signature: string,
  secret: string,
): Promise<boolean> {
  const bodyStr = typeof body === "string" ? body : new TextDecoder().decode(body);

  // Try Node.js crypto first (synchronous, faster)
  try {
    const crypto = await import("node:crypto");
    const expected = crypto
      .createHmac("sha256", secret)
      .update(bodyStr)
      .digest("hex");
    return timingSafeEqual(expected, signature);
  } catch {
    // Not in Node.js — use SubtleCrypto (edge runtimes, Deno, Bun)
  }

  try {
    const encoder = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(bodyStr));
    const expected = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return timingSafeEqual(expected, signature);
  } catch {
    return false;
  }
}

/** Constant-time string comparison to prevent timing attacks */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
