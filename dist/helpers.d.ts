/**
 * Type guards and utility helpers for working with HyperMid API responses.
 */
import type { ExecuteResponse, LiFiExecuteResponse, NIExecuteResponse, SuperSwapExecuteResponse, DepositStatusResponse } from "./types.js";
/**
 * Check if an execute response is a LI.FI route (has transactionRequest).
 *
 * @example
 * ```ts
 * const result = await hm.execute(params);
 * if (isLiFiRoute(result)) {
 *   const tx = result.transactionRequest;
 *   // Sign and send with your wallet provider
 * }
 * ```
 */
export declare function isLiFiRoute(response: ExecuteResponse): response is LiFiExecuteResponse;
/**
 * Check if an execute response is a SuperSwap route (PulseChain via Hyperlane).
 *
 * @example
 * ```ts
 * const result = await hm.execute(params);
 * if (isSuperSwapRoute(result)) {
 *   const tx = result.transactionRequest;
 *   // Sign and send, then call registerInboundReceiver()
 * }
 * ```
 */
export declare function isSuperSwapRoute(response: ExecuteResponse): response is SuperSwapExecuteResponse;
/**
 * Check if an execute response is a Near Intents route (has depositAddress).
 *
 * @example
 * ```ts
 * const result = await hm.execute(params);
 * if (isNearIntentsRoute(result)) {
 *   console.log("Send tokens to:", result.depositAddress);
 * }
 * ```
 */
export declare function isNearIntentsRoute(response: ExecuteResponse): response is NIExecuteResponse;
/**
 * Check if a Near Intents deposit requires manual user action (QR code / copy address).
 */
export declare function isManualDeposit(response: ExecuteResponse): boolean;
/**
 * Check if a Near Intents deposit can be done programmatically via wallet.
 */
export declare function isWalletDeposit(response: ExecuteResponse): boolean;
/**
 * Check if a Near Intents deposit status is terminal (no more polling needed).
 */
export declare function isNIStatusTerminal(status: string): boolean;
/**
 * Check if a LI.FI status is terminal.
 */
export declare function isLiFiStatusTerminal(status: string): boolean;
/**
 * Check if a Near Intents swap completed successfully.
 */
export declare function isDepositSuccess(response: DepositStatusResponse): boolean;
/**
 * Check if a Near Intents swap was refunded.
 */
export declare function isDepositRefunded(response: DepositStatusResponse): boolean;
/**
 * Check if a Near Intents swap failed.
 */
export declare function isDepositFailed(response: DepositStatusResponse): boolean;
//# sourceMappingURL=helpers.d.ts.map