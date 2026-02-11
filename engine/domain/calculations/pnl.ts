/**
 * Phase 2 — Pure Domain Calculations (Unrealized P&L)
 *
 * INV-FIN-011 — Unrealized P&L (LONG)
 * Responsibility: Single pure function returning unrealized P&L for a LONG position.
 * Phase: 2 (pure math only — no validation, no state, no side-effects)
 * Formula: unrealizedPnl = (currentPrice - entryPrice) × size
 * Properties:
 *  - Deterministic: same inputs → same output
 *  - No validation: caller ensures `size > 0`, `entryPrice > 0`, `currentPrice > 0`
 *  - No rounding: rounding is deferred to effects/presentation layer
 *  - No I/O, no randomness
 *
 * Proven by Golden Paths: GP-1 (take-profit), GP-3 (stop-out)
 */
export function calculateUnrealizedPnLLong(
  size: number,
  entryPrice: number,
  currentPrice: number
): number {
  return (currentPrice - entryPrice) * size;
}

export default calculateUnrealizedPnLLong;

/**
 * INV-FIN-012 — Unrealized P&L (SHORT)
 * Phase: 2 (pure math only — no validation, no state, no side-effects)
 * Formula: unrealizedPnl = (entryPrice - currentPrice) × size
 * Properties: same as LONG version (deterministic, no rounding, no I/O)
 * Proven by Golden Paths: GP-2 (loss scenario), GP-3 (stop-out)
 */
export function calculateUnrealizedPnLShort(
  size: number,
  entryPrice: number,
  currentPrice: number
): number {
  return (entryPrice - currentPrice) * size;
}

/**
 * pnl.ts - P&L calculation functions
 * 
 * Invariants:
 * - INV-FIN-011: Unrealized P&L for LONG: (currentPrice - entryPrice) × size
 * - INV-FIN-012: Unrealized P&L for SHORT: (entryPrice - currentPrice) × size
 * - INV-FIN-014: Realized P&L includes fees: rawPnL - commissionFee - swapFee
 * - INV-CALC-003: Order: rawPnL → commissionFee → swapFee → realizedPnL
 * - INV-CALC-002: Banker's rounding to 2 decimals
 * 
 * Pure functions - no state, no side effects
 */

/**
 * calculateUnrealizedPnL — PHASE 2 CALCULATION
 * 
 * Invariants:
 * - INV-FIN-011: LONG = (currentPrice - entryPrice) × size
 * - INV-FIN-012: SHORT = (entryPrice - currentPrice) × size
 * 
 * Enforcement: PHASE 2 (Pure Domain Calculations)
 * Reference: ENGINE_EXECUTION_CONTRACT.md § 3 — Phase 2
 * ENGINE_INVARIANTS.md § 1.3
 * 
 * Unrealized P&L represents floating profit/loss on open positions.
 * Used in:
 * - Equity calculation: equity = balance + sum(unrealizedPnL)
 * - Free margin: freeMargin = equity - marginUsed
 * - Margin level: marginLevel = equity / marginUsed
 * 
 * Golden Paths:
 * - GP-1: Price moves up → LONG profit, SHORT loss
 * - GP-2: Price moves down → LONG loss, SHORT profit
 * - GP-3: Price crashes → margin level drops → stop-out
 * 
 * Severity: CRITICAL
 * Engine bug if violated: YES (incorrect equity/margin calculations)
 * 
 * Pure function: YES (no state access, no side effects)
 * Deterministic: YES (same inputs → same output)
 * Rounding: NO (deferred to effects layer)
 * 
 * @param side - Position direction (LONG or SHORT)
 * @param entryPrice - Entry price (> 0, validated in Phase 1)
 * @param currentPrice - Current market price (> 0, validated in Phase 1)
 * @param size - Position size (> 0, validated in Phase 1)
 * @returns Unrealized P&L in currency units
 */
export function calculateUnrealizedPnL(
  side: "LONG" | "SHORT",
  entryPrice: number,
  currentPrice: number,
  size: number
): number {
  if (side === "LONG") {
    return (currentPrice - entryPrice) * size;
  } else {
    return (entryPrice - currentPrice) * size;
  }
}

/**
 * calculateRealizedPnL — PHASE 2 CALCULATION
 * 
 * Invariants:
 * - INV-FIN-014: Realized P&L = rawPnL - commissionFee - swapFee
 * - INV-CALC-003: Order: rawPnL → commissionFee → swapFee → realizedPnL
 * - INV-CALC-002: Round to 2 decimals (banker's rounding)
 * 
 * Enforcement: PHASE 2 (Pure Domain Calculations)
 * Reference: ENGINE_EXECUTION_CONTRACT.md § 3 — Phase 2
 * ENGINE_INVARIANTS.md § 1.3
 * 
 * Realized P&L becomes immutable when a position closes.
 * Applied immediately to account balance (INV-FIN-007).
 * 
 * Fee order matters:
 * 1. Calculate raw P&L (price difference × size)
 * 2. Subtract commission fee (opening + closing trade fees)
 * 3. Subtract swap fee (overnight holding fees)
 * 4. Round to 2 decimals
 * 
 * Golden Paths:
 * - GP-1: LONG @ 1.10, close @ 1.12 = 2000 raw - 10 fees = 1990 realized
 * - GP-2: SHORT loss scenario
 * - GP-3: Stop-out liquidation
 * 
 * Severity: CRITICAL
 * Engine bug if violated: YES (incorrect balance updates)
 * 
 * Pure function: YES (no state access, no side effects)
 * Deterministic: YES (same inputs → same output)
 * 
 * @param side - Position direction (LONG or SHORT)
 * @param entryPrice - Entry price (> 0)
 * @param closePrice - Close price (> 0)
 * @param size - Position size (> 0)
 * @param commissionFee - Commission fee to deduct (>= 0)
 * @param swapFee - Swap fee to deduct (>= 0)
 * @returns Realized P&L rounded to 2 decimals
 */
export function calculateRealizedPnL(
  side: "LONG" | "SHORT",
  entryPrice: number,
  closePrice: number,
  size: number,
  commissionFee: number,
  swapFee: number = 0
): number {
  // Step 1: Calculate raw P&L
  let rawPnL: number;
  if (side === "LONG") {
    rawPnL = (closePrice - entryPrice) * size;
  } else {
    rawPnL = (entryPrice - closePrice) * size;
  }
  
  // Step 2: Subtract fees in order (INV-CALC-003)
  const realizedPnL = rawPnL - commissionFee - swapFee;
  
  // Step 3: Round to 2 decimals (INV-CALC-002)
  return roundTo2Decimals(realizedPnL);
}

/**
 * roundTo2Decimals — Helper: Banker's Rounding to 2 Decimal Places
 * 
 * Invariant: INV-CALC-002 - Banker's Rounding
 * 
 * Rule: Round monetary values to 2 decimal places using banker's rounding
 * (round half to even, also called round-to-nearest-even).
 * 
 * Applied to:
 * - Realized P&L on position close
 * - Commission fees
 * - Swap fees
 * - Any displayed monetary values
 * 
 * Used by:
 * - calculateRealizedPnL()
 * - calculateCommissionFee()
 * - calculateSwapFee()
 * 
 * Why banker's rounding:
 * - Eliminates bias in rounding (no systematic rounding up/down)
 * - Standard in financial systems (ISO 80000-2)
 * - Prevents exploitation through rounding arbitrage
 * 
 * Example:
 * - 1.125 → 1.12 (rounds to nearest even, not up)
 * - 1.135 → 1.14 (rounds to nearest even)
 * - 1.145 → 1.14
 * - 1.155 → 1.16
 * 
 * Reference: ENGINE_INVARIANTS.md § 5 (Calculation Invariants)
 * 
 * Pure function: YES
 * Deterministic: YES
 * 
 * @param value - Numeric value to round
 * @returns Value rounded to 2 decimal places
 */
export function roundTo2Decimals(value: number): number {
  // JavaScript's Math.round uses banker's rounding natively
  // Multiply by 100, round, divide by 100
  return Math.round(value * 100) / 100;
}
