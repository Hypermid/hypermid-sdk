import type { ApiMeta, RateLimitInfo, LiFiToolError } from "./types.js";
/**
 * Base error thrown by the HyperMid SDK when the API returns an error response.
 */
export declare class HyperMidError extends Error {
    /** The API error code (e.g. "NO_ROUTE_FOUND", "RATE_LIMITED", "UPSTREAM_ERROR") */
    readonly code: string;
    /** HTTP status code from the API */
    readonly status: number;
    /** Request metadata (requestId, timestamp, rateLimit) */
    readonly meta: ApiMeta;
    /** Additional error details (lifiCode, toolErrors, etc.) */
    readonly details?: Record<string, unknown>;
    constructor(code: string, message: string, status: number, meta: ApiMeta, details?: Record<string, unknown>);
    /** Rate limit info from the response, if available */
    get rateLimit(): RateLimitInfo | undefined;
    /** LI.FI-specific error code, if this was a LI.FI error */
    get lifiCode(): number | undefined;
    /** Per-tool errors from LI.FI, if available */
    get toolErrors(): LiFiToolError[] | undefined;
}
/**
 * Thrown when the request times out.
 */
export declare class HyperMidTimeoutError extends Error {
    readonly code = "TIMEOUT";
    constructor(timeoutMs: number);
}
/**
 * Thrown when a network/fetch error occurs.
 */
export declare class HyperMidNetworkError extends Error {
    readonly code = "NETWORK_ERROR";
    readonly cause?: Error;
    constructor(message: string, cause?: Error);
}
//# sourceMappingURL=errors.d.ts.map