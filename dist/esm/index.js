// ─── Core client ─────────────────────────────────────────────────────────
export { Hypermid } from "./client.js";
// ─── Errors ──────────────────────────────────────────────────────────────
export { HypermidError, HypermidTimeoutError, HypermidNetworkError } from "./errors.js";
// ─── Chain constants ─────────────────────────────────────────────────────
export { ChainId, ChainSlug, isNearIntentsChain, supportsWalletDeposit } from "./chains.js";
// ─── Chain registry ─────────────────────────────────────────────────
export { CHAIN_REGISTRY, NI_CHAIN_BASE, resolveChain, toLifiChainId, toNIBlockchain, toNumericId, isNIOnlyChain, getAllChains, getChainsByProvider, getDryQuotePlaceholder, } from "./chain-registry.js";
// ─── Type guards & helpers ───────────────────────────────────────────────
export { isLiFiRoute, isNearIntentsRoute, isSuperSwapRoute, isManualDeposit, isWalletDeposit, isNIStatusTerminal, isSuperSwapStatusTerminal, isLiFiStatusTerminal, isDepositSuccess, isDepositRefunded, isDepositFailed, } from "./helpers.js";
// ─── Execution lifecycle ─────────────────────────────────────────────────
export { executeSwap, waitForDepositCompletion, waitForLiFiCompletion, quoteAndPrepare, } from "./execution.js";
// ─── EIP-7702 / EIP-5792 atomic batch (1-tap approve + swap) ──────────────
export { supportsAtomicBatch, sendAtomicApproveAndSwap, encodeApprove, } from "./eip7702.js";
// ─── Webhook verification ────────────────────────────────────────────────
export { verifyWebhookSignature } from "./webhook-verify.js";
//# sourceMappingURL=index.js.map