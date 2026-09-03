/**
 * AD-7's single shared unwrap point for every Finance service response.
 *
 * All `units-finance` responses arrive as `{content, message, status}`.
 * Every Finance service reads its response through this helper instead of
 * each call site hand-rolling `resp?.content ?? {}` independently — this
 * is intentionally the only place in Finance code that reaches into
 * `resp?.content`. It is not a new interceptor and does not change any
 * non-Finance response handling.
 */
export function unwrapFinanceEnvelope<T>(resp: any): T {
  return resp?.content;
}
