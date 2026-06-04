# @hypermid/sdk

TypeScript / JavaScript SDK for the [HyperMid](https://hypermid.io) Partner
API — swap, bridge, and on-ramp across 90+ chains (EVM, Solana, Bitcoin,
Sui, NEAR, Tron, TON, XRP, Doge).

```bash
npm install @hypermid/sdk
```

## Quick start

```ts
import { HyperMid } from "@hypermid/sdk";

const hm = new HyperMid({
  apiKey: process.env.HYPERMID_API_KEY, // optional — anonymous tier works for testing
});

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

Pass your partner API key via the `apiKey` option. The SDK sends it as the
`X-API-Key` header. Without a key you get the anonymous tier
(100 req/min, 30 bps fee).

Get a key at [partner.hypermid.io](https://partner.hypermid.io).

## Documentation

Full reference: <https://docs.hypermid.io>

## License

MIT
