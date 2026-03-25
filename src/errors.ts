import type { ApiMeta, RateLimitInfo, LiFiToolError } from "./types.js";

/**
 * Base error thrown by the HyperMid SDK when the API returns an error response.
 */
export class HyperMidError extends Error {
  /** The API error code (e.g. "NO_ROUTE_FOUND", "RATE_LIMITED", "UPSTREAM_ERROR") */
  public readonly code: string;
  /** HTTP status code from the API */
  public readonly status: number;
  /** Request metadata (requestId, timestamp, rateLimit) */
  public readonly meta: ApiMeta;
  /** Additional error details (lifiCode, toolErrors, etc.) */
  public readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    status: number,
    meta: ApiMeta,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "HyperMidError";
    this.code = code;
    this.status = status;
    this.meta = meta;
    this.details = details;
  }

  /** Rate limit info from the response, if available */
  get rateLimit(): RateLimitInfo | undefined {
    return this.meta.rateLimit;
  }

  /** LI.FI-specific error code, if this was a LI.FI error */
  get lifiCode(): number | undefined {
    return this.details?.lifiCode as number | undefined;
  }

  /** Per-tool errors from LI.FI, if available */
  get toolErrors(): LiFiToolError[] | undefined {
    return this.details?.toolErrors as LiFiToolError[] | undefined;
  }
}

/**
 * Thrown when the request times out.
 */
export class HyperMidTimeoutError extends Error {
  public readonly code = "TIMEOUT";

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = "HyperMidTimeoutError";
  }
}

/**
 * Thrown when a network/fetch error occurs.
 */
export class HyperMidNetworkError extends Error {
  public readonly code = "NETWORK_ERROR";
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "HyperMidNetworkError";
    this.cause = cause;
  }
}
