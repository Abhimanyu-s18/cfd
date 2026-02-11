/**
 * Phase 2 — Pure Domain Calculations (Account-level derivatives)
 *
 * INV-FIN-002 — Equity Calculation Integrity
 * Responsibility: Define account equity as first-class financial truth.
 * Phase: 2 (pure math — no validation, no state, no side-effects)
 * Formula: equity = balance + unrealizedPnl
 *
 * Equity is a financial primitive used by:
 *  - Margin level calculations
 *  - Stop-out logic (GP-3)
 *  - Risk invariants (INV-RISK-*)
 *  - Free margin derivation
 *
 * Properties:
 *  - Deterministic: same inputs → same output
 *  - No validation: caller ensures balance >= 0 (Phase 1 guards this)
 *  - No rounding: deferred to effects layer
 *  - Single source of truth referenced everywhere equity is needed
 *
 * Proven by Golden Paths: GP-1 (profit), GP-2 (loss), GP-3 (stop-out)
 */
export function calculateEquity(
  balance: number,
  unrealizedPnl: number
): number {
  return balance + unrealizedPnl;
}

/**
 * INV-FIN-004 — Free Margin
 * Responsibility: Single pure function returning free margin for an account.
 * Phase: 2 (pure math only — no validation, no state, no side-effects)
 * Formula: freeMargin = equity - marginUsed
 * where equity = balance + unrealizedPnl
 *
 * Properties:
 *  - Deterministic: same inputs → same output
 *  - No validation: caller ensures inputs are sane (e.g. marginUsed >= 0)
 *  - No rounding: rounding is deferred to effects/presentation layer
 *  - No I/O, no randomness
 *  - Depends on calculateEquity() for single source of truth
 *
 * Proven by Golden Paths: GP-1, GP-2, GP-3
 */
export function calculateFreeMargin(
  balance: number,
  unrealizedPnl: number,
  marginUsed: number
): number {
  const equity = calculateEquity(balance, unrealizedPnl);
  return equity - marginUsed;
}

/**
 * INV-FIN-005 — Margin Level Integrity
 * Responsibility: Calculate margin level as primary stop-out trigger metric.
 * Phase: 2 (pure math only — no validation, no state, no side-effects)
 * Formula: marginLevel = (equity / marginUsed) × 100 [percentage]
 * where equity = balance + unrealizedPnl
 *
 * Properties:
 *  - Deterministic: same inputs → same output
 *  - No validation: caller ensures marginUsed > 0 (Phase 1 guards this)
 *  - No rounding: deferred to effects layer
 *  - Division by zero: caller responsible for ensuring marginUsed > 0
 *  - Single source of truth via calculateEquity()
 *
 * Critical usage:
 *  - GP-3: stop-out logic (triggered when margin level < threshold, e.g., 20%)
 *  - Risk monitoring across all positions
 *  - Account health assessment
 *
 * Proven by Golden Paths: GP-1 (margin level stable), GP-2 (dropping), GP-3 (triggers liquidation)
 */
export function calculateMarginLevel(
  balance: number,
  unrealizedPnl: number,
  marginUsed: number
): number {
  const equity = calculateEquity(balance, unrealizedPnl);
  return (equity / marginUsed) * 100;
}

export default calculateEquity;
