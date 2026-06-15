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
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    } | null;
    meta: ApiMeta;
}
export interface HypermidConfig {
    /**
     * Partner API key. **Optional** — the API works fully without a key.
     * Set this only if you're a partner with negotiated fee terms
     * (custom splits, discounts, higher rate limits). Sent as `X-API-Key`.
     */
    apiKey?: string;
    /** Base URL override (default: https://api.hypermid.io) */
    baseUrl?: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Custom fetch implementation (default: globalThis.fetch) */
    fetch?: typeof globalThis.fetch;
}
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
export interface ConnectionsParams {
    fromChain: string | number;
    fromToken: string;
    toChain?: string | number;
}
export interface Tool {
    key: string;
    name: string;
    type: string;
    [key: string]: unknown;
}
export interface GasPricesParams {
    chains: string;
}
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
    provider: "lifi" | "near-intents" | "superswap";
    feeBps: number;
    isDryQuote: boolean;
}
/**
 * SuperSwap V2 quote shape (the `quote` field when `provider === "superswap"`).
 *
 * The V2 backend returns a LiFi-style executable envelope. Cast the opaque
 * `QuoteResponse.quote` to this once you've discriminated on the provider:
 *
 * ```ts
 * const res = await hm.getQuote(params);
 * if (res.provider === "superswap") {
 *   const q = res.quote as SuperSwapV2Quote;
 *   // approve q.approvalAddress, then send q.transactionRequest
 * }
 * ```
 */
export interface SuperSwapV2Quote {
    id: string;
    provider: "superswap";
    /** V2 routing source: "lifi" | "piteas" | "uniswap_v3" | "superswap". */
    source: string;
    tool: string;
    /** Always true — marks the turnkey V2 path. */
    v2: true;
    direction: "inbound" | "outbound" | "samechain";
    fromChainId: number;
    toChainId: number;
    fromToken: {
        address: string;
        symbol: string;
        decimals: number;
    };
    toToken: {
        address: string;
        symbol: string;
        decimals: number;
    };
    fromAmount: string;
    estimatedOutput: string;
    minOutput: string;
    estimatedDuration: number;
    /** ERC20 approval target (source DiamondShell). Equals transactionRequest.to. */
    approvalAddress: string;
    fromAmountUSD?: string;
    toAmountUSD?: string;
    /** Quote staleness — reject after this (unix seconds). */
    expiresAt: number;
    transactionRequest: TransactionRequest;
}
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
    provider: "lifi" | "near-intents" | "superswap";
    status?: string;
    [key: string]: unknown;
}
/** One leg (sending/receiving) of a SuperSwap V2 transfer. */
export interface SuperSwapV2StatusLeg {
    txHash: string;
    chainId: number;
    amount: string;
    token: {
        address: string;
        symbol: string;
        decimals: number;
    };
}
/**
 * SuperSwap V2 status shape (when `provider === "superswap"`). A `StatusResponse`
 * with `provider === "superswap"` carries these extra fields; cast to read them.
 *
 * ```ts
 * const s = await hm.getStatus(params);
 * if (s.provider === "superswap") {
 *   const v2 = s as SuperSwapV2Status;
 *   console.log(v2.hyperlaneMessageId, v2.receiving?.txHash);
 * }
 * ```
 */
export interface SuperSwapV2Status extends StatusResponse {
    provider: "superswap";
    /** Canonical V2 vocabulary. */
    status: "PENDING" | "DONE" | "FAILED" | "NOT_FOUND" | "INVALID";
    tool: string;
    /** Hyperlane messageId — stable across both legs. */
    hyperlaneMessageId: string;
    subStatus?: string | null;
    subStatusMessage?: string | null;
    sending?: SuperSwapV2StatusLeg | null;
    receiving?: SuperSwapV2StatusLeg | null;
    /** Convenience mirror of receiving.txHash. */
    destinationTxHash?: string;
}
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
    by_chain: Array<{
        chain: string;
        count: number;
        volume: number;
    }>;
    by_provider: Array<{
        provider: string;
        count: number;
    }>;
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
export interface BalancesParams {
    address: string;
    chainIds?: number[];
}
/**
 * Tier classification surfaced on each /v1/balances row so SDK
 * consumers can show priced holdings prominently and tuck away dust /
 * scam-airdrop noise. Optional — older API revisions don't emit it.
 *
 *   - "priced":    USD price > 0 AND balanceUSD ≥ floor (default 0.01).
 *   - "untracked": no USD price, doesn't match scam patterns.
 *   - "dust":      scam pattern OR balanceUSD below floor.
 */
export type BalanceTier = 'priced' | 'untracked' | 'dust';
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
    /** Lark #118 — present when the API ran tier classification. */
    tier?: BalanceTier;
}
/**
 * Per-chain status metadata, added alongside `balances` so callers can
 * distinguish "no tokens on this chain" from "upstream timed out — try
 * again" without inspecting the actual balance array.
 *
 * Legacy callers that only read `balances`/`totalBalanceUSD` continue
 * to work unchanged; `chainMeta`/`cacheHit`/`cachedAt` are optional.
 */
export interface BalanceChainMeta {
    /** true when the chain's balance fetch completed successfully. */
    ok: boolean;
    /** Populated when `ok=false`. Distinguishes user-fixable from transient errors. */
    error?: 'timeout' | 'degraded' | 'rpc_error' | 'unsupported';
    /** Which upstream served (or tried to serve) this chain. */
    source?: 'alchemy' | 'multicall' | 'blockstream' | 'pulsechain';
    /** Wall-clock milliseconds spent fetching this chain. */
    durationMs: number;
    /** True when the data was served from a stale cache because the upstream is degraded. */
    stale?: boolean;
}
export interface BalancesResponse {
    address: string;
    totalBalanceUSD: string;
    balances: Record<string, TokenBalance[]>;
    /** Per-chain status. Use it to render a retry chip for failing chains
     *  instead of hiding them from the UI. */
    chainMeta?: Record<string, BalanceChainMeta>;
    /** ISO timestamp of when the payload was generated (or last refreshed). */
    cachedAt?: string;
    /** True when the backend served from its 30-s result cache. */
    cacheHit?: boolean;
}
export interface InboundReceiverParams {
    /** Source-chain tx hash that deposited USDC into the InboundReceiver */
    txHash: string;
    /** Address that sent the deposit (must match the tx sender on-chain) */
    fromAddress: string;
    /** Destination address that will receive the output token on PulseChain */
    toAddress: string;
    /** Output token address on PulseChain (e.g. WPLS, HEX, USDCh) */
    outputToken: string;
    /** Destination Hyperlane domain (369 for PulseChain) */
    destinationDomain: number;
    /**
     * EIP-712 signature over `RegisterDeposit(txHash, toAddress, outputToken,
     * destinationDomain)` with domain `{ name: "HypermidInboundReceiver",
     * version: "1", chainId: <source chain> }`. Required — the backend rejects
     * unsigned registrations.
     */
    signature: string;
}
export interface InboundReceiverResponse {
    registered: boolean;
    recordId: string;
    usdcAmount: string;
    status: string;
}
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
//# sourceMappingURL=types.d.ts.map