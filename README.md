# @hypermid/sdk

[![npm version](https://img.shields.io/npm/v/@hypermid/sdk.svg?color=00C2A8)](https://www.npmjs.com/package/@hypermid/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@hypermid/sdk.svg?color=00C2A8)](https://www.npmjs.com/package/@hypermid/sdk)
[![types](https://img.shields.io/npm/types/@hypermid/sdk.svg)](https://www.npmjs.com/package/@hypermid/sdk)
[![license](https://img.shields.io/npm/l/@hypermid/sdk.svg)](./LICENSE)
[![bundle](https://img.shields.io/bundlephobia/minzip/@hypermid/sdk?label=bundle)](https://bundlephobia.com/package/@hypermid/sdk)

> **Cross-chain swap, bridge & fiat on-ramp in one SDK.** 90+ chains
> across EVM, Solana, Bitcoin, NEAR, Sui, Tron, TON, XRP and Doge.
> Multi-ecosystem wallet balances. Anonymous tier — no API key
> required to start.

```bash
npm install @hypermid/sdk
```

```ts
import { Hypermid } from "@hypermid/sdk";
const hm = new Hypermid();              // no key, no signup
const { chains } = await hm.getChains(); // → 90+ chains
```

## Why Hypermid

- **One SDK, every ecosystem** — EVM + Solana + Bitcoin + NEAR + Sui +
  Tron + TON + XRP + Doge through a single client. No per-chain
  branching in your code.
- **Zero-setup integration** — anonymous tier works out of the box.
  Sign up only when you need partner fee splits or higher rate limits.
- **Routed across the best providers** — LI.FI, NEAR Intents and
  Hypermid SuperSwap (PulseChain native) routed automatically per
  pair, with USDC bridge fallback.
- **Built-in fiat on-ramp** — RampNow integration, same SDK.
- **Multi-chain balances** — `getBalances(address)` returns priced
  holdings + dust classification across every ecosystem the address
  touches.
- **Dual ESM + CJS** — works in modern Node (import), AWS Lambda
  (require), Bun, Deno, Vite, Next.js, Webpack — anywhere.

## Quick start

No API key required. The SDK works anonymously out of the box at the
default fee tier — pass an API key only if you're a partner with
custom fee terms.

```ts
import { Hypermid } from "@hypermid/sdk";

// Anonymous — works immediately, no signup
const hm = new Hypermid();

// Partner with custom fees / discounts
const hm = new Hypermid({ apiKey: process.env.HYPERMID_API_KEY });

// 1. Quote
const quote = await hm.getQuote({
  fromChain: 1,
  toChain: 8453,
  fromToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum
  toToken:   "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
  fromAmount: "1000000",                                   // 1 USDC (6 decimals)
  fromAddress: "0xYourWallet",
  toAddress:   "0xYourWallet",
});

// 2. Execute (returns the on-chain tx to sign + submit)
const exec = await hm.execute({ quoteId: quote.id });

// 3. Status
const status = await hm.getStatus({ txHash: "0x...", chainId: 1 });
```

## Features

- `getQuote` / `execute` / `getStatus` — the swap pipeline
- `getChains` / `getTokens` — supported chains and tokens
- `getBalances` — multi-ecosystem wallet balances + USD totals
- `createWebhook` — register webhook endpoints for swap / on-ramp events
- `registerInboundReceiver` — SuperSwap V2 inbound deposits
- On-ramp helpers — `getOnrampQuote`, `getOnrampCheckout`, `getOnrampStatus`

## Authentication

The API is open by default — every endpoint works without
authentication, so you can integrate, test, and ship without a signup.

An **API key is only needed if you're a partner** with negotiated terms
(custom fee splits, fee discounts, volume tiers, higher rate limits,
webhook events scoped to your traffic). When set, the SDK sends it as
the `X-API-Key` header.

Apply for a partner account at [partner.hypermid.io](https://partner.hypermid.io).

## Documentation

Full reference: <https://docs.hypermid.io>

## License

MIT
