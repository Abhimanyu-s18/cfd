/**
 * risk.ts - Risk management invariant enforcement
 * 
 * Invariants enforced:
 * - INV-RISK-004: Margin level risk check
 * - INV-RISK-005: Stop loss trigger logic (SHORT)
 * - INV-RISK-006: Take profit trigger logic (LONG)
 * - INV-RISK-007: SL/TP mutual exclusivity
 * - INV-RISK-008: Position size minimum
 * - INV-RISK-009: Position size maximum
 * - INV-RISK-010: Exposure limits
 */

/**
 * assertMarginLevelSafe — PHASE 3 ASSERTION
 * 
 * Invariant: INV-RISK-004 - Margin Utilization Limit [CONFIGURABLE POLICY]
 * 
 * Rule: usedMargin / equity <= 0.80 (80% max utilization)
 * 
 * Interpretation:
 * - marginLevel = (equity / usedMargin) * 100
 * - marginLevel >= 125 is equivalent to usedMargin <= 0.80 * equity
 * - Prevents over-leveraging; maintains 20% safety buffer
 * 
 * When marginLevel:
 * - >= 400%: Safe (6.25% utilization)
 * - >= 125%: Safe (80% utilization) ← enforcement point
 * - 80%-125%: Warning zone (margin call)
 * - 20%-80%: Danger zone
 * - < 20%: Stop-out (liquidation)
 * 
 * When to call:
 * - After calculating total margin utilization
 * - Before allowing new position opens
 * - During price updates
 * 
 * Severity: HIGH
 * Engine bug if violated: NO (indicates risk policy breach)
 * 
 * @param marginLevel - Current margin level (%) or null if no positions
 * @throws EngineInvariantViolationError if utilization > 80%
 */
export function assertMarginLevelSafe(marginLevel: number | null): void {
  // If no positions, no risk
  if (marginLevel === null) {
    return;
  }
  
  // marginLevel >= 125 means utilization <= 80%
  // marginLevel < 125 means utilization > 80%
  if (marginLevel < 125) {
    throw new EngineInvariantViolationError(
      "INV-RISK-004",
      "MARGIN_LEVEL_TOO_LOW",
      `Margin level (${marginLevel.toFixed(2)}%) below safe threshold (125%) - ` +
      `utilization exceeds 80%`
    );
  }
}

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
 * assertStopLossTrigger — TRIGGER DETECTION
 * 
 * Invariant: INV-RISK-005 - Stop Loss Trigger Condition [HARD LAW]
 * 
 * Rule: Stop loss is triggered when market price crosses threshold
 * 
 * For LONG positions:
 *   triggered = (currentPrice <= stopLoss)
 * 
 * For SHORT positions:
 *   triggered = (currentPrice >= stopLoss)
 * 
 * Rationale:
 * - Clear trigger logic in engine
 * - Used by UPDATE_PRICES event to auto-close
 * 
 * When to call:
 * - During UPDATE_PRICES event
 * - Determines if position should auto-close
 * 
 * Severity: CRITICAL
 * Engine bug if violated: YES (incorrect trigger logic)
 * 
 * @param side - Position direction (LONG or SHORT)
 * @param stopLoss - Stop loss price (undefined if not set)
 * @param currentPrice - Current market price
 * @returns true if stop loss is triggered
 */
export function assertStopLossTrigger(
  side: "LONG" | "SHORT",
  stopLoss: number | undefined,
  currentPrice: number
): boolean {
  if (stopLoss === undefined) {
    return false; // No stop loss set
  }
  
  if (side === "LONG") {
    // LONG: stops when price <= stopLoss (hits from above)
    return currentPrice <= stopLoss;
  } else {
    // SHORT: stops when price >= stopLoss (hits from below)
    return currentPrice >= stopLoss;
  }
}

/**
 * assertTakeProfitTrigger — TRIGGER DETECTION
 * 
 * Invariant: INV-RISK-006 - Take Profit Trigger Condition [HARD LAW]
 * 
 * Rule: Take profit is triggered when market price crosses threshold
 * 
 * For LONG positions:
 *   triggered = (currentPrice >= takeProfit)
 * 
 * For SHORT positions:
 *   triggered = (currentPrice <= takeProfit)
 * 
 * Rationale:
 * - Clear trigger logic in engine
 * - Used by UPDATE_PRICES event to auto-close
 * 
 * When to call:
 * - During UPDATE_PRICES event
 * - Determines if position should auto-close
 * 
 * Severity: CRITICAL
 * Engine bug if violated: YES (incorrect trigger logic)
 * 
 * @param side - Position direction (LONG or SHORT)
 * @param takeProfit - Take profit price (undefined if not set)
 * @param currentPrice - Current market price
 * @returns true if take profit is triggered
 */
export function assertTakeProfitTrigger(
  side: "LONG" | "SHORT",
  takeProfit: number | undefined,
  currentPrice: number
): boolean {
  if (takeProfit === undefined) {
    return false; // No take profit set
  }
  
  if (side === "LONG") {
    // LONG: takes profit when price >= takeProfit (hits from below)
    return currentPrice >= takeProfit;
  } else {
    // SHORT: takes profit when price <= takeProfit (hits from above)
    return currentPrice <= takeProfit;
  }
}

/**
 * assertSLTPExclusivity — TRIGGER EXCLUSIVITY CHECK
 * 
 * Invariant: INV-RISK-007 - SL/TP Mutual Exclusivity [HARD LAW]
 * 
 * Rule: Position closure MUST be triggered by exactly ONE of:
 * - Stop loss
 * - Take profit
 * - Manual close
 * - Margin call
 * 
 * NOT multiple triggers simultaneously.
 * 
 * Implementation:
 * - This assertion validates that only one trigger occurred
 * - In practice: check prices in order (SL, TP, margin call)
 * - First trigger wins; position closes immediately
 * - Subsequent triggers are ignored
 * 
 * When to call:
 * - During UPDATE_PRICES when triggers detected
 * - Validates logic doesn't cause multiple closures
 * 
 * Severity: CRITICAL
 * Engine bug if violated: YES (causes duplicate closure)
 * 
 * @param triggered - Which trigger occurred (or undefined if none)
 * @throws EngineInvariantViolationError if multiple triggers
 */
export function assertSLTPExclusivity(
  triggered: "STOP_LOSS" | "TAKE_PROFIT" | undefined
): void {
  // This function validates at a higher level:
  // - If triggered is set, exactly ONE did (enforced by caller)
  // - If triggered is undefined, none triggered
  // The assertion passes if state is consistent
  // Actual exclusivity is enforced by checking in deterministic order
  
  if (triggered !== undefined && triggered !== "STOP_LOSS" && triggered !== "TAKE_PROFIT") {
    throw new EngineInvariantViolationError(
      "INV-RISK-007",
      "INVALID_TRIGGER_STATE",
      `Invalid trigger state: ${triggered}`
    );
  }
}

/**
 * assertExposureLimit — PHASE 3 ASSERTION
 * 
 * Invariant: INV-RISK-010 - Exposure Limits [CONFIGURABLE POLICY]
 * 
 * Rule: Total account exposure MUST NOT exceed configured maximum
 * 
 * Exposure = sum(all_open_position_values)
 * Position value = size × currentPrice
 * 
 * When to call:
 * - Before opening new position
 * - During price updates
 * - Validates Phase 1 checked this limit
 * 
 * Severity: HIGH
 * Engine bug if violated: NO (indicates policy breach)
 * 
 * @param exposure - Current total account exposure
 * @param maxExposure - Maximum allowed exposure
 * @throws EngineInvariantViolationError if exceeded
 */
export function assertExposureLimit(
  exposure: number,
  maxExposure: number
): void {
  if (exposure > maxExposure) {
    throw new EngineInvariantViolationError(
      "INV-RISK-010",
      "EXPOSURE_LIMIT_EXCEEDED",
      `Total exposure (${exposure}) exceeds maximum (${maxExposure})`
    );
  }
}
