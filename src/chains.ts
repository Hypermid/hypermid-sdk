/**
 * Chain ID constants for all supported chains.
 *
 * @example
 * ```ts
 * import { ChainId } from "@hypermid/sdk";
 *
 * const quote = await hm.getQuote({
 *   fromChain: ChainId.ETHEREUM,
 *   toChain: ChainId.ARBITRUM,
 *   ...
 * });
 * ```
 */

const NI_BASE = 900_000_000;

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
} as const;

export type ChainIdValue = (typeof ChainId)[keyof typeof ChainId];

/**
 * Check if a chain ID belongs to a Near Intents-only chain.
 */
export function isNearIntentsChain(chainId: number): boolean {
  return chainId >= NI_BASE && chainId < NI_BASE + 1000;
}

/**
 * Check if a chain supports wallet-connected deposit mode.
 * Chains with wallet connectors: EVM, Solana, Bitcoin, Sui, TON, Tron.
 * Other NI chains (NEAR, XRP, DOGE, etc.) require manual deposit.
 */
export function supportsWalletDeposit(chainId: number): boolean {
  if (chainId > 0 && chainId < NI_BASE) return true; // EVM
  if (chainId === ChainId.SOLANA) return true;
  if (chainId === ChainId.BITCOIN) return true;
  if (chainId === ChainId.SUI) return true;
  if (chainId === ChainId.TON) return true;
  if (chainId === ChainId.TRON) return true;
  return false;
}
