/**
 * position.ts - Position state invariant enforcement
 * 
 * Invariants enforced:
 * - INV-POS-001: Status progression
 * - INV-POS-002: ID uniqueness
 * - INV-POS-003: Ownership validation
 * - INV-POS-004: Immutability after close
 * - INV-POS-005: Size > 0
 * - INV-POS-006: Entry price > 0
 * - INV-POS-007: Stop loss logic
 * - INV-POS-008: Take profit logic
 * - INV-POS-009: Position count limit
 * - INV-POS-010: Asset class consistency
 * - INV-POS-011: Close price > 0
 * - INV-POS-012: Close reason traceability
 * - INV-POS-013: Admin close validation
 */

/**
 * assertStatusProgression — PHASE 3 ASSERTION
 * 
 * Invariant: INV-POS-001 - Position Status Progression [HARD LAW]
 * 
 * Rule: Position status MUST follow strict state machine transitions
 * 
 * Allowed transitions:
 * - PENDING → OPEN (limit triggered)
 * - PENDING → CANCELLED (user cancellation)
 * - OPEN → CLOSED (any close method)
 * 
 * Forbidden transitions:
 * - CLOSED → anything (final state)
 * - OPEN → PENDING (impossible)
 * - PENDING → CLOSED (must go through OPEN or CANCELLED)
 * - Random changes
 * 
 * Rationale:
 * - Positions have a defined lifecycle
 * - Backwards transitions indicate errors
 * - Final state (CLOSED) cannot be reversed
 * 
 * When to call:
 * - Before changing position status
 * - Validates Phase 4 state mutation is valid
 * 
 * Severity: CRITICAL
 * Engine bug if violated: YES (invalid state machine)
 * 
 * @param from - Current status
 * @param to - Desired new status
 * @throws EngineInvariantViolationError if transition invalid
 */
export function assertStatusProgression(
  from: "PENDING" | "OPEN" | "CLOSED",
  to: "PENDING" | "OPEN" | "CLOSED"
): void {
  // Valid transitions from each state
  const validTransitions: Record<string, Set<string>> = {
    "PENDING": new Set(["OPEN", "CANCELLED"]),
    "OPEN": new Set(["CLOSED"]),
    "CLOSED": new Set([])
  };
  
  if (!validTransitions[from] || !validTransitions[from].has(to)) {
    throw new EngineInvariantViolationError(
      "INV-POS-001",
      "INVALID_STATUS_TRANSITION",
      `Invalid status transition: ${from} → ${to}`
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
 * assertStopLossLogic — PHASE 3 ASSERTION
 * 
 * Invariant: INV-POS-007 - Stop Loss Logic [HARD LAW]
 * 
 * Rule: Stop loss MUST be on the losing side of entry price
 * 
 * For LONG positions:
 *   stopLoss < entryPrice (below entry)
 * 
 * For SHORT positions:
 *   stopLoss > entryPrice (above entry)
 * 
 * Rationale:
 * - Stop loss is for limiting losses, not locking profits
 * - Setting SL on winning side enables accidental profit-taking
 * - Prevents configuration errors in Phase 1
 * 
 * When to call:
 * - During position opening if stopLoss is set
 * - Before returning EngineResult
 * 
 * Severity: CRITICAL
 * Engine bug if violated: NO (indicates Phase 1 validation failure)
 * 
 * @param side - Position direction (LONG or SHORT)
 * @param entryPrice - Entry price
 * @param stopLoss - Stop loss price
 * @throws EngineInvariantViolationError if logic violated
 */
export function assertStopLossLogic(
  side: "LONG" | "SHORT",
  entryPrice: number,
  stopLoss: number
): void {
  if (side === "LONG" && stopLoss >= entryPrice) {
    throw new EngineInvariantViolationError(
      "INV-POS-007",
      "INVALID_STOP_LOSS",
      `LONG position: stopLoss (${stopLoss}) must be < entryPrice (${entryPrice})`
    );
  }
  if (side === "SHORT" && stopLoss <= entryPrice) {
    throw new EngineInvariantViolationError(
      "INV-POS-007",
      "INVALID_STOP_LOSS",
      `SHORT position: stopLoss (${stopLoss}) must be > entryPrice (${entryPrice})`
    );
  }
}

/**
 * assertTakeProfitLogic — PHASE 3 ASSERTION
 * 
 * Invariant: INV-POS-008 - Take Profit Logic [HARD LAW]
 * 
 * Rule: Take profit MUST be on the winning side of entry price
 * 
 * For LONG positions:
 *   takeProfit > entryPrice (above entry)
 * 
 * For SHORT positions:
 *   takeProfit < entryPrice (below entry)
 * 
 * Rationale:
 * - Take profit is for locking gains
 * - Setting TP on losing side makes no sense
 * - Prevents configuration errors in Phase 1
 * 
 * When to call:
 * - During position opening if takeProfit is set
 * - Before returning EngineResult
 * 
 * Severity: CRITICAL
 * Engine bug if violated: NO (indicates Phase 1 validation failure)
 * 
 * @param side - Position direction (LONG or SHORT)
 * @param entryPrice - Entry price
 * @param takeProfit - Take profit price
 * @throws EngineInvariantViolationError if logic violated
 */
export function assertTakeProfitLogic(
  side: "LONG" | "SHORT",
  entryPrice: number,
  takeProfit: number
): void {
  if (side === "LONG" && takeProfit <= entryPrice) {
    throw new EngineInvariantViolationError(
      "INV-POS-008",
      "INVALID_TAKE_PROFIT",
      `LONG position: takeProfit (${takeProfit}) must be > entryPrice (${entryPrice})`
    );
  }
  if (side === "SHORT" && takeProfit >= entryPrice) {
    throw new EngineInvariantViolationError(
      "INV-POS-008",
      "INVALID_TAKE_PROFIT",
      `SHORT position: takeProfit (${takeProfit}) must be < entryPrice (${entryPrice})`
    );
  }
}

/**
 * assertPositionCountLimit — PHASE 3 ASSERTION
 * 
 * Invariant: INV-POS-009 - Position Limit Enforcement [CONFIGURABLE POLICY]
 * 
 * Rule: count(openPositions) <= maxPositions
 * 
 * Rationale:
 * - Risk management (limits exposure)
 * - System resource protection
 * - Per-user configuration
 * 
 * When to call:
 * - Before opening a new position
 * - Validates Phase 1 checked this limit
 * 
 * Severity: HIGH
 * Engine bug if violated: NO (indicates Phase 1 validation failure)
 * 
 * @param currentCount - Current number of open positions
 * @param maxPositions - Maximum allowed open positions
 * @throws EngineInvariantViolationError if limit exceeded
 */
export function assertPositionCountLimit(
  currentCount: number,
  maxPositions: number
): void {
  if (currentCount > maxPositions) {
    throw new EngineInvariantViolationError(
      "INV-POS-009",
      "POSITION_LIMIT_EXCEEDED",
      `Position count (${currentCount}) exceeds maximum (${maxPositions})`
    );
  }
}

/**
 * assertAssetClassConsistency — PHASE 3 ASSERTION
 * 
 * Invariant: INV-POS-010 - Asset Class Consistency [HARD LAW]
 * 
 * Rule: Position's asset class MUST match its symbol's asset class
 * 
 * Prevents:
 * - Position on EURUSD (FOREX) using equity limits
 * - Mismatch between position config and market definition
 * 
 * When to call:
 * - During position opening
 * - Validates data consistency after Phase 1
 * 
 * Severity: HIGH
 * Engine bug if violated: NO (indicates data inconsistency)
 * 
 * @param marketAssetClass - Asset class from market definition
 * @param expectedAssetClass - Expected asset class for this position
 * @throws EngineInvariantViolationError if mismatch
 */
export function assertAssetClassConsistency(
  marketAssetClass: string,
  expectedAssetClass: string
): void {
  if (marketAssetClass !== expectedAssetClass) {
    throw new EngineInvariantViolationError(
      "INV-POS-010",
      "ASSET_CLASS_MISMATCH",
      `Asset class mismatch: market is ${marketAssetClass}, position expects ${expectedAssetClass}`
    );
  }
}
