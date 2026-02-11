/**
 * fees.ts - Commission and swap fee calculations
 * 
 * Invariants:
 * - INV-FIN-014: Fees deducted from realized P&L
 * - INV-CALC-003: Order: rawPnL → fees → realizedPnL
 * 
 * Pure functions - no state, no side effects
 */

/**
 * calculateCommissionFee — PHASE 2 CALCULATION
 * 
 * Invariant: INV-FIN-014 - Fees Deducted from P&L
 * 
 * Rule: Commission = (size × entryPrice × feeRate)
 * 
 * Enforcement: PHASE 2 (Pure Domain Calculations)
 * Reference: ENGINE_EXECUTION_CONTRACT.md § 3 — Phase 2
 * ENGINE_INVARIANTS.md § 1.3
 * 
 * Applied to:
 * - Position open (entry commission)
 * - Position close (exit commission)
 * 
 * Commission is part of realized P&L fee chain (INV-CALC-003):
 * realizedPnL = rawPnL - commissionFee - swapFee
 * 
 * Default rates:
 * - 0.001 (0.1%) typical for major forex pairs
 * - Configurable per asset class/market
 * 
 * Severity: HIGH
 * Engine bug if violated: NO (configuration issue, not calculation error)
 * 
 * Pure function: YES (no state access, no side effects)
 * Deterministic: YES (same inputs → same output)
 * Rounding: NO (rounded in calculateRealizedPnL)
 * 
 * @param size - Position size (> 0, validated in Phase 1)
 * @param entryPrice - Entry price (> 0, validated in Phase 1)
 * @param feeRate - Fee as decimal (0.001 = 0.1%), default 0.1%
 * @returns Commission fee in currency units
 */
export function calculateCommissionFee(
  size: number,
  entryPrice: number,
  feeRate: number = 0.001 // Default 0.1%
): number {
  return size * entryPrice * feeRate;
}

/**
 * calculateSwapFee — PHASE 2 CALCULATION
 * 
 * Invariant: INV-FIN-014 - Fees Deducted from P&L
 * 
 * Rule: SwapFee = (size × entryPrice × dailyRate) × days
 * 
 * Enforcement: PHASE 2 (Pure Domain Calculations)
 * Reference: ENGINE_EXECUTION_CONTRACT.md § 3 — Phase 2
 * ENGINE_INVARIANTS.md § 1.3
 * 
 * Swap fee is the overnight holding cost for rolling positions.
 * Applied only if position held through market close/open.
 * 
 * Used in:
 * - Realized P&L calculation on close (INV-CALC-003)
 * - Multi-day position cost analysis
 * 
 * Swap fee is part of realized P&L fee chain:
 * realizedPnL = rawPnL - commissionFee - swapFee
 * 
 * Default rates:
 * - 0.0001 (0.01% per day) typical for forex
 * - Varies by asset class and broker policy
 * - Can be positive or negative (paying for holding)
 * 
 * Example:
 * - Size: 1.0, Entry: 1.10, Days: 1, DailyRate: 0.0001
 * - SwapFee = 1.0 × 1.10 × 0.0001 × 1 = 0.00011
 * 
 * Severity: MEDIUM (financing cost, not core trading logic)
 * Engine bug if violated: NO (configuration/policy issue)
 * 
 * Pure function: YES (no state access, no side effects)
 * Deterministic: YES (same inputs → same output)
 * Rounding: NO (rounded in calculateRealizedPnL)
 * 
 * @param size - Position size (> 0)
 * @param entryPrice - Entry price (> 0)
 * @param days - Number of days held (>= 0)
 * @param dailyRate - Daily fee rate (0.0001 = 0.01%), default 0.01%
 * @returns Swap fee in currency units
 */
export function calculateSwapFee(
  size: number,
  entryPrice: number,
  days: number,
  dailyRate: number = 0.0001 // Default 0.01% per day
): number {
  return size * entryPrice * dailyRate * days;
}
