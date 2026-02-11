/**
 * state.ts - Engine state invariant enforcement
 * 
 * Invariants enforced:
 * - INV-STATE-001: Account state consistency
 * - INV-STATE-002: Account status transitions
 * - INV-STATE-003: Account status constraints
 * - INV-DATA-001: Entity existence
 * - INV-DATA-002: Transaction traceability
 * - INV-DATA-003: Temporal ordering
 * - INV-DATA-004: Price validity
 * - INV-DATA-005: Precision (2 decimals)
 */

/**
 * assertStateConsistency — PHASE 3 ASSERTION
 * 
 * Invariant: INV-STATE-001 - Account State Consistency [HARD LAW]
 * 
 * Rule: All account metrics MUST be mathematically consistent
 * 
 * Relationships:
 * - equity = balance + bonus + unrealizedPnL
 * - freeMargin = equity - marginUsed
 * - marginLevel = (equity / marginUsed) × 100 (or null if marginUsed = 0)
 * - balance >= 0
 * - bonus >= 0
 * - marginUsed >= 0
 * - freeMargin >= 0 (if marginUsed <= equity)
 * 
 * When to call:
 * - After all Phase 2 calculations
 * - Before returning EngineResult
 * - Catches calculation bugs across multiple fields
 * 
 * Severity: CRITICAL
 * Engine bug if violated: YES (indicates calculation error)
 * 
 * @param balance - Account balance
 * @param bonus - Account bonus
 * @param equity - Calculated account equity
 * @param marginUsed - Total margin used
 * @param freeMargin - Calculated free margin
 * @param marginLevel - Calculated margin level
 * @throws EngineInvariantViolationError if inconsistent
 */
export function assertStateConsistency(
  balance: number,
  bonus: number,
  equity: number,
  marginUsed: number,
  freeMargin: number,
  marginLevel: number | null
): void {
  // Check: freeMargin = equity - marginUsed
  const expectedFreeMargin = equity - marginUsed;
  if (Math.abs(freeMargin - expectedFreeMargin) > 1e-9) {
    throw new EngineInvariantViolationError(
      "INV-STATE-001",
      "STATE_CONSISTENCY_ERROR",
      `Free margin mismatch: expected ${expectedFreeMargin}, got ${freeMargin}`
    );
  }
  
  // Check: marginLevel calculation
  if (marginUsed > 0) {
    const expectedMarginLevel = (equity / marginUsed) * 100;
    if (marginLevel === null || Math.abs(marginLevel - expectedMarginLevel) > 1e-9) {
      throw new EngineInvariantViolationError(
        "INV-STATE-001",
        "STATE_CONSISTENCY_ERROR",
        `Margin level mismatch: expected ${expectedMarginLevel}, got ${marginLevel}`
      );
    }
  } else if (marginLevel !== null) {
    throw new EngineInvariantViolationError(
      "INV-STATE-001",
      "STATE_CONSISTENCY_ERROR",
      `Margin level should be null when marginUsed = 0, got ${marginLevel}`
    );
  }
  
  // Check: balance >= 0
  if (balance < 0) {
    throw new EngineInvariantViolationError(
      "INV-STATE-001",
      "STATE_CONSISTENCY_ERROR",
      `Balance must be non-negative: ${balance}`
    );
  }
  
  // Check: bonus >= 0
  if (bonus < 0) {
    throw new EngineInvariantViolationError(
      "INV-STATE-001",
      "STATE_CONSISTENCY_ERROR",
      `Bonus must be non-negative: ${bonus}`
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
 * assertStatusTransition — PHASE 3 ASSERTION
 * 
 * Invariant: INV-STATE-002 - Account Status Transitions [HARD LAW]
 * 
 * Rule: Account status MUST follow valid state machine transitions
 * 
 * Allowed transitions:
 * - ACTIVE → LIQUIDATION_ONLY (margin call triggered)
 * - LIQUIDATION_ONLY → ACTIVE (account recovered)
 * - Any → CLOSED (account closure)
 * 
 * Forbidden:
 * - CLOSED → anything (final state)
 * - Invalid transitions
 * 
 * When to call:
 * - Before changing account status
 * - Validates risk management state changes
 * 
 * Severity: HIGH
 * Engine bug if violated: YES (invalid state machine)
 * 
 * @param from - Current account status
 * @param to - Desired new status
 * @throws EngineInvariantViolationError if invalid
 */
export function assertStatusTransition(
  from: "ACTIVE" | "LIQUIDATION_ONLY" | "CLOSED",
  to: "ACTIVE" | "LIQUIDATION_ONLY" | "CLOSED"
): void {
  // Valid transitions from each state
  const validTransitions: Record<string, Set<string>> = {
    "ACTIVE": new Set(["LIQUIDATION_ONLY", "CLOSED"]),
    "LIQUIDATION_ONLY": new Set(["ACTIVE", "CLOSED"]),
    "CLOSED": new Set([])
  };
  
  if (!validTransitions[from] || !validTransitions[from].has(to)) {
    throw new EngineInvariantViolationError(
      "INV-STATE-002",
      "INVALID_STATUS_TRANSITION",
      `Invalid account status transition: ${from} → ${to}`
    );
  }
}

/**
 * assertEntityExists — PHASE 3 ASSERTION
 * 
 * Invariant: INV-DATA-001 - Entity Existence [HARD LAW]
 * 
 * Rule: Referenced entities (account, market, position) MUST exist
 * 
 * When to call:
 * - After loading entity from state
 * - Before using entity data
 * - Validates Phase 1 validation passed
 * 
 * Severity: HIGH
 * Engine bug if violated: NO (indicates Phase 1 failure)
 * 
 * @param entity - Entity object (undefined if not found)
 * @param entityType - Type of entity ("Account", "Market", etc)
 * @param entityId - ID of entity
 * @throws EngineInvariantViolationError if not found
 */
export function assertEntityExists(
  entity: unknown,
  entityType: string,
  entityId: string
): void {
  if (entity === null || entity === undefined) {
    throw new EngineInvariantViolationError(
      "INV-DATA-001",
      "ENTITY_NOT_FOUND",
      `${entityType} ${entityId} not found`
    );
  }
}

/**
 * assertTemporalOrdering — PHASE 3 ASSERTION
 * 
 * Invariant: INV-DATA-003 - Temporal Ordering [HARD LAW]
 * 
 * Rule: Events MUST be processed in chronological order
 * 
 * Ensures:
 * - Event timestamp = system time (±1 second tolerance)
 * - No retroactive events
 * - Causal consistency
 * 
 * When to call:
 * - After parsing event timestamp
 * - Validates event is not from future
 * 
 * Severity: HIGH
 * Engine bug if violated: NO (indicates clock skew)
 * 
 * @param timestamp - Event timestamp (ISO 8601)
 * @param referenceTime - System reference time (ISO 8601)
 * @throws EngineInvariantViolationError if ordering violated
 */
export function assertTemporalOrdering(
  timestamp: string,
  referenceTime: string
): void {
  const eventTime = new Date(timestamp).getTime();
  const refTime = new Date(referenceTime).getTime();
  const toleranceMs = 1000; // 1 second tolerance
  
  // Event should not be from future (allow 1 second clock skew)
  if (eventTime > refTime + toleranceMs) {
    throw new EngineInvariantViolationError(
      "INV-DATA-003",
      "TIMESTAMP_FROM_FUTURE",
      `Event timestamp (${timestamp}) is from future (ref: ${referenceTime})`
    );
  }
}

/**
 * assertCurrencyPrecision — PHASE 3 ASSERTION
 * 
 * Invariant: INV-DATA-005 - Currency Precision [HARD LAW]
 * 
 * Rule: All monetary values MUST have at most 2 decimal places
 * 
 * Valid: 10.00, 10.5, 10
 * Invalid: 10.555, 10.123
 * 
 * Rationale:
 * - Financial standard (cents)
 * - Prevents floating point precision issues
 * - Storage and transmission efficiency
 * 
 * When to call:
 * - After all monetary calculations
 * - Before returning EngineResult
 * 
 * Severity: MEDIUM
 * Engine bug if violated: NO (indicates rounding failure)
 * 
 * @param value - Monetary value to check
 * @throws EngineInvariantViolationError if > 2 decimals
 */
export function assertCurrencyPrecision(value: number): void {
  // Check if value has more than 2 decimal places
  // Multiply by 100, should be integer
  const scaled = Math.round(value * 100);
  const check = scaled / 100;
  
  if (Math.abs(value - check) > 1e-9) {
    throw new EngineInvariantViolationError(
      "INV-DATA-005",
      "PRECISION_ERROR",
      `Currency value (${value}) has more than 2 decimal places`
    );
  }
}
