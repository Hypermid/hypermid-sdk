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
/** keccak256("approve(address,uint256)")[:4]. */
const ERC20_APPROVE_SELECTOR = "0x095ea7b3";
function pad32(hexNo0x) {
    return hexNo0x.toLowerCase().padStart(64, "0");
}
function toHexChainId(chainId) {
    return "0x" + chainId.toString(16);
}
/** Normalise a tx value (decimal or 0x-hex string) to an EIP-5792 hex quantity. */
function toHexQuantity(v) {
    if (!v)
        return "0x0";
    if (v.startsWith("0x"))
        return v;
    try {
        return "0x" + BigInt(v).toString(16);
    }
    catch {
        return "0x0";
    }
}
/** Encode `approve(spender, amount)` calldata — no ABI library needed. */
export function encodeApprove(spender, amount) {
    return (ERC20_APPROVE_SELECTOR +
        pad32(spender.replace(/^0x/, "")) +
        pad32(amount.toString(16)));
}
/**
 * Best-effort: does this `(account, chain)` support EIP-5792 atomic batching
 * (executed via EIP-7702 for EOAs)? Never throws — returns `false` on any error
 * (older wallet / connector) so callers safely fall back to sequential txs.
 */
export async function supportsAtomicBatch(provider, account, chainId) {
    try {
        const hexId = toHexChainId(chainId);
        const caps = (await provider.request({
            method: "wallet_getCapabilities",
            params: [account, [hexId]],
        }));
        // Wallets key by hex chain id; some return the requested chain's caps directly.
        const chainCaps = caps?.[hexId] ?? caps?.[String(chainId)] ?? caps;
        const status = chainCaps?.atomic?.status;
        return status === "supported" || status === "ready";
    }
    catch {
        return false;
    }
}
/**
 * Send `approve(spender, amount)` + the swap as one atomic EIP-5792 batch via
 * `wallet_sendCalls`. Returns the batch **id** — poll it with
 * `wallet_getCallsStatus` to get the swap tx hash, then track via `getStatus`.
 *
 * Throws on unsupported wallets / explicit rejection so the caller can fall
 * back to the sequential approve-then-send path. Always gate this behind
 * {@link supportsAtomicBatch}.
 */
export async function sendAtomicApproveAndSwap(provider, p) {
    const calls = [
        { to: p.token, data: encodeApprove(p.spender, p.amount), value: "0x0" },
        { to: p.swap.to, data: p.swap.data, value: toHexQuantity(p.swap.value) },
    ];
    const res = (await provider.request({
        method: "wallet_sendCalls",
        params: [
            {
                version: "2.0.0",
                from: p.account,
                chainId: toHexChainId(p.chainId),
                atomicRequired: true,
                calls,
            },
        ],
    }));
    const id = typeof res === "string" ? res : res?.id;
    if (!id)
        throw new Error("wallet_sendCalls returned no batch id");
    return id;
}
//# sourceMappingURL=eip7702.js.map