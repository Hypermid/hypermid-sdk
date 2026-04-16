/**
 * Type guards and utility helpers for working with HyperMid API responses.
 */
// ─── Type Guards ─────────────────────────────────────────────────────────
/**
 * Check if an execute response is a LI.FI route (has transactionRequest).
 *
 * @example
 * ```ts
 * const result = await hm.execute(params);
 * if (isLiFiRoute(result)) {
 *   const tx = result.transactionRequest;
 *   // Sign and send with your wallet provider
 * }
 * ```
 */
export function isLiFiRoute(response) {
    return response.provider === "lifi";
}
/**
 * Check if an execute response is a SuperSwap route (PulseChain via Hyperlane).
 *
 * @example
 * ```ts
 * const result = await hm.execute(params);
 * if (isSuperSwapRoute(result)) {
 *   const tx = result.transactionRequest;
 *   // Sign and send, then call registerInboundReceiver()
 * }
 * ```
 */
export function isSuperSwapRoute(response) {
    return response.provider === "superswap";
}
/**
 * Check if an execute response is a Near Intents route (has depositAddress).
 *
 * @example
 * ```ts
 * const result = await hm.execute(params);
 * if (isNearIntentsRoute(result)) {
 *   console.log("Send tokens to:", result.depositAddress);
 * }
 * ```
 */
export function isNearIntentsRoute(response) {
    return response.provider === "near-intents";
}
/**
 * Check if a Near Intents deposit requires manual user action (QR code / copy address).
 */
export function isManualDeposit(response) {
    return response.provider === "near-intents" && response.depositMode === "manual";
}
/**
 * Check if a Near Intents deposit can be done programmatically via wallet.
 */
export function isWalletDeposit(response) {
    return (response.provider === "lifi" ||
        (response.provider === "near-intents" && response.depositMode === "wallet"));
}
// ─── Status Helpers ──────────────────────────────────────────────────────
/** Terminal NI deposit statuses — polling should stop here */
const TERMINAL_NI_STATUSES = new Set(["SUCCESS", "REFUNDED", "FAILED"]);
/** Terminal LI.FI statuses */
const TERMINAL_LIFI_STATUSES = new Set(["DONE", "FAILED"]);
/**
 * Check if a Near Intents deposit status is terminal (no more polling needed).
 */
export function isNIStatusTerminal(status) {
    return TERMINAL_NI_STATUSES.has(status);
}
/**
 * Check if a LI.FI status is terminal.
 */
export function isLiFiStatusTerminal(status) {
    return TERMINAL_LIFI_STATUSES.has(status);
}
/**
 * Check if a Near Intents swap completed successfully.
 */
export function isDepositSuccess(response) {
    return response.status === "SUCCESS";
}
/**
 * Check if a Near Intents swap was refunded.
 */
export function isDepositRefunded(response) {
    return response.status === "REFUNDED";
}
/**
 * Check if a Near Intents swap failed.
 */
export function isDepositFailed(response) {
    return response.status === "FAILED";
}
//# sourceMappingURL=helpers.js.map