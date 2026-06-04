"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = exports.quoteAndPrepare = exports.waitForLiFiCompletion = exports.waitForDepositCompletion = exports.executeSwap = exports.isDepositFailed = exports.isDepositRefunded = exports.isDepositSuccess = exports.isLiFiStatusTerminal = exports.isNIStatusTerminal = exports.isWalletDeposit = exports.isManualDeposit = exports.isSuperSwapRoute = exports.isNearIntentsRoute = exports.isLiFiRoute = exports.getDryQuotePlaceholder = exports.getChainsByProvider = exports.getAllChains = exports.isNIOnlyChain = exports.toNumericId = exports.toNIBlockchain = exports.toLifiChainId = exports.resolveChain = exports.NI_CHAIN_BASE = exports.CHAIN_REGISTRY = exports.supportsWalletDeposit = exports.isNearIntentsChain = exports.ChainSlug = exports.ChainId = exports.HypermidNetworkError = exports.HypermidTimeoutError = exports.HypermidError = exports.Hypermid = void 0;
// ─── Core client ─────────────────────────────────────────────────────────
var client_js_1 = require("./client.js");
Object.defineProperty(exports, "Hypermid", { enumerable: true, get: function () { return client_js_1.Hypermid; } });
// ─── Errors ──────────────────────────────────────────────────────────────
var errors_js_1 = require("./errors.js");
Object.defineProperty(exports, "HypermidError", { enumerable: true, get: function () { return errors_js_1.HypermidError; } });
Object.defineProperty(exports, "HypermidTimeoutError", { enumerable: true, get: function () { return errors_js_1.HypermidTimeoutError; } });
Object.defineProperty(exports, "HypermidNetworkError", { enumerable: true, get: function () { return errors_js_1.HypermidNetworkError; } });
// ─── Chain constants ─────────────────────────────────────────────────────
var chains_js_1 = require("./chains.js");
Object.defineProperty(exports, "ChainId", { enumerable: true, get: function () { return chains_js_1.ChainId; } });
Object.defineProperty(exports, "ChainSlug", { enumerable: true, get: function () { return chains_js_1.ChainSlug; } });
Object.defineProperty(exports, "isNearIntentsChain", { enumerable: true, get: function () { return chains_js_1.isNearIntentsChain; } });
Object.defineProperty(exports, "supportsWalletDeposit", { enumerable: true, get: function () { return chains_js_1.supportsWalletDeposit; } });
// ─── Chain registry ─────────────────────────────────────────────────
var chain_registry_js_1 = require("./chain-registry.js");
Object.defineProperty(exports, "CHAIN_REGISTRY", { enumerable: true, get: function () { return chain_registry_js_1.CHAIN_REGISTRY; } });
Object.defineProperty(exports, "NI_CHAIN_BASE", { enumerable: true, get: function () { return chain_registry_js_1.NI_CHAIN_BASE; } });
Object.defineProperty(exports, "resolveChain", { enumerable: true, get: function () { return chain_registry_js_1.resolveChain; } });
Object.defineProperty(exports, "toLifiChainId", { enumerable: true, get: function () { return chain_registry_js_1.toLifiChainId; } });
Object.defineProperty(exports, "toNIBlockchain", { enumerable: true, get: function () { return chain_registry_js_1.toNIBlockchain; } });
Object.defineProperty(exports, "toNumericId", { enumerable: true, get: function () { return chain_registry_js_1.toNumericId; } });
Object.defineProperty(exports, "isNIOnlyChain", { enumerable: true, get: function () { return chain_registry_js_1.isNIOnlyChain; } });
Object.defineProperty(exports, "getAllChains", { enumerable: true, get: function () { return chain_registry_js_1.getAllChains; } });
Object.defineProperty(exports, "getChainsByProvider", { enumerable: true, get: function () { return chain_registry_js_1.getChainsByProvider; } });
Object.defineProperty(exports, "getDryQuotePlaceholder", { enumerable: true, get: function () { return chain_registry_js_1.getDryQuotePlaceholder; } });
// ─── Type guards & helpers ───────────────────────────────────────────────
var helpers_js_1 = require("./helpers.js");
Object.defineProperty(exports, "isLiFiRoute", { enumerable: true, get: function () { return helpers_js_1.isLiFiRoute; } });
Object.defineProperty(exports, "isNearIntentsRoute", { enumerable: true, get: function () { return helpers_js_1.isNearIntentsRoute; } });
Object.defineProperty(exports, "isSuperSwapRoute", { enumerable: true, get: function () { return helpers_js_1.isSuperSwapRoute; } });
Object.defineProperty(exports, "isManualDeposit", { enumerable: true, get: function () { return helpers_js_1.isManualDeposit; } });
Object.defineProperty(exports, "isWalletDeposit", { enumerable: true, get: function () { return helpers_js_1.isWalletDeposit; } });
Object.defineProperty(exports, "isNIStatusTerminal", { enumerable: true, get: function () { return helpers_js_1.isNIStatusTerminal; } });
Object.defineProperty(exports, "isLiFiStatusTerminal", { enumerable: true, get: function () { return helpers_js_1.isLiFiStatusTerminal; } });
Object.defineProperty(exports, "isDepositSuccess", { enumerable: true, get: function () { return helpers_js_1.isDepositSuccess; } });
Object.defineProperty(exports, "isDepositRefunded", { enumerable: true, get: function () { return helpers_js_1.isDepositRefunded; } });
Object.defineProperty(exports, "isDepositFailed", { enumerable: true, get: function () { return helpers_js_1.isDepositFailed; } });
// ─── Execution lifecycle ─────────────────────────────────────────────────
var execution_js_1 = require("./execution.js");
Object.defineProperty(exports, "executeSwap", { enumerable: true, get: function () { return execution_js_1.executeSwap; } });
Object.defineProperty(exports, "waitForDepositCompletion", { enumerable: true, get: function () { return execution_js_1.waitForDepositCompletion; } });
Object.defineProperty(exports, "waitForLiFiCompletion", { enumerable: true, get: function () { return execution_js_1.waitForLiFiCompletion; } });
Object.defineProperty(exports, "quoteAndPrepare", { enumerable: true, get: function () { return execution_js_1.quoteAndPrepare; } });
// ─── Webhook verification ────────────────────────────────────────────────
var webhook_verify_js_1 = require("./webhook-verify.js");
Object.defineProperty(exports, "verifyWebhookSignature", { enumerable: true, get: function () { return webhook_verify_js_1.verifyWebhookSignature; } });
//# sourceMappingURL=index.js.map