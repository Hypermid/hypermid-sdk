/**
 * Execution lifecycle management — high-level helpers that manage the
 * full swap flow: quote → execute → poll status until completion.
 *
 * Similar to LI.FI SDK's execution tracking and Near Intents SDK's
 * status polling, but unified across both providers.
 */
import type { HyperMid } from "./client.js";
import type { ExecuteParams, ExecuteResponse, LiFiExecuteResponse, NIExecuteResponse, DepositStatusResponse, StatusResponse, QuoteResponse } from "./types.js";
export type ExecutionStatus = "QUOTE" | "EXECUTING" | "WAITING_DEPOSIT" | "DEPOSIT_SUBMITTED" | "PROCESSING" | "SUCCESS" | "FAILED" | "REFUNDED";
export interface ExecutionUpdate {
    /** Current execution status */
    status: ExecutionStatus;
    /** The provider handling this swap */
    provider: "lifi" | "near-intents" | "superswap";
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
export declare function waitForDepositCompletion(client: HyperMid, params: {
    depositAddress: string;
    depositMemo?: string;
}, options?: ExecutionConfig & {
    onPoll?: (status: DepositStatusResponse) => void;
}): Promise<DepositStatusResponse>;
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
export declare function waitForLiFiCompletion(client: HyperMid, params: {
    txHash: string;
    fromChain?: string | number;
    toChain?: string | number;
    bridge?: string;
}, options?: ExecutionConfig & {
    onPoll?: (status: StatusResponse) => void;
}): Promise<StatusResponse>;
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
export declare function executeSwap(client: HyperMid, params: ExecuteParams, hooks?: ExecutionHooks, config?: ExecutionConfig): Promise<ExecutionUpdate>;
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
export declare function quoteAndPrepare(client: HyperMid, params: ExecuteParams): Promise<{
    quote: QuoteResponse;
    execute: (hooks?: ExecutionHooks, config?: ExecutionConfig) => Promise<ExecutionUpdate>;
}>;
//# sourceMappingURL=execution.d.ts.map