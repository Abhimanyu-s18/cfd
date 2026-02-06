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
 * Calculate unrealized P&L for a position
 * Invariant: INV-FIN-011, INV-FIN-012
 */
export function calculateUnrealizedPnL(
  side: "LONG" | "SHORT",
  entryPrice: number,
  currentPrice: number,
  size: number
): number {
  // TODO: Implement
  // LONG: (currentPrice - entryPrice) × size
  // SHORT: (entryPrice - currentPrice) × size
  return 0;
}

/**
 * Calculate realized P&L
 * Invariant: INV-FIN-014, INV-CALC-003
 */
export function calculateRealizedPnL(
  side: "LONG" | "SHORT",
  entryPrice: number,
  closePrice: number,
  size: number,
  commissionFee: number,
  swapFee: number = 0
): number {
  // TODO: Calculate raw P&L
  // TODO: Subtract commissionFee
  // TODO: Subtract swapFee
  // TODO: Round to 2 decimals (banker's rounding) - INV-CALC-002
  return 0;
}

/**
 * Helper: Banker's rounding to 2 decimal places
 * Invariant: INV-CALC-002
 */
export function roundTo2Decimals(value: number): number {
  // TODO: Implement banker's rounding
  return Math.round(value * 100) / 100;
}
