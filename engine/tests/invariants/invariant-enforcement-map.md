# Invariant → Enforcement Map (Option G)

Status: DRAFT

Purpose: For each engine invariant, the single authoritative enforcement location is listed so blame is unambiguous.

Format:

```
Invariant ID
→ Enforcement file + function
→ Golden Path(s) that prove it
→ Events that can violate it
```

---

## Financial Invariants

### INV-FIN-001: Account Balance Non-Negativity
→ `validation/validateAccount.ts` → `validateBalanceNonNegative()`
→ GP-3 (stop-out / liquidation)
→ Events: `CLOSE_POSITION`, `REMOVE_FUNDS`, `UPDATE_PRICES` (via realized PnL)

### INV-FIN-002: Equity Calculation Integrity
→ Derived calculation in `domain/calculations/margin.ts` (recalculate per event) + `domain/invariants/financial.ts` → `assertEquityConsistent()`
→ GP-1, GP-2, GP-3
→ Events: `OPEN_POSITION`, `CLOSE_POSITION`, `UPDATE_PRICES`, `ADD_BONUS`, `REMOVE_BONUS`

### INV-FIN-003: Margin Used Accuracy
→ Derived summation in execution (recalculation) with `domain/calculations/margin.ts` → `calculateMarginRequired()` and `domain/invariants/financial.ts` → `assertMarginConsistency()`
→ GP-1..GP-3
→ Events: `OPEN_POSITION`, `CLOSE_POSITION`, `UPDATE_PRICES`

### INV-FIN-004: Free Margin Derivation
→ `domain/calculations/margin.ts` → `calculateFreeMargin()`; validated in `validation/validateRisk.ts` → `validateMarginAvailability()`
→ GP-1, GP-3
→ Events: `OPEN_POSITION`, `UPDATE_PRICES`, `CLOSE_POSITION`

### INV-FIN-005: Margin Level Calculation
→ `domain/calculations/margin.ts` → `calculateMarginLevel()`; assertions in `domain/invariants/financial.ts`
→ GP-3
→ Events: `OPEN_POSITION`, `UPDATE_PRICES`, `CLOSE_POSITION`

### INV-FIN-006: Bonus Separation (policy)
→ `domain/invariants/financial.ts` (policy assertions) and `validation/validateAccount.ts` where applicable
→ GP test coverage: policy tests (post-Option G)
→ Events: `ADD_BONUS`, `REMOVE_BONUS`, `REMOVE_FUNDS`

### INV-FIN-007: Realized P&L Finality
→ Execution: `execution/closePosition.ts` applies realized PnL to balance (single enforcement); immutability enforced by `state/PositionState.ts` shape and `domain/invariants/financial.ts` → `assertEquityConsistent()`
→ GP-1, GP-2
→ Events: `CLOSE_POSITION`

### INV-FIN-008: Transaction Balance Consistency
→ `domain/invariants/financial.ts` → `assertTransactionConsistency()` (hooked by persistence/effects)
→ GP audit scenarios
→ Events: Any that create a transaction (`ADD_FUNDS`, `REMOVE_FUNDS`, `CLOSE_POSITION`)

### INV-FIN-009: Leverage Limits by Asset Class
→ `validation/validateRisk.ts` → `validateLeverageLimit()`
→ GP: leverage-related tests
→ Events: `OPEN_POSITION`

### INV-FIN-010: Margin Calculation Correctness
→ `domain/calculations/margin.ts` → `calculateMarginRequired()` (single source)
→ GP-1..GP-3
→ Events: `OPEN_POSITION`, `UPDATE_PRICES` (recalc on price change)

### INV-FIN-011: Unrealized P&L (Long)
→ `domain/calculations/pnl.ts` → `calculateUnrealizedPnL()` (LONG branch)
→ GP-1
→ Events: `UPDATE_PRICES`, `OPEN_POSITION`

### INV-FIN-012: Unrealized P&L (Short)
→ `domain/calculations/pnl.ts` → `calculateUnrealizedPnL()` (SHORT branch)
→ GP-2
→ Events: `UPDATE_PRICES`, `OPEN_POSITION`

### INV-FIN-013: P&L Symmetry
→ `domain/invariants/financial.ts` assertions referencing `calculateUnrealizedPnL()`
→ GP cross-checks
→ Events: `OPEN_POSITION`, `UPDATE_PRICES`, `CLOSE_POSITION`

### INV-FIN-014: Fee Accumulation
→ `domain/calculations/fees.ts` and `domain/calculations/pnl.ts` → `calculateRealizedPnL()`
→ GP-1, GP-2
→ Events: `CLOSE_POSITION`, `OPEN_POSITION` (commission reserved)

---

## Position Invariants

### INV-POS-001: Position Status Progression
→ `domain/invariants/position.ts` → `assertStatusProgression()` (single enforcement)
→ GP sequences for state transitions
→ Events: `OPEN_POSITION`, `CLOSE_POSITION`, `CANCEL_PENDING_POSITION`, admin closes

### INV-POS-002: Position Uniqueness (ID)
→ `validation/validatePosition.ts` → `validatePositionIdUnique()`
→ GP: all position creation tests
→ Events: `OPEN_POSITION`

### INV-POS-003: Position Ownership
→ `validation/validatePosition.ts` → `validatePositionOwnership()`
→ Events: `CLOSE_POSITION`, `SET_STOP_LOSS`, `SET_TAKE_PROFIT`, `CANCEL_PENDING_POSITION`

### INV-POS-004: Immutability After Close
→ Enforced by `state/PositionState.ts` readonly fields + `domain/invariants/position.ts`
→ Events: attempts to mutate closed positions (must be rejected)

### INV-POS-005: Size > 0
→ `validation/validatePosition.ts` → `validatePositionSize()`
→ Events: `OPEN_POSITION`

### INV-POS-006: Entry Price > 0
→ `validation/validatePosition.ts` → `validateEntryPrice()`
→ Events: `OPEN_POSITION`, `CLOSE_POSITION`

### INV-POS-007: Stop Loss Logic
→ `validation/validatePosition.ts` → `validateStopLossLogic()` and `domain/invariants/position.ts` → `assertStopLossLogic()`
→ GP-2
→ Events: `OPEN_POSITION`, `SET_STOP_LOSS`, `UPDATE_PRICES`

### INV-POS-008: Take Profit Logic
→ `validation/validatePosition.ts` → `validateTakeProfitLogic()` and `domain/invariants/position.ts` → `assertTakeProfitLogic()`
→ GP-1
→ Events: `OPEN_POSITION`, `SET_TAKE_PROFIT`, `UPDATE_PRICES`

### INV-POS-009: Position Count Limit
→ `validation/validatePosition.ts` → `validatePositionCountLimit()`
→ Events: `OPEN_POSITION`, `UPDATE_ACCOUNT_POLICIES`

### INV-POS-010: Asset Class Consistency
→ `validation/validatePosition.ts` (market lookups) and `state/PositionState.ts` mapping
→ Events: `OPEN_POSITION`

### INV-POS-011: Close Price > 0
→ `validation/validatePosition.ts` and close flow
→ Events: `CLOSE_POSITION`

### INV-POS-012: Close Reason Traceability
→ `state/PositionState.ts` closedBy field + `effects/audit.ts` audit effect
→ Events: `CLOSE_POSITION`, auto closes via `UPDATE_PRICES` or `marginEnforcement`

### INV-POS-013: Admin Close Validation
→ `validation/validatePosition.ts` (admin metadata checks)
→ Events: `CLOSE_POSITION` with closedBy=ADMIN

---

## Risk Invariants

### INV-RISK-004: Margin Level Risk Check
→ `domain/invariants/risk.ts` → `assertMarginLevelSafe()` and `validation/validateRisk.ts` → `validateMarginLevel()`
→ GP-3
→ Events: `OPEN_POSITION`, `UPDATE_PRICES`

### INV-RISK-005 / INV-RISK-006: SL / TP Triggers
→ `domain/invariants/risk.ts` → `assertStopLossTrigger()` / `assertTakeProfitTrigger()`
→ GP-1, GP-2
→ Events: `UPDATE_PRICES`

### INV-RISK-007: SL/TP Mutual Exclusivity
→ `domain/invariants/risk.ts` → `assertSLTPExclusivity()`
→ Events: `UPDATE_PRICES` (concurrent triggers)

### INV-RISK-008 / INV-RISK-009: Position Size Limits
→ `validation/validateRisk.ts` → `validatePositionMinSize()` / `validatePositionMaxSize()`
→ Events: `OPEN_POSITION`

### INV-RISK-010: Exposure Limits
→ `validation/validateRisk.ts` → `validateExposure()`
→ Events: `OPEN_POSITION`, `UPDATE_PRICES`

---

## State & Data Invariants

### INV-STATE-001: Account State Consistency
→ `domain/invariants/state.ts` → `assertStateConsistency()`
→ Events: All events that mutate state

### INV-STATE-002: Status Transitions Valid
→ `domain/invariants/state.ts` → `assertStatusTransition()`
→ Events: `UPDATE_ACCOUNT_STATUS`, `marginEnforcement`

### INV-STATE-003: Account Status Constraints
→ `validation/validateAccount.ts` → `validateAccountActive()`
→ Events: `OPEN_POSITION`, `ADD_FUNDS`, `REMOVE_FUNDS`

### INV-DATA-001: Entity Existence
→ `validation/validateAccount.ts` → `validateAccountExists()` and `validation/validatePosition.ts` helpers
→ Events: All events referencing entities

### INV-DATA-002: Transaction Traceability
→ `effects/audit.ts` + `effects/persistence.ts` usage
→ Events: `CLOSE_POSITION`, `OPEN_POSITION`, funds events

### INV-DATA-003: Temporal Ordering
→ `domain/invariants/state.ts` → `assertTemporalOrdering()`
→ Events: `CLOSE_POSITION`, `UPDATE_PRICES` (timestamps)

### INV-DATA-004: Price Validity
→ `validation/validateRisk.ts` → `validateMarketPrice()`
→ Events: `UPDATE_PRICES`, `OPEN_POSITION` (executionPrice)

### INV-DATA-005: Precision (2 decimals)
→ `domain/calculations/rounding.ts` → `bankersRound()` and `formatCurrency()`
→ Events: Any event causing money math

---

## Notes

- This file is the authoritative mapping for Option G. If you need a stricter per-line mapping (file+line+function), we will add code links once domain functions are implemented.
- Next step: produce a machine-readable CSV/JSON mapping and cross-link to `engine/tests/goldenPaths/*` specifications.
