// ─── Core client ─────────────────────────────────────────────────────────
export { Hypermid } from "./client.js";

// ─── Errors ──────────────────────────────────────────────────────────────
export { HypermidError, HypermidTimeoutError, HypermidNetworkError } from "./errors.js";

// ─── Chain constants ─────────────────────────────────────────────────────
export { ChainId, ChainSlug, isNearIntentsChain, supportsWalletDeposit } from "./chains.js";
export type { ChainIdValue } from "./chains.js";

// ─── Chain registry ─────────────────────────────────────────────────
export {
  CHAIN_REGISTRY,
  NI_CHAIN_BASE,
  resolveChain,
  toLifiChainId,
  toNIBlockchain,
  toNumericId,
  isNIOnlyChain,
  getAllChains,
  getChainsByProvider,
  getDryQuotePlaceholder,
} from "./chain-registry.js";
export type { ChainEntry, ChainType, Provider } from "./chain-registry.js";

// ─── Type guards & helpers ───────────────────────────────────────────────
export {
  isLiFiRoute,
  isNearIntentsRoute,
  isSuperSwapRoute,
  isManualDeposit,
  isWalletDeposit,
  isNIStatusTerminal,
  isSuperSwapStatusTerminal,
  isLiFiStatusTerminal,
  isDepositSuccess,
  isDepositRefunded,
  isDepositFailed,
} from "./helpers.js";

// ─── Execution lifecycle ─────────────────────────────────────────────────
export {
  executeSwap,
  waitForDepositCompletion,
  waitForLiFiCompletion,
  quoteAndPrepare,
} from "./execution.js";
export type {
  ExecutionStatus,
  ExecutionUpdate,
  ExecutionHooks,
  ExecutionConfig,
} from "./execution.js";

// ─── EIP-7702 / EIP-5792 atomic batch (1-tap approve + swap) ──────────────
export {
  supportsAtomicBatch,
  sendAtomicApproveAndSwap,
  encodeApprove,
} from "./eip7702.js";
export type { Eip1193Provider, AtomicSwapParams } from "./eip7702.js";

// ─── Webhook verification ────────────────────────────────────────────────
export { verifyWebhookSignature } from "./webhook-verify.js";

// ─── Types ───────────────────────────────────────────────────────────────
export type {
  // Config
  HypermidConfig,

  // API envelope
  ApiResponse,
  ApiMeta,
  RateLimitInfo,

  // Chains
  Chain,
  NativeToken,
  ChainsResponse,

  // Tokens
  Token,
  TokensParams,
  TokensResponse,

  // Connections
  ConnectionsParams,

  // Gas
  GasPricesParams,

  // Quote
  QuoteParams,
  QuoteResponse,
  SuperSwapV2Quote,
  LiFiToolError,

  // Routes
  RoutesParams,

  // Status
  StatusParams,
  LiFiStatusParams,
  NIStatusParams,
  StatusResponse,
  SuperSwapV2Status,
  SuperSwapV2StatusLeg,

  // Execute
  DepositMode,
  ExecuteParams,
  ExecuteResponse,
  LiFiExecuteResponse,
  NIExecuteResponse,
  SuperSwapExecuteResponse,
  TransactionRequest,

  // Deposit
  DepositSubmitParams,
  DepositSubmitResponse,
  DepositStatusParams,
  DepositStatusResponse,
  SwapDetails,

  // On-ramp
  OnrampQuoteParams,
  OnrampCheckoutParams,
  OnrampCheckoutResponse,
  OnrampStatusResponse,
  OnrampConfigResponse,
  OnrampAssetsParams,

  // Swap event
  SwapEventParams,
  SwapEventResponse,

  // Partner
  PartnerInfo,
  PartnerStats,
  PartnerStatsParams,
  Transaction,
  PaginatedResponse,
  PaginationParams,

  // Webhooks
  WebhookEvent,
  CreateWebhookParams,
  Webhook,
  WebhookCreated,
  WebhooksListResponse,

  // Balances
  BalancesParams,
  BalancesResponse,
  BalanceChainMeta,
  TokenBalance,

  // Inbound Receiver (SuperSwap)
  InboundReceiverParams,
  InboundReceiverResponse,

  // Ping
  PingResponse,
} from "./types.js";
