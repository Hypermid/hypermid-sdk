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
export declare function verifyWebhookSignature(body: string | Uint8Array, signature: string, secret: string): Promise<boolean>;
//# sourceMappingURL=webhook-verify.d.ts.map