/**
 * margin.ts - Margin calculation functions
 * 
 * Invariants:
 * - INV-FIN-010: Margin required = (size × entryPrice) / leverage
 * - INV-FIN-003: MarginUsed = sum of all open position margins
 * - INV-FIN-004: FreeMargin = equity - marginUsed
 * - INV-FIN-005: MarginLevel = (equity / marginUsed) × 100%
 * 
 * Pure functions - no state, no side effects
 */

/**
 * calculateMarginRequired — OPTION K: FIRST PURE CALCULATION
 * 
 * Invariant: INV-FIN-010 - Margin Calculation Correctness
 * 
 * Rule: marginRequired = (size × entryPrice) / leverage
 * 
 * Enforcement: PHASE 2 (Pure Domain Calculations)
 * Reference: ENGINE_EXECUTION_CONTRACT.md § 3 — Phase 2
 * 
 * This is the foundation for:
 * - INV-FIN-003 (MarginUsed = sum of margins)
 * - INV-FIN-004 (FreeMargin = equity - marginUsed)
 * - INV-FIN-005 (MarginLevel = equity / marginUsed)
 * - INV-RISK-004 (Margin level must be >= 20%)
 * 
 * Used by:
 * - OPEN_POSITION event (reserve margin before opening)
 * - UPDATE_PRICES event (recalculate on price changes)
 * - CLOSE_POSITION event (release margin on close)
 * 
 * Golden Paths:
 * - GP-1: Open → Price Up → Take Profit (margin reservations)
 * - GP-2: Open → Price Down → Stop Loss (margin release)
 * - GP-3: Open → Price Crash → Stop Out (margin check triggers liquidation)
 * 
 * Severity: CRITICAL
 * Engine bug if violated: YES (calculation error would cascade)
 * 
 * Pure function: YES (no state access, no side effects)
 * Deterministic: YES (same inputs → same output, always)
 * Division by zero: Not possible (leverage > 0 enforced in Phase 1)
 * Rounding: NO (intermediate value; rounding happens in effects layer)
 * 
 * @param size - Position size (> 0, validated in Phase 1)
 * @param entryPrice - Entry price (> 0, validated in Phase 1)
 * @param leverage - Leverage factor (> 0, validated in Phase 1)
 * @returns Margin required in currency units
 */
export function calculateMarginRequired(
  size: number,
  entryPrice: number,
  leverage: number
): number {
  // Invariant: INV-FIN-010
  // Formula: margin = (size × entryPrice) / leverage
  return (size * entryPrice) / leverage;
}

/**
 * calculateFreeMargin — PHASE 2 CALCULATION
 * 
 * Invariant: INV-FIN-004 - Free Margin Derivation
 * 
 * Rule: freeMargin = equity - usedMargin
 * where equity = balance + unrealizedPnL
 * 
 * Enforcement: PHASE 2 (Pure Domain Calculations)
 * Reference: ENGINE_EXECUTION_CONTRACT.md § 3 — Phase 2
 * 
 * Free margin determines:
 * - How much margin is available for new positions
 * - Primary input to risk checks (INV-RISK-*)
 * - Used in margin call logic (SYS-TIME-005)
 * 
 * Severity: CRITICAL
 * Engine bug if violated: YES (cascades to risk calculations)
 * 
 * Pure function: YES (no state access, no side effects)
 * Deterministic: YES (same inputs → same output)
 * 
 * @param equity - Account equity (balance + unrealizedPnL)
 * @param usedMargin - Sum of all position margins
 * @returns Free margin available for trading
 */
export function calculateFreeMargin(
  equity: number,
  usedMargin: number
): number {
  return equity - usedMargin;
}

/**
 * calculateMarginLevel — PHASE 2 CALCULATION
 * 
 * Invariant: INV-FIN-005 - Margin Level Calculation
 * 
 * Rule: if usedMargin > 0:
 *         marginLevel = (equity / usedMargin) × 100%
 *       else:
 *         marginLevel = null (infinite, no positions)
 * 
 * Enforcement: PHASE 2 (Pure Domain Calculations)
 * Reference: ENGINE_EXECUTION_CONTRACT.md § 3 — Phase 2
 * ENGINE_INVARIANTS.md § 1.1
 * 
 * Margin level is the primary stop-out trigger metric:
 * - >= 100%: Safe zone
 * - 20%-100%: Margin call zone (INV-RISK-004, SYS-TIME-005)
 * - < 20%: Stop-out zone (INV-RISK-004, SYS-TIME-006)
 * 
 * Used in:
 * - GP-3: Stop-out scenario (triggers automatic liquidation)
 * - Risk management decisions
 * - Account health assessment
 * 
 * Severity: CRITICAL
 * Engine bug if violated: YES (incorrect risk assessment)
 * 
 * Pure function: YES (no state access, no side effects)
 * Deterministic: YES (same inputs → same output)
 * Division by zero: Safe (returns null when usedMargin = 0)
 * 
 * @param equity - Account equity (balance + unrealizedPnL)
 * @param usedMargin - Sum of all position margins
 * @returns Margin level as percentage, or null if no positions
 */
export function calculateMarginLevel(
  equity: number,
  usedMargin: number
): number | null {
  if (usedMargin <= 0) {
    return null; // No positions, margin level is infinite
  }
  return (equity / usedMargin) * 100;
}

/**
 * isStopOutLevel — RISK THRESHOLD CHECK
 * 
 * Rule: Stop-out occurs when marginLevel < 20%
 * Reference: SYS-TIME-006 (Stop-out triggers liquidation at 20%)
 * 
 * When TRUE:
 * - All open positions are automatically liquidated
 * - No user intervention possible
 * - Account status changes to LIQUIDATION_ONLY
 * 
 * Pure function: YES
 * Deterministic: YES
 * 
 * @param marginLevel - Current margin level (%)  or null if no positions
 * @returns true if in stop-out zone
 */
export function isStopOutLevel(marginLevel: number | null): boolean {
  return marginLevel !== null && marginLevel < 20;
}

/**
 * isMarginCallLevel — RISK WARNING CHECK
 * 
 * Rule: Margin call warning when marginLevel < 100%
 * Reference: SYS-TIME-005 (Margin call warning at 100%)
 * 
 * When TRUE:
 * - User receives margin call notification
 * - New positions are restricted
 * - User must deposit funds or close positions
 * 
 * Pure function: YES
 * Deterministic: YES
 * 
 * @param marginLevel - Current margin level (%) or null if no positions
 * @returns true if in margin call zone
 */
export function isMarginCallLevel(marginLevel: number | null): boolean {
  return marginLevel !== null && marginLevel < 100;
}
