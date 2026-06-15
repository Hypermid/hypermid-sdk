/**
 * eip7702.ts — framework-agnostic EIP-7702 / EIP-5792 atomic batch helpers.
 *
 * Collapse the classic two-step "approve, then swap" into ONE wallet
 * interaction via `wallet_sendCalls` (EIP-5792) — executed under the hood as an
 * EIP-7702 delegation for EOAs. Fewer clicks, no stuck-approval state, and the
 * approval can't be left dangling or front-run.
 *
 * These helpers take any EIP-1193 provider (`window.ethereum`, a wagmi
 * connector's provider, viem's `transport`, etc.) — no wallet library
 * dependency, no ABI encoder. Detection is best-effort per (account, chain);
 * callers MUST fall back to a sequential approve+send when it returns false.
 *
 * @example
 * ```ts
 * const res = await hm.getQuote(params);
 * const q = res.quote as SuperSwapV2Quote;          // provider === "superswap"
 * const eth = window.ethereum as Eip1193Provider;
 *
 * if (await supportsAtomicBatch(eth, account, q.fromChainId)) {
 *   const id = await sendAtomicApproveAndSwap(eth, {
 *     account, chainId: q.fromChainId,
 *     token: q.fromToken.address, spender: q.approvalAddress,
 *     amount: BigInt(q.fromAmount),
 *     swap: q.transactionRequest,
 *   });
 *   // poll wallet_getCallsStatus(id), then hm.getStatus(...)
 * } else {
 *   // fallback: send approve, wait, then send q.transactionRequest
 * }
 * ```
 */
/** Minimal EIP-1193 provider surface (just `request`). */
export interface Eip1193Provider {
    request(args: {
        method: string;
        params?: unknown[] | object;
    }): Promise<unknown>;
}
/** Encode `approve(spender, amount)` calldata — no ABI library needed. */
export declare function encodeApprove(spender: string, amount: bigint): string;
export interface AtomicSwapParams {
    /** The account sending the batch. */
    account: string;
    /** Source chain id. */
    chainId: number;
    /** ERC20 being spent. */
    token: string;
    /** Contract authorised to pull `amount` — the quote's `approvalAddress`. */
    spender: string;
    /** Exact amount to approve, in token smallest units. */
    amount: bigint;
    /** The swap/bridge transaction to broadcast after the approval. */
    swap: {
        to: string;
        data: string;
        value?: string;
    };
}
/**
 * Best-effort: does this `(account, chain)` support EIP-5792 atomic batching
 * (executed via EIP-7702 for EOAs)? Never throws — returns `false` on any error
 * (older wallet / connector) so callers safely fall back to sequential txs.
 */
export declare function supportsAtomicBatch(provider: Eip1193Provider, account: string, chainId: number): Promise<boolean>;
/**
 * Send `approve(spender, amount)` + the swap as one atomic EIP-5792 batch via
 * `wallet_sendCalls`. Returns the batch **id** — poll it with
 * `wallet_getCallsStatus` to get the swap tx hash, then track via `getStatus`.
 *
 * Throws on unsupported wallets / explicit rejection so the caller can fall
 * back to the sequential approve-then-send path. Always gate this behind
 * {@link supportsAtomicBatch}.
 */
export declare function sendAtomicApproveAndSwap(provider: Eip1193Provider, p: AtomicSwapParams): Promise<string>;
//# sourceMappingURL=eip7702.d.ts.map