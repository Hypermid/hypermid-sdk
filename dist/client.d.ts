import type { HyperMidConfig, ChainsResponse, TokensParams, TokensResponse, ConnectionsParams, GasPricesParams, QuoteParams, QuoteResponse, RoutesParams, StatusParams, StatusResponse, ExecuteParams, ExecuteResponse, DepositSubmitParams, DepositSubmitResponse, DepositStatusParams, DepositStatusResponse, OnrampQuoteParams, OnrampCheckoutParams, OnrampCheckoutResponse, OnrampStatusResponse, OnrampConfigResponse, OnrampAssetsParams, SwapEventParams, SwapEventResponse, PartnerInfo, PartnerStats, PartnerStatsParams, Transaction, PaginatedResponse, PaginationParams, CreateWebhookParams, WebhookCreated, WebhooksListResponse, PingResponse, BalancesParams, BalancesResponse, InboundReceiverParams, InboundReceiverResponse } from "./types.js";
export declare class HyperMid {
    private readonly baseUrl;
    private readonly apiKey?;
    private readonly timeout;
    private readonly _fetch;
    constructor(config?: HyperMidConfig);
    private request;
    private get;
    private post;
    private delete;
    /**
     * Get all supported chains (LI.FI + Near Intents).
     * Cached server-side for 1 hour.
     */
    getChains(): Promise<ChainsResponse>;
    /**
     * Get available tokens, optionally filtered by chains and keywords.
     * Cached server-side for 5 minutes.
     */
    getTokens(params?: TokensParams): Promise<TokensResponse>;
    /**
     * Get available connections (which token pairs can be swapped).
     */
    getConnections(params: ConnectionsParams): Promise<unknown>;
    /**
     * Get available bridge/swap tools.
     * Cached server-side for 1 hour.
     */
    getTools(): Promise<unknown>;
    /**
     * Get gas prices for specified chains.
     */
    getGasPrices(params: GasPricesParams): Promise<unknown>;
    /**
     * Get the best swap quote for a token pair.
     *
     * @example
     * ```ts
     * const quote = await hm.getQuote({
     *   fromChain: 1,
     *   fromToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
     *   fromAmount: "100000000",  // 100 USDC
     *   toChain: 42161,
     *   toToken: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
     *   fromAddress: "0x...",
     * });
     * ```
     */
    getQuote(params: QuoteParams): Promise<QuoteResponse>;
    /**
     * Get available routes for a token pair (multi-route comparison).
     * Supports both GET and POST — SDK uses POST for flexibility.
     */
    getRoutes(params: RoutesParams): Promise<unknown>;
    /**
     * Check the status of a cross-chain swap.
     *
     * @example LI.FI status
     * ```ts
     * const status = await hm.getStatus({
     *   txHash: "0x...",
     *   fromChain: 1,
     *   toChain: 42161,
     * });
     * ```
     *
     * @example Near Intents status
     * ```ts
     * const status = await hm.getStatus({
     *   provider: "near-intents",
     *   correlationId: "abc-123",
     * });
     * ```
     */
    getStatus(params: StatusParams): Promise<StatusResponse>;
    /**
     * Get full transaction data for execution.
     *
     * **LI.FI routes**: Returns `transactionRequest` — sign and broadcast with your wallet.
     *
     * **Near Intents routes**: Returns `depositAddress` — send tokens there.
     * Use `depositMode` to control wallet vs. manual flow.
     *
     * @example LI.FI swap
     * ```ts
     * const result = await hm.execute({
     *   fromChain: 1,
     *   fromToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
     *   fromAmount: "100000000",
     *   toChain: 42161,
     *   toToken: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
     *   fromAddress: "0x...",
     *   toAddress: "0x...",
     * });
     * if (result.provider === "lifi") {
     *   // Sign result.transactionRequest with your wallet
     * }
     * ```
     *
     * @example Near Intents manual deposit (user hasn't connected wallet)
     * ```ts
     * const result = await hm.execute({
     *   fromChain: 900000003,  // Tron
     *   fromToken: "...",
     *   fromAmount: "10000000",
     *   toChain: 900000002,  // TON
     *   toToken: "...",
     *   fromAddress: "T...",
     *   toAddress: "EQ...",
     *   depositMode: "manual",  // Force manual mode
     * });
     * // Show result.depositAddress to user with QR code
     * ```
     */
    execute(params: ExecuteParams): Promise<ExecuteResponse>;
    /**
     * Submit a deposit transaction hash after sending tokens to a Near Intents deposit address.
     * Only needed for `depositMode: "wallet"`. Manual deposits are auto-detected.
     */
    submitDeposit(params: DepositSubmitParams): Promise<DepositSubmitResponse>;
    /**
     * Check the status of a Near Intents deposit/swap.
     *
     * @example
     * ```ts
     * const status = await hm.getDepositStatus({
     *   depositAddress: "0x...",
     * });
     * if (status.status === "SUCCESS") {
     *   console.log("Swap complete!", status.swapDetails);
     * }
     * ```
     */
    getDepositStatus(params: DepositStatusParams): Promise<DepositStatusResponse>;
    /**
     * Get a fiat → crypto price quote.
     */
    getOnrampQuote(params: OnrampQuoteParams): Promise<unknown>;
    /**
     * Create a fiat → crypto purchase session. Returns a redirect URL
     * to the payment page.
     *
     * @example
     * ```ts
     * const { redirectUrl, orderUid } = await hm.createOnrampCheckout({
     *   walletAddress: "0x...",
     *   cryptoToken: "ETH",
     *   cryptoChain: "ethereum",
     *   fiatCurrency: "USD",
     *   fiatAmount: 100,
     * });
     * // Redirect user to redirectUrl
     * ```
     */
    createOnrampCheckout(params: OnrampCheckoutParams): Promise<OnrampCheckoutResponse>;
    /**
     * Check on-ramp order status.
     */
    getOnrampStatus(orderUid: string): Promise<OnrampStatusResponse>;
    /**
     * Get supported chains and tokens for on-ramp.
     * Cached server-side for 5 minutes.
     */
    getOnrampConfig(): Promise<OnrampConfigResponse>;
    /**
     * Get asset config (min/max amounts, precision, payment methods).
     */
    getOnrampAssets(params: OnrampAssetsParams): Promise<unknown>;
    /**
     * Record a swap event for analytics. partner_id is automatically
     * attributed from your API key.
     */
    recordSwapEvent(params: SwapEventParams): Promise<SwapEventResponse>;
    /**
     * Get your partner info (requires API key).
     */
    getPartnerInfo(): Promise<PartnerInfo>;
    /**
     * Get volume, fee, and performance stats (requires API key).
     *
     * @example
     * ```ts
     * const stats = await hm.getPartnerStats({
     *   from: "2025-01-01",
     *   to: "2025-03-31",
     * });
     * console.log(`Volume: $${stats.volume_usd}`);
     * ```
     */
    getPartnerStats(params?: PartnerStatsParams): Promise<PartnerStats>;
    /**
     * Get paginated transaction history (requires API key).
     */
    getPartnerTransactions(params?: PaginationParams): Promise<PaginatedResponse<Transaction>>;
    /**
     * Register a webhook endpoint. Returns the signing secret — store it securely!
     * The secret is only shown once, on creation.
     *
     * @example
     * ```ts
     * const webhook = await hm.createWebhook({
     *   url: "https://myapp.com/webhooks/hypermid",
     *   events: ["swap.completed", "onramp.completed"],
     * });
     * // Store webhook.secret securely!
     * ```
     */
    createWebhook(params: CreateWebhookParams): Promise<WebhookCreated>;
    /**
     * List all registered webhooks (requires API key).
     * Note: webhook secrets are never returned in list responses.
     */
    listWebhooks(): Promise<WebhooksListResponse>;
    /**
     * Delete a webhook by ID (requires API key).
     */
    deleteWebhook(webhookId: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    /**
     * Get token balances for a wallet address across chains.
     * Uses Alchemy Portfolio API + PulseChain RPC + Blockstream (BTC) on the backend.
     *
     * @example
     * ```ts
     * const balances = await hm.getBalances({
     *   address: "0x1234...",
     *   chainIds: [1, 42161, 8453, 369],
     * });
     * console.log(balances.totalBalanceUSD);
     * ```
     */
    getBalances(params: BalancesParams): Promise<BalancesResponse>;
    /**
     * Register a USDC deposit at the InboundReceiver contract for SuperSwap.
     * Call this AFTER the user's bridge transaction confirms on-chain.
     *
     * @example
     * ```ts
     * const result = await hm.registerInboundReceiver({
     *   txHash: "0xabc...",
     *   fromChain: 8453,
     *   toChain: 369,
     *   receiverAddress: "0xuser...",
     *   outputToken: "0x0000...0000", // PLS
     * });
     * ```
     */
    registerInboundReceiver(params: InboundReceiverParams): Promise<InboundReceiverResponse>;
    /**
     * Simple health check. Returns API status, version, uptime, and provider statuses.
     */
    ping(): Promise<PingResponse>;
}
//# sourceMappingURL=client.d.ts.map