/**
 * Chain ID constants for all supported chains.
 *
 * EVM chains use their standard numeric chain IDs.
 * Non-EVM chains can be referenced by slug string (preferred) or numeric ID.
 *
 * @example
 * ```ts
 * import { ChainId, ChainSlug } from "@hypermid/sdk";
 *
 * // Numeric IDs (backwards compatible)
 * const quote = await hm.getQuote({
 *   fromChain: ChainId.ETHEREUM,    // 1
 *   toChain: ChainId.ARBITRUM,      // 42161
 *   ...
 * });
 *
 * // String slugs (recommended for non-EVM)
 * const quote2 = await hm.getQuote({
 *   fromChain: ChainSlug.SOLANA,    // "solana"
 *   toChain: ChainSlug.BITCOIN,     // "bitcoin"
 *   ...
 * });
 * ```
 */
import { CHAIN_REGISTRY, NI_CHAIN_BASE, resolveChain, } from "./chain-registry.js";
// ─── Numeric Chain IDs (backwards compatible) ────────────────────────────────
const NI_BASE = NI_CHAIN_BASE;
export const ChainId = {
    // ─── EVM Chains ──────────────────────────────────────────────
    ETHEREUM: 1,
    OPTIMISM: 10,
    BSC: 56,
    GNOSIS: 100,
    POLYGON: 137,
    X_LAYER: 196,
    ARBITRUM: 42161,
    AVALANCHE: 43114,
    BASE: 8453,
    PLASMA: 1012,
    BERACHAIN: 80094,
    MONAD: 10143,
    // ─── Non-EVM (LI.FI supported) ──────────────────────────────
    SOLANA: 1151111081099710,
    BITCOIN: 20000000000001,
    SUI: 9270000000000000,
    // ─── Near Intents-only chains ────────────────────────────────
    NEAR: NI_BASE + 1,
    TON: NI_BASE + 2,
    TRON: NI_BASE + 3,
    XRP: NI_BASE + 4,
    DOGECOIN: NI_BASE + 5,
    LITECOIN: NI_BASE + 6,
    BITCOIN_CASH: NI_BASE + 7,
    STELLAR: NI_BASE + 8,
    CARDANO: NI_BASE + 9,
    APTOS: NI_BASE + 10,
    STARKNET: NI_BASE + 11,
    DASH: NI_BASE + 12,
    ZCASH: NI_BASE + 13,
    ALEO: NI_BASE + 14,
    ADI: NI_BASE + 15,
};
/**
 * Human-readable chain slug constants (recommended for non-EVM chains).
 *
 * @example
 * ```ts
 * import { ChainSlug } from "@hypermid/sdk";
 * const quote = await hm.getQuote({
 *   fromChain: ChainSlug.SOLANA,     // "solana"
 *   toChain: ChainSlug.NEAR,         // "near"
 *   ...
 * });
 * ```
 */
export const ChainSlug = Object.fromEntries(CHAIN_REGISTRY.map((c) => [c.slug.toUpperCase().replace(/-/g, "_"), c.slug]));
/**
 * Check if a chain ID belongs to a Near Intents-only chain.
 * Accepts slug strings or numeric IDs.
 */
export function isNearIntentsChain(chainId) {
    if (typeof chainId === "number") {
        return chainId >= NI_BASE && chainId < NI_BASE + 1000;
    }
    const entry = resolveChain(chainId);
    return entry !== null && entry.numericId >= NI_BASE && entry.numericId < NI_BASE + 1000;
}
/**
 * Check if a chain supports wallet-connected deposit mode.
 * Accepts slug strings or numeric IDs.
 */
export function supportsWalletDeposit(chainId) {
    const entry = resolveChain(chainId);
    return entry?.depositMode === "wallet";
}
//# sourceMappingURL=chains.js.map