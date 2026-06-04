/**
 * Unified Hypermid Chain Registry
 *
 * Single source of truth for all chain definitions across the Hypermid platform.
 * Maps Hypermid chain slugs to internal numeric IDs, LiFi chain IDs, and
 * Near Intents blockchain strings.
 *
 * Design:
 *   - EVM chains keep their standard numeric chain IDs (1, 42161, 8453...)
 *   - Non-EVM chains use human-readable string slugs ("solana", "bitcoin", "near")
 *   - Both formats are always accepted via resolveChain()
 *   - Protocol routing (LiFi vs Near Intents) is handled internally
 *
 * @example
 * ```ts
 * import { resolveChain, ChainSlug } from "@hypermid/sdk";
 *
 * // Resolve by slug or numeric ID — both work
 * const eth = resolveChain("ethereum");   // { slug: "ethereum", numericId: 1, ... }
 * const arb = resolveChain(42161);        // { slug: "arbitrum", numericId: 42161, ... }
 * const sol = resolveChain("solana");     // { slug: "solana", numericId: 1151111081099710, ... }
 * ```
 */
export type ChainType = "evm" | "svm" | "utxo" | "near" | "ton" | "tvm" | "xrp" | "stellar" | "cardano" | "aptos" | "starknet" | "mvm" | "aleo" | "other";
export type Provider = "lifi" | "near-intents";
export type DepositMode = "wallet" | "manual";
export interface ChainEntry {
    /** Human-readable slug — the Hypermid chain identifier */
    slug: string;
    /** Internal numeric chain ID (EVM chain ID, LiFi ID, or NI range ID) */
    numericId: number;
    /** Display name */
    name: string;
    /** Chain type / ecosystem */
    type: ChainType;
    /** Which routing backends support this chain */
    providers: Provider[];
    /** Chain ID that LiFi expects (undefined if LiFi doesn't support this chain) */
    lifiChainId?: number;
    /** Near Intents blockchain string (undefined if NI doesn't support this chain) */
    niBlockchain?: string;
    /** Default deposit mode */
    depositMode: DepositMode;
    /** Native token info */
    nativeToken: {
        symbol: string;
        name: string;
        decimals: number;
    };
    /** Placeholder address for dry quotes (no real funds sent) */
    dryQuotePlaceholder?: string;
}
export declare const CHAIN_REGISTRY: ChainEntry[];
/**
 * Resolve a chain by slug (string) or numeric ID (number).
 * Returns the ChainEntry or null if not found.
 *
 * @example
 * resolveChain("ethereum")     → { slug: "ethereum", numericId: 1, ... }
 * resolveChain(42161)          → { slug: "arbitrum", numericId: 42161, ... }
 * resolveChain("solana")       → { slug: "solana", numericId: 1151111081099710, ... }
 * resolveChain(1151111081099710) → { slug: "solana", numericId: 1151111081099710, ... }
 */
export declare function resolveChain(input: string | number): ChainEntry | null;
/**
 * Convert any chain identifier to the LiFi chain ID.
 * Returns undefined if LiFi doesn't support this chain.
 */
export declare function toLifiChainId(input: string | number): number | undefined;
/**
 * Convert any chain identifier to the Near Intents blockchain string.
 * Returns undefined if Near Intents doesn't support this chain.
 */
export declare function toNIBlockchain(input: string | number): string | undefined;
/**
 * Convert any chain identifier to the internal numeric ID.
 * This is the canonical numeric ID used internally.
 */
export declare function toNumericId(input: string | number): number | undefined;
/**
 * Check if a chain ID belongs to a Near Intents-only chain (900_000_XXX range).
 */
export declare function isNIOnlyChain(input: string | number): boolean;
/**
 * Check if a chain supports wallet-connected deposit mode.
 */
export declare function supportsWalletDeposit(input: string | number): boolean;
/**
 * Get the dry quote placeholder address for a chain.
 */
export declare function getDryQuotePlaceholder(input: string | number): string | undefined;
/**
 * Get all registered chains.
 */
export declare function getAllChains(): ChainEntry[];
/**
 * Get chains filtered by provider.
 */
export declare function getChainsByProvider(provider: Provider): ChainEntry[];
/**
 * The Near Intents chain ID base constant (900_000_000).
 */
export declare const NI_CHAIN_BASE = 900000000;
//# sourceMappingURL=chain-registry.d.ts.map