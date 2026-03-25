// ─── Core client ─────────────────────────────────────────────────────────
export { HyperMid } from "./client.js";

// ─── Errors ──────────────────────────────────────────────────────────────
export { HyperMidError, HyperMidTimeoutError, HyperMidNetworkError } from "./errors.js";

// ─── Chain constants ─────────────────────────────────────────────────────
export { ChainId, isNearIntentsChain, supportsWalletDeposit } from "./chains.js";
export type { ChainIdValue } from "./chains.js";

// ─── Type guards & helpers ───────────────────────────────────────────────
export {
  isLiFiRoute,
  isNearIntentsRoute,
  isManualDeposit,
  isWalletDeposit,
  isNIStatusTerminal,
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

// ─── Webhook verification ────────────────────────────────────────────────
export { verifyWebhookSignature } from "./webhook-verify.js";

// ─── Types ───────────────────────────────────────────────────────────────
export type {
  // Config
  HyperMidConfig,

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
  LiFiToolError,

  // Routes
  RoutesParams,

  // Status
  StatusParams,
  LiFiStatusParams,
  NIStatusParams,
  StatusResponse,

  // Execute
  DepositMode,
  ExecuteParams,
  ExecuteResponse,
  LiFiExecuteResponse,
  NIExecuteResponse,
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

  // Ping
  PingResponse,
} from "./types.js";
