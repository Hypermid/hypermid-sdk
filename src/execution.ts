/**
 * Execution lifecycle management — high-level helpers that manage the
 * full swap flow: quote → execute → poll status until completion.
 *
 * Similar to LI.FI SDK's execution tracking and Near Intents SDK's
 * status polling, but unified across both providers.
 */

import type { HyperMid } from "./client.js";
import type {
  ExecuteParams,
  ExecuteResponse,
  LiFiExecuteResponse,
  NIExecuteResponse,
  DepositStatusResponse,
  StatusResponse,
  QuoteParams,
  QuoteResponse,
} from "./types.js";
import { isLiFiRoute, isNearIntentsRoute, isNIStatusTerminal, isLiFiStatusTerminal } from "./helpers.js";

// ─── Event types ─────────────────────────────────────────────────────────

export type ExecutionStatus =
  | "QUOTE"
  | "EXECUTING"
  | "WAITING_DEPOSIT"
  | "DEPOSIT_SUBMITTED"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export interface ExecutionUpdate {
  /** Current execution status */
  status: ExecutionStatus;
  /** The provider handling this swap */
  provider: "lifi" | "near-intents";
  /** The execute response (available after EXECUTING) */
  executeResponse?: ExecuteResponse;
  /** The deposit status (Near Intents only, available during polling) */
  depositStatus?: DepositStatusResponse;
  /** LI.FI status response (available during polling) */
  lifiStatus?: StatusResponse;
  /** Error message if FAILED */
  error?: string;
}

export interface ExecutionHooks {
  /** Called on every status change */
  onStatusChange?: (update: ExecutionUpdate) => void;
  /** Called when execute response is received (provider-specific) */
  onExecute?: (response: ExecuteResponse) => void;
  /**
   * Called when LI.FI transactionRequest is ready — you MUST sign and broadcast it.
   * Return the transaction hash after broadcasting.
   *
   * If not provided, the execution will stop after returning the transactionRequest
   * and you'll need to handle signing yourself.
   */
  onTransactionRequest?: (response: LiFiExecuteResponse) => Promise<string>;
  /**
   * Called when Near Intents deposit address is ready and depositMode is "wallet".
   * You MUST send tokens to the deposit address and return the tx hash.
   *
   * If not provided for wallet-mode deposits, the execution will stop after
   * returning the deposit address.
   */
  onDepositRequired?: (response: NIExecuteResponse) => Promise<string>;
  /** Called on each poll iteration with the latest status */
  onPoll?: (status: DepositStatusResponse | StatusResponse) => void;
}

export interface ExecutionConfig {
  /** Polling interval in ms (default: 5000) */
  pollIntervalMs?: number;
  /** Maximum time to wait for completion in ms (default: 600000 = 10 min) */
  maxWaitMs?: number;
  /** Maximum number of poll attempts (default: unlimited) */
  maxPolls?: number;
}

// ─── Polling helpers ─────────────────────────────────────────────────────

/**
 * Poll Near Intents deposit/swap status until a terminal state is reached.
 *
 * @example
 * ```ts
 * const finalStatus = await waitForDepositCompletion(hm, {
 *   depositAddress: "0x...",
 * }, {
 *   onPoll: (status) => console.log("Status:", status.status),
 * });
 * ```
 */
export async function waitForDepositCompletion(
  client: HyperMid,
  params: { depositAddress: string; depositMemo?: string },
  options?: ExecutionConfig & { onPoll?: (status: DepositStatusResponse) => void },
): Promise<DepositStatusResponse> {
  const interval = options?.pollIntervalMs ?? 5_000;
  const maxWait = options?.maxWaitMs ?? 600_000;
  const maxPolls = options?.maxPolls ?? Infinity;
  const startTime = Date.now();
  let polls = 0;

  while (true) {
    const status = await client.getDepositStatus(params);
    polls++;

    options?.onPoll?.(status);

    if (isNIStatusTerminal(status.status)) {
      return status;
    }

    if (Date.now() - startTime >= maxWait) {
      throw new Error(`Deposit status polling timed out after ${maxWait}ms (last status: ${status.status})`);
    }
    if (polls >= maxPolls) {
      throw new Error(`Deposit status polling exceeded ${maxPolls} attempts (last status: ${status.status})`);
    }

    await sleep(interval);
  }
}

/**
 * Poll LI.FI swap status until a terminal state is reached.
 *
 * @example
 * ```ts
 * const finalStatus = await waitForLiFiCompletion(hm, {
 *   txHash: "0x...",
 *   fromChain: 1,
 *   toChain: 42161,
 * });
 * ```
 */
export async function waitForLiFiCompletion(
  client: HyperMid,
  params: { txHash: string; fromChain?: string | number; toChain?: string | number; bridge?: string },
  options?: ExecutionConfig & { onPoll?: (status: StatusResponse) => void },
): Promise<StatusResponse> {
  const interval = options?.pollIntervalMs ?? 5_000;
  const maxWait = options?.maxWaitMs ?? 600_000;
  const maxPolls = options?.maxPolls ?? Infinity;
  const startTime = Date.now();
  let polls = 0;

  while (true) {
    const status = await client.getStatus({
      txHash: params.txHash,
      fromChain: params.fromChain,
      toChain: params.toChain,
      bridge: params.bridge,
    });
    polls++;

    options?.onPoll?.(status);

    if (status.status && isLiFiStatusTerminal(status.status)) {
      return status;
    }

    if (Date.now() - startTime >= maxWait) {
      throw new Error(`LI.FI status polling timed out after ${maxWait}ms (last status: ${status.status})`);
    }
    if (polls >= maxPolls) {
      throw new Error(`LI.FI status polling exceeded ${maxPolls} attempts (last status: ${status.status})`);
    }

    await sleep(interval);
  }
}

// ─── Full execution lifecycle ────────────────────────────────────────────

/**
 * Execute a full swap lifecycle: quote → execute → sign → poll → complete.
 *
 * This is the highest-level SDK method, managing the entire flow. You provide
 * hooks for wallet signing (LI.FI) or token transfer (Near Intents), and the
 * SDK handles everything else.
 *
 * @example Full automated LI.FI swap
 * ```ts
 * import { HyperMid, executeSwap } from "@hypermid/sdk";
 * import { sendTransaction } from "your-wallet-lib";
 *
 * const hm = new HyperMid({ apiKey: "..." });
 *
 * const result = await executeSwap(hm, {
 *   fromChain: 1,
 *   fromToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
 *   fromAmount: "100000000",
 *   toChain: 42161,
 *   toToken: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
 *   fromAddress: "0x...",
 *   toAddress: "0x...",
 * }, {
 *   onTransactionRequest: async (response) => {
 *     const txHash = await sendTransaction(response.transactionRequest);
 *     return txHash;
 *   },
 *   onStatusChange: (update) => {
 *     console.log(`Status: ${update.status}`);
 *   },
 * });
 * ```
 *
 * @example Full automated Near Intents swap (wallet connected)
 * ```ts
 * const result = await executeSwap(hm, {
 *   fromChain: ChainId.TRON,
 *   fromToken: "...",
 *   fromAmount: "10000000",
 *   toChain: ChainId.TON,
 *   toToken: "...",
 *   fromAddress: "T...",
 *   toAddress: "EQ...",
 * }, {
 *   onDepositRequired: async (response) => {
 *     const txHash = await tronWeb.transfer(response.depositAddress, amount);
 *     return txHash;
 *   },
 *   onStatusChange: (update) => {
 *     console.log(`Status: ${update.status}`);
 *   },
 * });
 * ```
 *
 * @example Manual deposit flow (no wallet signing — just poll)
 * ```ts
 * const result = await executeSwap(hm, {
 *   fromChain: ChainId.NEAR,
 *   ...params,
 *   depositMode: "manual",
 * }, {
 *   onStatusChange: (update) => {
 *     if (update.status === "WAITING_DEPOSIT" && update.executeResponse) {
 *       // Show QR code with depositAddress to user
 *       showQRCode(update.executeResponse.depositAddress);
 *     }
 *   },
 * });
 * // Polling runs until terminal status
 * ```
 */
export async function executeSwap(
  client: HyperMid,
  params: ExecuteParams,
  hooks?: ExecutionHooks,
  config?: ExecutionConfig,
): Promise<ExecutionUpdate> {
  const emit = (update: ExecutionUpdate) => {
    hooks?.onStatusChange?.(update);
    return update;
  };

  // Step 1: Execute
  emit({ status: "EXECUTING", provider: "lifi" }); // provider TBD until response

  const executeResponse = await client.execute(params);
  const provider = executeResponse.provider;

  hooks?.onExecute?.(executeResponse);

  // Step 2: Provider-specific handling
  if (isLiFiRoute(executeResponse)) {
    // LI.FI: need wallet to sign transactionRequest
    if (!hooks?.onTransactionRequest) {
      // No signing hook — return the transactionRequest for manual handling
      return emit({
        status: "EXECUTING",
        provider: "lifi",
        executeResponse,
      });
    }

    const txHash = await hooks.onTransactionRequest(executeResponse);

    emit({
      status: "PROCESSING",
      provider: "lifi",
      executeResponse,
    });

    // Poll LI.FI status
    const finalStatus = await waitForLiFiCompletion(client, {
      txHash,
      fromChain: params.fromChain,
      toChain: params.toChain,
    }, {
      ...config,
      onPoll: (status) => {
        hooks?.onPoll?.(status);
        emit({
          status: "PROCESSING",
          provider: "lifi",
          executeResponse,
          lifiStatus: status,
        });
      },
    });

    const finalLiFiStatus: ExecutionStatus =
      finalStatus.status === "DONE" ? "SUCCESS" : "FAILED";

    return emit({
      status: finalLiFiStatus,
      provider: "lifi",
      executeResponse,
      lifiStatus: finalStatus,
    });
  }

  // Near Intents route
  if (isNearIntentsRoute(executeResponse)) {
    const isManual = executeResponse.depositMode === "manual";

    if (isManual) {
      // Manual deposit: show address to user, then poll
      emit({
        status: "WAITING_DEPOSIT",
        provider: "near-intents",
        executeResponse,
      });

      // Poll — 1Click auto-detects manual deposits
      const finalStatus = await waitForDepositCompletion(client, {
        depositAddress: executeResponse.depositAddress,
        depositMemo: executeResponse.depositMemo,
      }, {
        ...config,
        onPoll: (status) => {
          hooks?.onPoll?.(status);
          emit({
            status: isNIStatusTerminal(status.status)
              ? mapNIStatus(status.status)
              : "PROCESSING",
            provider: "near-intents",
            executeResponse,
            depositStatus: status,
          });
        },
      });

      return emit({
        status: mapNIStatus(finalStatus.status),
        provider: "near-intents",
        executeResponse,
        depositStatus: finalStatus,
      });
    }

    // Wallet deposit
    if (!hooks?.onDepositRequired) {
      // No deposit hook — return deposit address for manual handling
      return emit({
        status: "WAITING_DEPOSIT",
        provider: "near-intents",
        executeResponse,
      });
    }

    const txHash = await hooks.onDepositRequired(executeResponse);

    emit({
      status: "DEPOSIT_SUBMITTED",
      provider: "near-intents",
      executeResponse,
    });

    // Submit deposit tx hash for faster detection
    await client.submitDeposit({
      txHash,
      depositAddress: executeResponse.depositAddress,
    });

    // Poll deposit status
    const finalStatus = await waitForDepositCompletion(client, {
      depositAddress: executeResponse.depositAddress,
      depositMemo: executeResponse.depositMemo,
    }, {
      ...config,
      onPoll: (status) => {
        hooks?.onPoll?.(status);
        emit({
          status: isNIStatusTerminal(status.status)
            ? mapNIStatus(status.status)
            : "PROCESSING",
          provider: "near-intents",
          executeResponse,
          depositStatus: status,
        });
      },
    });

    return emit({
      status: mapNIStatus(finalStatus.status),
      provider: "near-intents",
      executeResponse,
      depositStatus: finalStatus,
    });
  }

  // Should never reach here
  return emit({
    status: "FAILED",
    provider: (executeResponse as ExecuteResponse).provider,
    executeResponse: executeResponse as ExecuteResponse,
    error: "Unknown provider in execute response",
  });
}

// ─── Convenience: Quote + Execute in one call ────────────────────────────

/**
 * Get a quote and display it before executing. Returns quote data so the
 * partner can show pricing to the user before proceeding.
 *
 * @example
 * ```ts
 * const { quote, execute } = await quoteAndPrepare(hm, {
 *   fromChain: 1, fromToken: "0x...", fromAmount: "100000000",
 *   toChain: 42161, toToken: "0x...", fromAddress: "0x...", toAddress: "0x...",
 * });
 *
 * // Show quote to user
 * console.log("You'll receive:", quote.quote.estimate?.toAmount);
 *
 * // User confirms → execute
 * const result = await execute({
 *   onTransactionRequest: async (resp) => {
 *     return await wallet.sendTransaction(resp.transactionRequest);
 *   },
 * });
 * ```
 */
export async function quoteAndPrepare(
  client: HyperMid,
  params: ExecuteParams,
): Promise<{
  quote: QuoteResponse;
  execute: (hooks?: ExecutionHooks, config?: ExecutionConfig) => Promise<ExecutionUpdate>;
}> {
  const quoteParams: QuoteParams = {
    fromChain: params.fromChain,
    fromToken: params.fromToken,
    fromAmount: params.fromAmount,
    toChain: params.toChain,
    toToken: params.toToken,
    fromAddress: params.fromAddress,
    toAddress: params.toAddress,
    slippage: params.slippage,
    order: params.order,
  };

  const quote = await client.getQuote(quoteParams);

  return {
    quote,
    execute: (hooks?: ExecutionHooks, config?: ExecutionConfig) =>
      executeSwap(client, params, hooks, config),
  };
}

// ─── Internal helpers ────────────────────────────────────────────────────

function mapNIStatus(status: string): ExecutionStatus {
  switch (status) {
    case "SUCCESS": return "SUCCESS";
    case "REFUNDED": return "REFUNDED";
    case "FAILED": return "FAILED";
    default: return "PROCESSING";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
