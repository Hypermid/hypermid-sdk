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
export declare const ChainId: {
    readonly ETHEREUM: 1;
    readonly OPTIMISM: 10;
    readonly BSC: 56;
    readonly GNOSIS: 100;
    readonly POLYGON: 137;
    readonly X_LAYER: 196;
    readonly ARBITRUM: 42161;
    readonly AVALANCHE: 43114;
    readonly BASE: 8453;
    readonly PLASMA: 1012;
    readonly BERACHAIN: 80094;
    readonly MONAD: 10143;
    readonly SOLANA: 1151111081099710;
    readonly BITCOIN: 20000000000001;
    readonly SUI: 9270000000000000;
    readonly NEAR: number;
    readonly TON: number;
    readonly TRON: number;
    readonly XRP: number;
    readonly DOGECOIN: number;
    readonly LITECOIN: number;
    readonly BITCOIN_CASH: number;
    readonly STELLAR: number;
    readonly CARDANO: number;
    readonly APTOS: number;
    readonly STARKNET: number;
    readonly DASH: number;
    readonly ZCASH: number;
    readonly ALEO: number;
    readonly ADI: number;
};
export type ChainIdValue = (typeof ChainId)[keyof typeof ChainId];
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
export declare const ChainSlug: {
    [K: string]: string;
};
/**
 * Check if a chain ID belongs to a Near Intents-only chain.
 * Accepts slug strings or numeric IDs.
 */
export declare function isNearIntentsChain(chainId: string | number): boolean;
/**
 * Check if a chain supports wallet-connected deposit mode.
 * Accepts slug strings or numeric IDs.
 */
export declare function supportsWalletDeposit(chainId: string | number): boolean;
//# sourceMappingURL=chains.d.ts.map