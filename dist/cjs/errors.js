"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HypermidNetworkError = exports.HypermidTimeoutError = exports.HypermidError = void 0;
/**
 * Base error thrown by the Hypermid SDK when the API returns an error response.
 */
class HypermidError extends Error {
    /** The API error code (e.g. "NO_ROUTE_FOUND", "RATE_LIMITED", "UPSTREAM_ERROR") */
    code;
    /** HTTP status code from the API */
    status;
    /** Request metadata (requestId, timestamp, rateLimit) */
    meta;
    /** Additional error details (lifiCode, toolErrors, etc.) */
    details;
    constructor(code, message, status, meta, details) {
        super(message);
        this.name = "HypermidError";
        this.code = code;
        this.status = status;
        this.meta = meta;
        this.details = details;
    }
    /** Rate limit info from the response, if available */
    get rateLimit() {
        return this.meta.rateLimit;
    }
    /** LI.FI-specific error code, if this was a LI.FI error */
    get lifiCode() {
        return this.details?.lifiCode;
    }
    /** Per-tool errors from LI.FI, if available */
    get toolErrors() {
        return this.details?.toolErrors;
    }
}
exports.HypermidError = HypermidError;
/**
 * Thrown when the request times out.
 */
class HypermidTimeoutError extends Error {
    code = "TIMEOUT";
    constructor(timeoutMs) {
        super(`Request timed out after ${timeoutMs}ms`);
        this.name = "HypermidTimeoutError";
    }
}
exports.HypermidTimeoutError = HypermidTimeoutError;
/**
 * Thrown when a network/fetch error occurs.
 */
class HypermidNetworkError extends Error {
    code = "NETWORK_ERROR";
    cause;
    constructor(message, cause) {
        super(message);
        this.name = "HypermidNetworkError";
        this.cause = cause;
    }
}
exports.HypermidNetworkError = HypermidNetworkError;
//# sourceMappingURL=errors.js.map