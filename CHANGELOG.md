# Changelog

## 2.1.0

### Added

- **SuperSwap V2 types**: `SuperSwapV2Quote` (the `quote` shape when
  `provider === "superswap"` — `source`, `approvalAddress`, `estimatedOutput`,
  `minOutput`, `expiresAt`, `transactionRequest`) and `SuperSwapV2Status` /
  `SuperSwapV2StatusLeg` (status vocabulary `PENDING | DONE | FAILED |
  NOT_FOUND | INVALID`, `hyperlaneMessageId`, `sending`/`receiving` legs).
- **EIP-7702 / EIP-5792 atomic batch helpers** (framework-agnostic, any
  EIP-1193 provider — no wallet library dependency):
  - `supportsAtomicBatch(provider, account, chainId)` — best-effort capability
    probe via `wallet_getCapabilities` (never throws).
  - `sendAtomicApproveAndSwap(provider, params)` — collapses `approve` + the
    swap into one `wallet_sendCalls` interaction; returns the batch id.
  - `encodeApprove(spender, amount)` — ABI-encode `approve` without a library.
  - Types `Eip1193Provider`, `AtomicSwapParams`.
- `isSuperSwapStatusTerminal(status)` helper.

### Changed (non-breaking)

- `QuoteResponse.provider` and `StatusResponse.provider` unions now include
  `"superswap"`.
