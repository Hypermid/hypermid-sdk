/**
 * Execution lifecycle management — high-level helpers that manage the
 * full swap flow: quote → execute → poll status until completion.
 *
 * Similar to LI.FI SDK's execution tracking and Near Intents SDK's
 * status polling, but unified across both providers.
 */
import { isLiFiRoute, isNearIntentsRoute, isNIStatusTerminal, isLiFiStatusTerminal } from "./helpers.js";
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
export async function waitForDepositCompletion(client, params, options) {
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
export async function waitForLiFiCompletion(client, params, options) {
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
export async function executeSwap(client, params, hooks, config) {
    const emit = (update) => {
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
        const finalLiFiStatus = finalStatus.status === "DONE" ? "SUCCESS" : "FAILED";
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
        provider: executeResponse.provider,
        executeResponse: executeResponse,
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
export async function quoteAndPrepare(client, params) {
    const quoteParams = {
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
        execute: (hooks, config) => executeSwap(client, params, hooks, config),
    };
}
// ─── Internal helpers ────────────────────────────────────────────────────
function mapNIStatus(status) {
    switch (status) {
        case "SUCCESS": return "SUCCESS";
        case "REFUNDED": return "REFUNDED";
        case "FAILED": return "FAILED";
        default: return "PROCESSING";
    }
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=execution.js.map