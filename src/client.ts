import type {
  HyperMidConfig,
  ApiResponse,
  ChainsResponse,
  TokensParams,
  TokensResponse,
  ConnectionsParams,
  GasPricesParams,
  QuoteParams,
  QuoteResponse,
  RoutesParams,
  StatusParams,
  StatusResponse,
  ExecuteParams,
  ExecuteResponse,
  DepositSubmitParams,
  DepositSubmitResponse,
  DepositStatusParams,
  DepositStatusResponse,
  OnrampQuoteParams,
  OnrampCheckoutParams,
  OnrampCheckoutResponse,
  OnrampStatusResponse,
  OnrampConfigResponse,
  OnrampAssetsParams,
  SwapEventParams,
  SwapEventResponse,
  PartnerInfo,
  PartnerStats,
  PartnerStatsParams,
  Transaction,
  PaginatedResponse,
  PaginationParams,
  CreateWebhookParams,
  WebhookCreated,
  WebhooksListResponse,
  PingResponse,
} from "./types.js";
import {
  HyperMidError,
  HyperMidTimeoutError,
  HyperMidNetworkError,
} from "./errors.js";

const DEFAULT_BASE_URL = "https://api.hypermid.io";
const DEFAULT_TIMEOUT = 30_000;

export class HyperMid {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeout: number;
  private readonly _fetch: typeof globalThis.fetch;

  constructor(config: HyperMidConfig = {}) {
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this._fetch = config.fetch || globalThis.fetch;
  }

  // ─── Internal helpers ────────────────────────────────────────────────

  private async request<T>(
    method: "GET" | "POST" | "DELETE",
    path: string,
    options?: {
      params?: Record<string, string | number | undefined>;
      body?: Record<string, unknown>;
    },
  ): Promise<T> {
    let url = `${this.baseUrl}/v1${path}`;

    // Build query string
    if (options?.params) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(options.params)) {
        if (v !== undefined && v !== null && v !== "") {
          qs.set(k, String(v));
        }
      }
      const qsStr = qs.toString();
      if (qsStr) url += `?${qsStr}`;
    }

    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers["X-API-Key"] = this.apiKey;
    }
    if (method === "POST" || method === "DELETE") {
      headers["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    let res: Response;
    try {
      res = await this._fetch(url, {
        method,
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new HyperMidTimeoutError(this.timeout);
      }
      throw new HyperMidNetworkError(
        err instanceof Error ? err.message : "Network request failed",
        err instanceof Error ? err : undefined,
      );
    } finally {
      clearTimeout(timer);
    }

    let json: ApiResponse<T>;
    try {
      json = (await res.json()) as ApiResponse<T>;
    } catch {
      throw new HyperMidNetworkError(`Invalid JSON response (HTTP ${res.status})`);
    }

    if (json.error) {
      throw new HyperMidError(
        json.error.code,
        json.error.message,
        res.status,
        json.meta,
        json.error.details,
      );
    }

    return json.data as T;
  }

  private get<T>(
    path: string,
    params?: Record<string, string | number | undefined>,
  ): Promise<T> {
    return this.request<T>("GET", path, { params });
  }

  private post<T>(
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    return this.request<T>("POST", path, { body });
  }

  private delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  // ─── Core Swap Endpoints ─────────────────────────────────────────────

  /**
   * Get all supported chains (LI.FI + Near Intents).
   * Cached server-side for 1 hour.
   */
  async getChains(): Promise<ChainsResponse> {
    return this.get<ChainsResponse>("/chains");
  }

  /**
   * Get available tokens, optionally filtered by chains and keywords.
   * Cached server-side for 5 minutes.
   */
  async getTokens(params?: TokensParams): Promise<TokensResponse> {
    return this.get<TokensResponse>("/tokens", params as Record<string, string | number | undefined>);
  }

  /**
   * Get available connections (which token pairs can be swapped).
   */
  async getConnections(params: ConnectionsParams): Promise<unknown> {
    return this.get("/connections", {
      fromChain: String(params.fromChain),
      fromToken: params.fromToken,
      toChain: params.toChain ? String(params.toChain) : undefined,
    });
  }

  /**
   * Get available bridge/swap tools.
   * Cached server-side for 1 hour.
   */
  async getTools(): Promise<unknown> {
    return this.get("/tools");
  }

  /**
   * Get gas prices for specified chains.
   */
  async getGasPrices(params: GasPricesParams): Promise<unknown> {
    return this.get("/gas-prices", { chains: params.chains });
  }

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
  async getQuote(params: QuoteParams): Promise<QuoteResponse> {
    return this.get<QuoteResponse>("/quote", {
      fromChain: String(params.fromChain),
      fromToken: params.fromToken,
      fromAmount: params.fromAmount,
      toChain: String(params.toChain),
      toToken: params.toToken,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      slippage: params.slippage !== undefined ? String(params.slippage) : undefined,
      order: params.order,
    });
  }

  /**
   * Get available routes for a token pair (multi-route comparison).
   * Supports both GET and POST — SDK uses POST for flexibility.
   */
  async getRoutes(params: RoutesParams): Promise<unknown> {
    return this.post("/routes", {
      fromChain: String(params.fromChain),
      fromToken: params.fromToken,
      fromAmount: params.fromAmount,
      toChain: String(params.toChain),
      toToken: params.toToken,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      slippage: params.slippage,
      order: params.order,
    });
  }

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
  async getStatus(params: StatusParams): Promise<StatusResponse> {
    const queryParams: Record<string, string | number | undefined> = {};

    if ("provider" in params && params.provider === "near-intents") {
      queryParams.provider = "near-intents";
      queryParams.correlationId = params.correlationId;
    } else {
      const p = params as { txHash: string; bridge?: string; fromChain?: string | number; toChain?: string | number };
      queryParams.txHash = p.txHash;
      if (p.bridge) queryParams.bridge = p.bridge;
      if (p.fromChain) queryParams.fromChain = String(p.fromChain);
      if (p.toChain) queryParams.toChain = String(p.toChain);
    }

    return this.get<StatusResponse>("/status", queryParams);
  }

  // ─── Execute ─────────────────────────────────────────────────────────

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
  async execute(params: ExecuteParams): Promise<ExecuteResponse> {
    return this.post<ExecuteResponse>("/execute", {
      fromChain: String(params.fromChain),
      fromToken: params.fromToken,
      fromAmount: params.fromAmount,
      toChain: String(params.toChain),
      toToken: params.toToken,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      ...(params.depositMode ? { depositMode: params.depositMode } : {}),
      ...(params.slippage !== undefined ? { slippage: params.slippage } : {}),
      ...(params.order ? { order: params.order } : {}),
      ...(params.refundAddress ? { refundAddress: params.refundAddress } : {}),
    });
  }

  /**
   * Submit a deposit transaction hash after sending tokens to a Near Intents deposit address.
   * Only needed for `depositMode: "wallet"`. Manual deposits are auto-detected.
   */
  async submitDeposit(params: DepositSubmitParams): Promise<DepositSubmitResponse> {
    return this.post<DepositSubmitResponse>("/execute/deposit/submit", {
      txHash: params.txHash,
      depositAddress: params.depositAddress,
    });
  }

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
  async getDepositStatus(params: DepositStatusParams): Promise<DepositStatusResponse> {
    return this.get<DepositStatusResponse>("/execute/deposit/status", {
      depositAddress: params.depositAddress,
      depositMemo: params.depositMemo,
    });
  }

  // ─── On-Ramp ─────────────────────────────────────────────────────────

  /**
   * Get a fiat → crypto price quote.
   */
  async getOnrampQuote(params: OnrampQuoteParams): Promise<unknown> {
    return this.post("/onramp/quote", {
      fiatAmount: params.fiatAmount,
      fiatCurrency: params.fiatCurrency,
      cryptoToken: params.cryptoToken,
      cryptoChain: params.cryptoChain,
      ...(params.walletAddress ? { walletAddress: params.walletAddress } : {}),
      ...(params.paymentMode ? { paymentMode: params.paymentMode } : {}),
      ...(params.userCountry ? { userCountry: params.userCountry } : {}),
    });
  }

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
  async createOnrampCheckout(
    params: OnrampCheckoutParams,
  ): Promise<OnrampCheckoutResponse> {
    return this.post<OnrampCheckoutResponse>("/onramp/checkout", {
      walletAddress: params.walletAddress,
      cryptoToken: params.cryptoToken,
      cryptoChain: params.cryptoChain,
      fiatCurrency: params.fiatCurrency,
      fiatAmount: params.fiatAmount,
      ...(params.email ? { email: params.email } : {}),
      ...(params.returnUrl ? { returnUrl: params.returnUrl } : {}),
      ...(params.paymentMode ? { paymentMode: params.paymentMode } : {}),
    });
  }

  /**
   * Check on-ramp order status.
   */
  async getOnrampStatus(orderUid: string): Promise<OnrampStatusResponse> {
    return this.get<OnrampStatusResponse>("/onramp/status", { orderUid });
  }

  /**
   * Get supported chains and tokens for on-ramp.
   * Cached server-side for 5 minutes.
   */
  async getOnrampConfig(): Promise<OnrampConfigResponse> {
    return this.get<OnrampConfigResponse>("/onramp/config");
  }

  /**
   * Get asset config (min/max amounts, precision, payment methods).
   */
  async getOnrampAssets(params: OnrampAssetsParams): Promise<unknown> {
    return this.get("/onramp/assets", {
      currency: params.currency,
      chain: params.chain,
      orderCurrency: params.orderCurrency,
    });
  }

  // ─── Swap Event ──────────────────────────────────────────────────────

  /**
   * Record a swap event for analytics. partner_id is automatically
   * attributed from your API key.
   */
  async recordSwapEvent(params: SwapEventParams): Promise<SwapEventResponse> {
    return this.post<SwapEventResponse>("/swap-event", params as unknown as Record<string, unknown>);
  }

  // ─── Partner (requires API key) ──────────────────────────────────────

  /**
   * Get your partner info (requires API key).
   */
  async getPartnerInfo(): Promise<PartnerInfo> {
    return this.get<PartnerInfo>("/partner/me");
  }

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
  async getPartnerStats(params?: PartnerStatsParams): Promise<PartnerStats> {
    return this.get<PartnerStats>("/partner/stats", params as Record<string, string | number | undefined>);
  }

  /**
   * Get paginated transaction history (requires API key).
   */
  async getPartnerTransactions(
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Transaction>> {
    return this.get<PaginatedResponse<Transaction>>("/partner/transactions", {
      page: params?.page,
      limit: params?.limit,
    });
  }

  // ─── Webhooks (requires API key) ─────────────────────────────────────

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
  async createWebhook(params: CreateWebhookParams): Promise<WebhookCreated> {
    return this.post<WebhookCreated>("/partner/webhooks", {
      url: params.url,
      events: params.events,
    });
  }

  /**
   * List all registered webhooks (requires API key).
   * Note: webhook secrets are never returned in list responses.
   */
  async listWebhooks(): Promise<WebhooksListResponse> {
    return this.get<WebhooksListResponse>("/partner/webhooks");
  }

  /**
   * Delete a webhook by ID (requires API key).
   */
  async deleteWebhook(webhookId: string): Promise<{ deleted: boolean; id: string }> {
    return this.delete<{ deleted: boolean; id: string }>(`/partner/webhooks/${webhookId}`);
  }

  // ─── Health Check ────────────────────────────────────────────────────

  /**
   * Simple health check. Returns API status, version, uptime, and provider statuses.
   */
  async ping(): Promise<PingResponse> {
    return this.get<PingResponse>("/ping");
  }
}
