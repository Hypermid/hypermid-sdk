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

// ─── Types ──────────────────────────────────────────────────────────────────

export type ChainType =
  | "evm"
  | "svm"
  | "utxo"
  | "near"
  | "ton"
  | "tvm"
  | "xrp"
  | "stellar"
  | "cardano"
  | "aptos"
  | "starknet"
  | "mvm"
  | "aleo"
  | "other";

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

// ─── Constants ─────────────────────────────────────────────────────────────

const NI_BASE = 900_000_000;
const EVM_PLACEHOLDER = "0x0000000000000000000000000000000000000001";

// ─── Chain Registry ────────────────────────────────────────────────────────

export const CHAIN_REGISTRY: ChainEntry[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // EVM Chains (standard chain IDs, supported by LiFi + some by Near Intents)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "ethereum", numericId: 1, name: "Ethereum", type: "evm",
    providers: ["lifi", "near-intents"], lifiChainId: 1, niBlockchain: "eth",
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "optimism", numericId: 10, name: "Optimism", type: "evm",
    providers: ["lifi", "near-intents"], lifiChainId: 10, niBlockchain: "op",
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "flare", numericId: 14, name: "Flare", type: "evm",
    providers: ["lifi"], lifiChainId: 14,
    depositMode: "wallet", nativeToken: { symbol: "FLR", name: "Flare", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "cronos", numericId: 25, name: "Cronos", type: "evm",
    providers: ["lifi"], lifiChainId: 25,
    depositMode: "wallet", nativeToken: { symbol: "CRO", name: "Cronos", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "rootstock", numericId: 30, name: "Rootstock", type: "evm",
    providers: ["lifi"], lifiChainId: 30,
    depositMode: "wallet", nativeToken: { symbol: "RBTC", name: "RSK BTC", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "telos", numericId: 40, name: "Telos", type: "evm",
    providers: ["lifi"], lifiChainId: 40,
    depositMode: "wallet", nativeToken: { symbol: "TLOS", name: "Telos", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "bsc", numericId: 56, name: "BNB Chain", type: "evm",
    providers: ["lifi", "near-intents"], lifiChainId: 56, niBlockchain: "bsc",
    depositMode: "wallet", nativeToken: { symbol: "BNB", name: "BNB", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "gnosis", numericId: 100, name: "Gnosis", type: "evm",
    providers: ["lifi", "near-intents"], lifiChainId: 100, niBlockchain: "gnosis",
    depositMode: "wallet", nativeToken: { symbol: "xDAI", name: "xDAI", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "unichain", numericId: 130, name: "Unichain", type: "evm",
    providers: ["lifi"], lifiChainId: 130,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "polygon", numericId: 137, name: "Polygon", type: "evm",
    providers: ["lifi", "near-intents"], lifiChainId: 137, niBlockchain: "pol",
    depositMode: "wallet", nativeToken: { symbol: "POL", name: "POL", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "sonic", numericId: 146, name: "Sonic", type: "evm",
    providers: ["lifi"], lifiChainId: 146,
    depositMode: "wallet", nativeToken: { symbol: "S", name: "Sonic", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "x-layer", numericId: 196, name: "X Layer", type: "evm",
    providers: ["lifi", "near-intents"], lifiChainId: 196, niBlockchain: "xlayer",
    depositMode: "wallet", nativeToken: { symbol: "OKB", name: "OKB", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "opbnb", numericId: 204, name: "opBNB", type: "evm",
    providers: ["lifi"], lifiChainId: 204,
    depositMode: "wallet", nativeToken: { symbol: "BNB", name: "BNB", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "fraxtal", numericId: 252, name: "Fraxtal", type: "evm",
    providers: ["lifi"], lifiChainId: 252,
    depositMode: "wallet", nativeToken: { symbol: "frxETH", name: "Frax Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "boba", numericId: 288, name: "Boba", type: "evm",
    providers: ["lifi"], lifiChainId: 288,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "zksync", numericId: 324, name: "zkSync Era", type: "evm",
    providers: ["lifi"], lifiChainId: 324,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "world-chain", numericId: 480, name: "World Chain", type: "evm",
    providers: ["lifi"], lifiChainId: 480,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "flow", numericId: 747, name: "Flow", type: "evm",
    providers: ["lifi"], lifiChainId: 747,
    depositMode: "wallet", nativeToken: { symbol: "FLOW", name: "Flow", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "hyperevm", numericId: 999, name: "HyperEVM", type: "evm",
    providers: ["lifi"], lifiChainId: 999,
    depositMode: "wallet", nativeToken: { symbol: "HYPE", name: "HYPE", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "plasma", numericId: 1012, name: "Plasma", type: "evm",
    providers: ["near-intents"], niBlockchain: "plasma",
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "metis", numericId: 1088, name: "Metis", type: "evm",
    providers: ["lifi"], lifiChainId: 1088,
    depositMode: "wallet", nativeToken: { symbol: "METIS", name: "Metis", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "lisk", numericId: 1135, name: "Lisk", type: "evm",
    providers: ["lifi"], lifiChainId: 1135,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "moonbeam", numericId: 1284, name: "Moonbeam", type: "evm",
    providers: ["lifi"], lifiChainId: 1284,
    depositMode: "wallet", nativeToken: { symbol: "GLMR", name: "Glimmer", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "sei", numericId: 1329, name: "Sei", type: "evm",
    providers: ["lifi"], lifiChainId: 1329,
    depositMode: "wallet", nativeToken: { symbol: "SEI", name: "Sei", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "gravity", numericId: 1625, name: "Gravity", type: "evm",
    providers: ["lifi"], lifiChainId: 1625,
    depositMode: "wallet", nativeToken: { symbol: "G", name: "Gravity", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "soneium", numericId: 1868, name: "Soneium", type: "evm",
    providers: ["lifi"], lifiChainId: 1868,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "ronin", numericId: 2020, name: "Ronin", type: "evm",
    providers: ["lifi"], lifiChainId: 2020,
    depositMode: "wallet", nativeToken: { symbol: "RON", name: "Ronin", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "abstract", numericId: 2741, name: "Abstract", type: "evm",
    providers: ["lifi"], lifiChainId: 2741,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "mantle", numericId: 5000, name: "Mantle", type: "evm",
    providers: ["lifi"], lifiChainId: 5000,
    depositMode: "wallet", nativeToken: { symbol: "MNT", name: "Mantle", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "base", numericId: 8453, name: "Base", type: "evm",
    providers: ["lifi", "near-intents"], lifiChainId: 8453, niBlockchain: "base",
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "monad", numericId: 10143, name: "Monad", type: "evm",
    providers: ["near-intents"], niBlockchain: "monad",
    depositMode: "wallet", nativeToken: { symbol: "MON", name: "Monad", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "immutable", numericId: 13371, name: "Immutable zkEVM", type: "evm",
    providers: ["lifi"], lifiChainId: 13371,
    depositMode: "wallet", nativeToken: { symbol: "IMX", name: "IMX", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "apechain", numericId: 33139, name: "Apechain", type: "evm",
    providers: ["lifi"], lifiChainId: 33139,
    depositMode: "wallet", nativeToken: { symbol: "APE", name: "APE", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "mode", numericId: 34443, name: "Mode", type: "evm",
    providers: ["lifi"], lifiChainId: 34443,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "arbitrum", numericId: 42161, name: "Arbitrum", type: "evm",
    providers: ["lifi", "near-intents"], lifiChainId: 42161, niBlockchain: "arb",
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "celo", numericId: 42220, name: "Celo", type: "evm",
    providers: ["lifi"], lifiChainId: 42220,
    depositMode: "wallet", nativeToken: { symbol: "CELO", name: "CELO", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "avalanche", numericId: 43114, name: "Avalanche", type: "evm",
    providers: ["lifi", "near-intents"], lifiChainId: 43114, niBlockchain: "avax",
    depositMode: "wallet", nativeToken: { symbol: "AVAX", name: "Avalanche", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "ink", numericId: 57073, name: "Ink", type: "evm",
    providers: ["lifi"], lifiChainId: 57073,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "linea", numericId: 59144, name: "Linea", type: "evm",
    providers: ["lifi"], lifiChainId: 59144,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "bob", numericId: 60808, name: "BOB", type: "evm",
    providers: ["lifi"], lifiChainId: 60808,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "berachain", numericId: 80094, name: "Berachain", type: "evm",
    providers: ["lifi", "near-intents"], lifiChainId: 80094, niBlockchain: "bera",
    depositMode: "wallet", nativeToken: { symbol: "BERA", name: "Bera", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "blast", numericId: 81457, name: "Blast", type: "evm",
    providers: ["lifi"], lifiChainId: 81457,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "taiko", numericId: 167000, name: "Taiko", type: "evm",
    providers: ["lifi"], lifiChainId: 167000,
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },
  {
    slug: "scroll", numericId: 534352, name: "Scroll", type: "evm",
    providers: ["lifi", "near-intents"], lifiChainId: 534352, niBlockchain: "scroll",
    depositMode: "wallet", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: EVM_PLACEHOLDER,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Non-EVM Chains (shared between LiFi and Near Intents)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "solana", numericId: 1151111081099710, name: "Solana", type: "svm",
    providers: ["lifi", "near-intents"], lifiChainId: 1151111081099710, niBlockchain: "sol",
    depositMode: "wallet", nativeToken: { symbol: "SOL", name: "Solana", decimals: 9 },
    dryQuotePlaceholder: "11111111111111111111111111111111",
  },
  {
    slug: "bitcoin", numericId: 20000000000001, name: "Bitcoin", type: "utxo",
    providers: ["lifi", "near-intents"], lifiChainId: 20000000000001, niBlockchain: "btc",
    depositMode: "wallet", nativeToken: { symbol: "BTC", name: "Bitcoin", decimals: 8 },
    dryQuotePlaceholder: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  },
  {
    slug: "sui", numericId: 9270000000000000, name: "Sui", type: "mvm",
    providers: ["lifi", "near-intents"], lifiChainId: 9270000000000000, niBlockchain: "sui",
    depositMode: "wallet", nativeToken: { symbol: "SUI", name: "Sui", decimals: 9 },
    dryQuotePlaceholder: "0x0000000000000000000000000000000000000000000000000000000000000002",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Near Intents-only Chains (900_000_XXX range)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "near", numericId: NI_BASE + 1, name: "NEAR", type: "near",
    providers: ["near-intents"], niBlockchain: "near",
    depositMode: "manual", nativeToken: { symbol: "NEAR", name: "NEAR", decimals: 24 },
    dryQuotePlaceholder: "dontuse.near",
  },
  {
    slug: "ton", numericId: NI_BASE + 2, name: "TON", type: "ton",
    providers: ["near-intents"], niBlockchain: "ton",
    depositMode: "wallet", nativeToken: { symbol: "TON", name: "Toncoin", decimals: 9 },
    dryQuotePlaceholder: "EQAblnTrpCt2FnOwlwGORzJJJbWAniJa4OPyf8XMtm16HxaR",
  },
  {
    slug: "tron", numericId: NI_BASE + 3, name: "Tron", type: "tvm",
    providers: ["near-intents"], niBlockchain: "tron",
    depositMode: "wallet", nativeToken: { symbol: "TRX", name: "TRON", decimals: 6 },
    dryQuotePlaceholder: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
  },
  {
    slug: "xrp", numericId: NI_BASE + 4, name: "XRP Ledger", type: "xrp",
    providers: ["near-intents"], niBlockchain: "xrp",
    depositMode: "manual", nativeToken: { symbol: "XRP", name: "XRP", decimals: 6 },
    dryQuotePlaceholder: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
  },
  {
    slug: "doge", numericId: NI_BASE + 5, name: "Dogecoin", type: "utxo",
    providers: ["near-intents"], niBlockchain: "doge",
    depositMode: "manual", nativeToken: { symbol: "DOGE", name: "Dogecoin", decimals: 8 },
    dryQuotePlaceholder: "DRapidDiBYggT1zdrELnVhNDqyAHn89cRi",
  },
  {
    slug: "litecoin", numericId: NI_BASE + 6, name: "Litecoin", type: "utxo",
    providers: ["near-intents"], niBlockchain: "ltc",
    depositMode: "manual", nativeToken: { symbol: "LTC", name: "Litecoin", decimals: 8 },
    dryQuotePlaceholder: "LhyLNfBkoKshT7R8Pce6vkB9T2cP2o84hx",
  },
  {
    slug: "bitcoin-cash", numericId: NI_BASE + 7, name: "Bitcoin Cash", type: "utxo",
    providers: ["near-intents"], niBlockchain: "bch",
    depositMode: "manual", nativeToken: { symbol: "BCH", name: "Bitcoin Cash", decimals: 8 },
    dryQuotePlaceholder: "bitcoincash:qp3wjpa3tjlj042z2wv7hahsldgwhwy0rq9sywjpyy",
  },
  {
    slug: "stellar", numericId: NI_BASE + 8, name: "Stellar", type: "stellar",
    providers: ["near-intents"], niBlockchain: "stellar",
    depositMode: "manual", nativeToken: { symbol: "XLM", name: "Stellar Lumen", decimals: 7 },
    dryQuotePlaceholder: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
  },
  {
    slug: "cardano", numericId: NI_BASE + 9, name: "Cardano", type: "cardano",
    providers: ["near-intents"], niBlockchain: "cardano",
    depositMode: "manual", nativeToken: { symbol: "ADA", name: "Cardano", decimals: 6 },
    dryQuotePlaceholder: "addr1vy5zuhh9685fup86syuzmu3e6eengzv8t46mfqxg086cvqqrukl6w",
  },
  {
    slug: "aptos", numericId: NI_BASE + 10, name: "Aptos", type: "aptos",
    providers: ["near-intents"], niBlockchain: "aptos",
    depositMode: "manual", nativeToken: { symbol: "APT", name: "Aptos", decimals: 8 },
    dryQuotePlaceholder: "0x0000000000000000000000000000000000000000000000000000000000000001",
  },
  {
    slug: "starknet", numericId: NI_BASE + 11, name: "StarkNet", type: "starknet",
    providers: ["near-intents"], niBlockchain: "starknet",
    depositMode: "manual", nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    dryQuotePlaceholder: "0x0000000000000000000000000000000000000000000000000000000000000001",
  },
  {
    slug: "dash", numericId: NI_BASE + 12, name: "Dash", type: "utxo",
    providers: ["near-intents"], niBlockchain: "dash",
    depositMode: "manual", nativeToken: { symbol: "DASH", name: "Dash", decimals: 8 },
    dryQuotePlaceholder: "XqL1DXzfqWcMKbhswTBYFGKtdfYJC2JWnj",
  },
  {
    slug: "zcash", numericId: NI_BASE + 13, name: "Zcash", type: "utxo",
    providers: ["near-intents"], niBlockchain: "zec",
    depositMode: "manual", nativeToken: { symbol: "ZEC", name: "Zcash", decimals: 8 },
    dryQuotePlaceholder: "t1Rv4exT7bqhZqi2j7xz8bUHDMxwosrjADU",
  },
  {
    slug: "aleo", numericId: NI_BASE + 14, name: "Aleo", type: "aleo",
    providers: ["near-intents"], niBlockchain: "aleo",
    depositMode: "manual", nativeToken: { symbol: "ALEO", name: "Aleo", decimals: 6 },
    dryQuotePlaceholder: "aleo1qnr4dkkvkgfqph0vzc3y6z2eu975wnpz2925ntjccd5cfqxtyu8sta57j8",
  },
  {
    slug: "adi", numericId: NI_BASE + 15, name: "ADI", type: "other",
    providers: ["near-intents"], niBlockchain: "adi",
    depositMode: "manual", nativeToken: { symbol: "ADI", name: "ADI", decimals: 18 },
  },
];

// ─── Lookup Maps (built once, O(1) access) ─────────────────────────────────

const bySlug = new Map<string, ChainEntry>();
const byNumericId = new Map<number, ChainEntry>();
const byNiBlockchain = new Map<string, ChainEntry>();

for (const entry of CHAIN_REGISTRY) {
  bySlug.set(entry.slug, entry);
  byNumericId.set(entry.numericId, entry);
  if (entry.niBlockchain) {
    byNiBlockchain.set(entry.niBlockchain, entry);
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

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
export function resolveChain(input: string | number): ChainEntry | null {
  if (typeof input === "number") {
    return byNumericId.get(input) ?? null;
  }
  // Try slug first
  const slugMatch = bySlug.get(input.toLowerCase());
  if (slugMatch) return slugMatch;
  // Try as numeric string
  const num = Number(input);
  if (!isNaN(num) && Number.isFinite(num)) {
    return byNumericId.get(num) ?? null;
  }
  // Try as NI blockchain string (e.g., "eth", "arb", "sol")
  return byNiBlockchain.get(input.toLowerCase()) ?? null;
}

/**
 * Convert any chain identifier to the LiFi chain ID.
 * Returns undefined if LiFi doesn't support this chain.
 */
export function toLifiChainId(input: string | number): number | undefined {
  return resolveChain(input)?.lifiChainId;
}

/**
 * Convert any chain identifier to the Near Intents blockchain string.
 * Returns undefined if Near Intents doesn't support this chain.
 */
export function toNIBlockchain(input: string | number): string | undefined {
  return resolveChain(input)?.niBlockchain;
}

/**
 * Convert any chain identifier to the internal numeric ID.
 * This is the canonical numeric ID used internally.
 */
export function toNumericId(input: string | number): number | undefined {
  return resolveChain(input)?.numericId;
}

/**
 * Check if a chain ID belongs to a Near Intents-only chain (900_000_XXX range).
 */
export function isNIOnlyChain(input: string | number): boolean {
  const entry = resolveChain(input);
  if (!entry) return false;
  return entry.providers.length === 1 && entry.providers[0] === "near-intents";
}

/**
 * Check if a chain supports wallet-connected deposit mode.
 */
export function supportsWalletDeposit(input: string | number): boolean {
  const entry = resolveChain(input);
  return entry?.depositMode === "wallet";
}

/**
 * Get the dry quote placeholder address for a chain.
 */
export function getDryQuotePlaceholder(input: string | number): string | undefined {
  return resolveChain(input)?.dryQuotePlaceholder;
}

/**
 * Get all registered chains.
 */
export function getAllChains(): ChainEntry[] {
  return [...CHAIN_REGISTRY];
}

/**
 * Get chains filtered by provider.
 */
export function getChainsByProvider(provider: Provider): ChainEntry[] {
  return CHAIN_REGISTRY.filter((c) => c.providers.includes(provider));
}

/**
 * The Near Intents chain ID base constant (900_000_000).
 */
export const NI_CHAIN_BASE = NI_BASE;
