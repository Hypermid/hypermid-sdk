// ─── API Response Envelope ────────────────────────────────────────────────

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface ApiMeta {
  requestId: string;
  timestamp: number;
  rateLimit?: RateLimitInfo;
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: { code: string; message: string; details?: Record<string, unknown> } | null;
  meta: ApiMeta;
}

// ─── Config ──────────────────────────────────────────────────────────────

export interface HyperMidConfig {
  /** API key for authenticated access (2000 req/min, partner fee tier). Optional — anonymous = 100 req/min. */
  apiKey?: string;
  /** Base URL override (default: https://api.hypermid.io) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom fetch implementation (default: globalThis.fetch) */
  fetch?: typeof globalThis.fetch;
}

// ─── Chains ──────────────────────────────────────────────────────────────

export interface NativeToken {
  symbol: string;
  name: string;
  decimals: number;
}

export interface Chain {
  id: number;
  key: string;
  name: string;
  chainType: string;
  nativeToken: NativeToken;
  /** Hypermid chain slug (e.g. "ethereum", "solana", "near") */
  slug?: string;
  /** Which routing providers support this chain (e.g. ["lifi", "near-intents"]) */
  providers?: string[];
  provider?: string;
  /** LI.FI chains include additional metadata (logo, coin, etc.) */
  [key: string]: unknown;
}

export interface ChainsResponse {
  chains: Chain[];
}

// ─── Tokens ──────────────────────────────────────────────────────────────

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
  priceUSD?: string;
  [key: string]: unknown;
}

export interface TokensResponse {
  tokens: Record<string, Token[]>;
}

export interface TokensParams {
  chains?: string;
  keywords?: string;
}

// ─── Connections ─────────────────────────────────────────────────────────

export interface ConnectionsParams {
  fromChain: string | number;
  fromToken: string;
  toChain?: string | number;
}

// ─── Tools ───────────────────────────────────────────────────────────────

export interface Tool {
  key: string;
  name: string;
  type: string;
  [key: string]: unknown;
}

// ─── Gas ─────────────────────────────────────────────────────────────────

export interface GasPricesParams {
  chains: string;
}

// ─── Quote ───────────────────────────────────────────────────────────────

export interface QuoteParams {
  fromChain: string | number;
  fromToken: string;
  fromAmount: string;
  toChain: string | number;
  toToken: string;
  fromAddress: string;
  toAddress?: string;
  slippage?: number | string;
  order?: "RECOMMENDED" | "FASTEST" | "CHEAPEST";
}

export interface LiFiToolError {
  tool: string;
  code: string;
  message: string;
}

export interface QuoteResponse {
  quote: unknown;
  provider: "lifi" | "near-intents";
  feeBps: number;
  isDryQuote: boolean;
}

// ─── Routes ──────────────────────────────────────────────────────────────

export interface RoutesParams {
  fromChain: string | number;
  fromToken: string;
  fromAmount: string;
  toChain: string | number;
  toToken: string;
  fromAddress: string;
  toAddress?: string;
  slippage?: number | string;
  order?: "RECOMMENDED" | "FASTEST" | "CHEAPEST";
}

// ─── Status ──────────────────────────────────────────────────────────────

export interface LiFiStatusParams {
  txHash: string;
  bridge?: string;
  fromChain?: string | number;
  toChain?: string | number;
}

export interface NIStatusParams {
  provider: "near-intents";
  correlationId: string;
}

export type StatusParams = LiFiStatusParams | NIStatusParams;

export interface StatusResponse {
  provider: "lifi" | "near-intents";
  status?: string;
  [key: string]: unknown;
}

// ─── Execute ─────────────────────────────────────────────────────────────

export type DepositMode = "wallet" | "manual";

export interface ExecuteParams {
  fromChain: string | number;
  fromToken: string;
  fromAmount: string;
  toChain: string | number;
  toToken: string;
  fromAddress: string;
  toAddress: string;
  /** Override deposit mode. Default: auto-detected from chain type. */
  depositMode?: DepositMode;
  slippage?: number | string;
  order?: "RECOMMENDED" | "FASTEST" | "CHEAPEST";
  refundAddress?: string;
}

export interface TransactionRequest {
  to: string;
  data: string;
  value: string;
  from: string;
  chainId: number;
  gasLimit?: string;
  gasPrice?: string;
  [key: string]: unknown;
}

export interface LiFiExecuteResponse {
  provider: "lifi";
  depositMode: "wallet";
  transactionRequest: TransactionRequest;
  quote: {
    fromToken: Token;
    toToken: Token;
    fromAmount: string;
    toAmount: string;
    toAmountMin: string;
    estimatedTime: number;
    gasCosts: unknown[];
    feeCosts: unknown[];
  };
  feeBps: number;
  instructions: {
    step1: string;
    step2: string;
  };
}

export interface NIExecuteResponse {
  provider: "near-intents";
  depositMode: DepositMode;
  depositAddress: string;
  depositMemo?: string;
  expectedOutput: string;
  expectedOutputUsd?: number;
  minAmountOut?: string;
  timeEstimate?: number;
  correlationId?: string;
  feeBps: number;
  instructions: {
    step1: string;
    step2: string;
    step3: string;
  };
}

export interface SuperSwapExecuteResponse {
  provider: "superswap";
  depositMode: "wallet";
  transactionRequest: TransactionRequest;
  quote: {
    fromToken: Token;
    toToken: Token;
    fromAmount: string;
    toAmount: string;
    toAmountMin: string;
    estimatedTime: number;
    gasCosts: unknown[];
    feeCosts: unknown[];
  };
  feeBps: number;
  superswapMeta: {
    direction: "inbound" | "outbound";
    bridgeToken: string;
    destinationToken: string;
    hyperlaneMessageId?: string;
  };
  instructions: {
    step1: string;
    step2: string;
  };
}

export type ExecuteResponse = LiFiExecuteResponse | NIExecuteResponse | SuperSwapExecuteResponse;

// ─── Deposit (Near Intents) ──────────────────────────────────────────────

export interface DepositSubmitParams {
  txHash: string;
  depositAddress: string;
}

export interface DepositSubmitResponse {
  submitted: boolean;
  txHash: string;
  depositAddress: string;
  nextStep: string;
}

export interface DepositStatusParams {
  depositAddress: string;
  depositMemo?: string;
}

export interface SwapDetails {
  amountOut?: string;
  amountOutFormatted?: string;
  amountOutUsd?: number;
  destinationChainTxHashes?: string[];
  refundedAmount?: string;
  refundReason?: string;
}

export interface DepositStatusResponse {
  provider: "near-intents";
  status: string;
  depositAddress: string;
  swapDetails?: SwapDetails;
}

// ─── On-Ramp ─────────────────────────────────────────────────────────────

export interface OnrampQuoteParams {
  fiatAmount: number | string;
  fiatCurrency: string;
  cryptoToken: string;
  cryptoChain: string;
  walletAddress?: string;
  paymentMode?: string;
  userCountry?: string;
}

export interface OnrampCheckoutParams {
  walletAddress: string;
  cryptoToken: string;
  cryptoChain: string;
  fiatCurrency: string;
  fiatAmount: number | string;
  email?: string;
  returnUrl?: string;
  paymentMode?: string;
}

export interface OnrampCheckoutResponse {
  redirectUrl: string;
  orderUid: string;
  externalOrderUid: string;
}

export interface OnrampStatusResponse {
  status: "waiting" | "processing" | "completed" | "failed" | "expired" | "canceled";
  orderUid: string;
  dstAmount?: string;
  txHash?: string;
  message?: string;
}

export interface OnrampConfigResponse {
  chains: Record<string, string[]>;
}

export interface OnrampAssetsParams {
  currency: string;
  chain: string;
  orderCurrency?: string;
}

// ─── Swap Event ──────────────────────────────────────────────────────────

export interface SwapEventParams {
  provider?: string;
  from_chain?: string;
  from_token?: string;
  to_chain?: string;
  to_token?: string;
  amount_usd?: number;
  fee_usd?: number;
  tx_hash?: string;
  wallet_hash?: string;
  status: string;
  from_amount?: string;
  to_amount?: string;
  duration_seconds?: number;
  error_message?: string;
}

export interface SwapEventResponse {
  updated: boolean;
  id: number | bigint;
}

// ─── Partner ─────────────────────────────────────────────────────────────

export interface PartnerInfo {
  id: string;
  name: string;
  email: string;
  status: string;
  tier: string;
  fee_bps: number;
  volume_total: number;
  tx_count: number;
  created_at: string;
}

export interface PartnerStats {
  tx_count: number;
  completed_count: number;
  failed_count: number;
  volume_usd: number;
  fees_earned_usd: number;
  avg_duration_seconds: number;
  by_chain: Array<{ chain: string; count: number; volume: number }>;
  by_provider: Array<{ provider: string; count: number }>;
}

export interface PartnerStatsParams {
  from?: string;
  to?: string;
}

export interface Transaction {
  id: number;
  provider: string;
  from_chain: string;
  from_token: string;
  to_chain: string;
  to_token: string;
  amount_usd: number;
  fee_usd: number;
  tx_hash: string;
  wallet_hash: string;
  status: string;
  from_amount: string;
  to_amount: string;
  duration_seconds: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ─── Webhooks ────────────────────────────────────────────────────────────

export type WebhookEvent = "swap.completed" | "onramp.completed";

export interface CreateWebhookParams {
  url: string;
  events?: WebhookEvent[];
}

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  status: string;
  created_at: string;
}

export interface WebhookCreated extends Webhook {
  /** The webhook signing secret — only returned on creation. Store securely! */
  secret: string;
}

export interface WebhooksListResponse {
  webhooks: Webhook[];
}

// ─── Balances ──────────────────────────────────────────────────────────

export interface BalancesParams {
  address: string;
  chainIds?: number[];
}

export interface TokenBalance {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  priceUSD: number;
  balanceUSD: number;
  logoURI: string;
  providers: string[];
}

export interface BalancesResponse {
  address: string;
  totalBalanceUSD: string;
  balances: Record<string, TokenBalance[]>;
}

// ─── Inbound Receiver (SuperSwap) ──────────────────────────────────────

export interface InboundReceiverParams {
  txHash: string;
  fromChain: number;
  toChain: number;
  receiverAddress: string;
  outputToken: string;
  signature?: string;
}

export interface InboundReceiverResponse {
  registered: boolean;
  recordId: string;
  usdcAmount: string;
  status: string;
}

// ─── Ping ────────────────────────────────────────────────────────────────

export interface PingResponse {
  status: string;
  version: string;
  uptime: number;
  timestamp: number;
  providers: {
    lifi: string;
    nearIntents: string;
    rampnow: string;
  };
}
