/**
 * financial.ts - Financial invariant enforcement (Phase 3)
 * 
 * These assertions validate that Phase 2 calculations are mathematically consistent
 * and that domain rules are satisfied. They run AFTER Phase 2 but BEFORE state changes.
 * 
 * If any assertion fails, it indicates a code bug (engineBugIfViolated = true).
 * 
 * Invariants enforced:
 * - INV-FIN-001: Balance non-negativity (Phase 1 validation, reference here)
 * - INV-FIN-002: Equity calculation integrity (Phase 3 assertion) ✅ Option Q
 * - INV-FIN-003: Margin used calculation
 * - INV-FIN-004: Free margin calculation
 * - INV-FIN-005: Margin level calculation
 * - INV-FIN-006: Bonus separation
 * - INV-FIN-007: Realized P&L finality
 * - INV-FIN-008: Transaction balance consistency
 * - INV-FIN-009: Leverage limits
 * - INV-FIN-010: Margin calculation correctness
 * - INV-FIN-011: Long P&L formula
 * - INV-FIN-012: Short P&L formula
 * - INV-FIN-013: P&L symmetry
 * - INV-FIN-014: Fee accumulation
 */

export class EngineInvariantViolationError extends Error {
  constructor(
    public invariantId: string,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "EngineInvariantViolationError";
  }
}

/**
 * assertBalanceValid — PHASE 3 ASSERTION
 * 
 * Invariant: INV-FIN-001 - Account Balance Non-Negativity [HARD LAW]
 * 
 * Rule: balance >= 0 (always)
 * 
 * Rationale:
 * - Paper trading cannot create debt
 * - Negative balance indicates calculation or closure error
 * - Phase 1 validates user operations; Phase 3 catches engine bugs
 * 
 * When to call:
 * - After any operation that modifies balance (close position, add/remove funds)
 * - Before returning EngineResult
 * 
 * Severity: CRITICAL
 * Engine bug if violated: YES (indicates Phase 2 calculation error)
 * 
 * @param balance - Account balance in currency units
 * @throws EngineInvariantViolationError if balance < 0
 */
export function assertBalanceValid(balance: number): void {
  if (balance < 0) {
    throw new EngineInvariantViolationError(
      "INV-FIN-001",
      "NEGATIVE_BALANCE",
      `Balance must be non-negative; got ${balance}`
    );
  }
}

/**
 * INV-FIN-002 — Equity Calculation Integrity (Phase 3)
 * 
 * Assertion: equity MUST equal balance + unrealizedPnL (exactly)
 * 
 * This is the keystone Phase 3 assertion that validates Phase 2 math is correct.
 * If this fails, it indicates a code bug in Phase 2 calculations or Phase 4 state mutation.
 * 
 * Reference: ENGINE_EXECUTION_CONTRACT.md § 3 — Phase 3 (Invariant Enforcement)
 * Parent invariant: INV-FIN-002 from invariant-enforcement-map.json
 * Related golden paths: GP-1 (profit), GP-2 (loss), GP-3 (stop-out)
 * 
 * Severity: CRITICAL (engineBugIfViolated = true)
 */
export function assertEquityConsistent(
  balance: number,
  unrealizedPnL: number,
  equity: number
): void {
  const expectedEquity = balance + unrealizedPnL;
  
  if (Math.abs(equity - expectedEquity) > 1e-9) {
    throw new EngineInvariantViolationError(
      "INV-FIN-002",
      "EQUITY_CALCULATION_MISMATCH",
      `Equity mismatch: expected ${expectedEquity}, got ${equity} ` +
      `(balance=${balance}, unrealizedPnL=${unrealizedPnL})`
    );
  }
}

/**
 * assertMarginConsistency — PHASE 3 ASSERTION
 * 
 * Invariant: INV-FIN-003 - Margin Used Accuracy [HARD LAW]
 * 
 * Rule: usedMargin MUST equal sum(all_open_positions.marginUsed)
 * 
 * Formula: marginUsed = Σ position.marginUsed for all open positions
 * 
 * Rationale:
 * - Margin tracking must be precise for risk management
 * - Used margin is the foundation for free margin and margin level calculations
 * - Any discrepancy indicates a calculation bug during Phase 2
 * 
 * When to call:
 * - After calculating total used margin from all positions
 * - Before returning EngineResult
 * 
 * Severity: CRITICAL
 * Engine bug if violated: YES (margin calculation cascade)
 * 
 * @param marginUsed - Recorded total margin used
 * @param positionMargins - Array of margins from each open position
 * @throws EngineInvariantViolationError if sum doesn't match
 */
export function assertMarginConsistency(
  marginUsed: number,
  positionMargins: number[]
): void {
  const summarizedMargin = positionMargins.reduce((sum, m) => sum + m, 0);
  // Allow small floating point tolerance
  if (Math.abs(marginUsed - summarizedMargin) > 1e-9) {
    throw new EngineInvariantViolationError(
      "INV-FIN-003",
      "MARGIN_MISMATCH",
      `Margin used mismatch: expected ${summarizedMargin}, got ${marginUsed} ` +
      `(positions: [${positionMargins.join(", ")}])`
    );
  }
}

/**
 * assertLeverageWithinLimits — PHASE 3 ASSERTION
 * 
 * Invariant: INV-FIN-009 - Leverage Limits by Asset Class [CONFIGURABLE POLICY]
 * 
 * Rule: leverage MUST NOT exceed maximum for each asset class
 * 
 * Limits:
 * - Forex (Majors): <= 500
 * - Forex (Crosses): <= 400
 * - Commodities (Metals): <= 100
 * - Commodities (Energy): <= 50
 * - Commodities (Agri): <= 50
 * - Indices: <= 200
 * - Cryptocurrencies: <= 50
 * - Stocks: <= 20
 * 
 * Rationale:
 * - Risk management and regulatory compliance
 * - Higher leverage = higher risk
 * - Different asset classes have different volatility profiles
 * 
 * When to call:
 * - During position opening (Phase 3)
 * - Validates that Phase 1 accepted correct leverage
 * 
 * Severity: HIGH
 * Engine bug if violated: NO (indicates Phase 1 validation failure)
 * 
 * @param leverage - Position leverage
 * @param maxLeverage - Maximum allowed leverage for this asset class
 * @throws EngineInvariantViolationError if leverage > maxLeverage
 */
export function assertLeverageWithinLimits(
  leverage: number,
  maxLeverage: number
): void {
  if (leverage > maxLeverage) {
    throw new EngineInvariantViolationError(
      "INV-FIN-009",
      "LEVERAGE_EXCEEDS_LIMIT",
      `Leverage ${leverage} exceeds maximum ${maxLeverage} for this asset class`
    );
  }
}

/**
 * assertBonusValid — PHASE 3 ASSERTION
 * 
 * Invariant: INV-FIN-006 - Bonus Separation [CONFIGURABLE POLICY]
 * 
 * Rule: bonus >= 0
 * 
 * Properties:
 * - Bonus is promotional credit (not user-owned)
 * - Available for margin calculation
 * - NOT available for withdrawal
 * 
 * When to call:
 * - After any operation affecting bonus (add/remove)
 * - Before returning EngineResult
 * 
 * Severity: MEDIUM
 * Engine bug if violated: NO (configuration issue)
 * 
 * @param bonus - Account bonus amount
 * @throws EngineInvariantViolationError if bonus < 0
 */
export function assertBonusValid(bonus: number): void {
  if (bonus < 0) {
    throw new EngineInvariantViolationError(
      "INV-FIN-006",
      "INVALID_BONUS",
      `Bonus must be non-negative; got ${bonus}`
    );
  }
}
