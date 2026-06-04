"use strict";
/**
 * Webhook signature verification utility.
 *
 * When Hypermid sends a webhook, it includes:
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = verifyWebhookSignature;
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
async function verifyWebhookSignature(body, signature, secret) {
    const bodyStr = typeof body === "string" ? body : new TextDecoder().decode(body);
    // Try Node.js crypto first (synchronous, faster)
    try {
        const crypto = await Promise.resolve().then(() => __importStar(require("node:crypto")));
        const expected = crypto
            .createHmac("sha256", secret)
            .update(bodyStr)
            .digest("hex");
        return timingSafeEqual(expected, signature);
    }
    catch {
        // Not in Node.js — use SubtleCrypto (edge runtimes, Deno, Bun)
    }
    try {
        const encoder = new TextEncoder();
        const key = await globalThis.crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const sig = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(bodyStr));
        const expected = Array.from(new Uint8Array(sig))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        return timingSafeEqual(expected, signature);
    }
    catch {
        return false;
    }
}
/** Constant-time string comparison to prevent timing attacks */
function timingSafeEqual(a, b) {
    if (a.length !== b.length)
        return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}
//# sourceMappingURL=webhook-verify.js.map