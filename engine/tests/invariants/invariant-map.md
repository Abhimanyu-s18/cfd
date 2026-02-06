# Invariant-to-Code Mapping

**Status:** FROZEN - Reference only  
**Purpose:** Track which code location(s) enforce which invariants

---

This mapping ensures every invariant has exactly one enforcement location.

## Financial Invariants

| Invariant | File | Function | Type |
|---|---|---|---|
| INV-FIN-001 | validation/validateAccount.ts | validateBalanceNonNegative() | Guard |
| INV-FIN-002 | domain/calculations/ | (recalculated on every event) | Derived |
| INV-FIN-003 | domain/calculations/ | (recalculated on every event) | Derived |
| INV-FIN-004 | domain/calculations/margin.ts | calculateFreeMargin() | Calculation |
| INV-FIN-005 | domain/calculations/margin.ts | calculateMarginLevel() | Calculation |
| INV-FIN-006 | domain/invariants/financial.ts | (validation in wallet logic) | Policy |
| INV-FIN-007 | execution/closePosition.ts | (balance update on close) | Execution |
| INV-FIN-008 | domain/invariants/financial.ts | assertTransactionConsistency() | Assertion |
| INV-FIN-009 | validation/validateRisk.ts | validateLeverageLimit() | Guard |
| INV-FIN-010 | domain/calculations/margin.ts | calculateMarginRequired() | Calculation |
| INV-FIN-011 | domain/calculations/pnl.ts | calculateUnrealizedPnL() | Calculation |
| INV-FIN-012 | domain/calculations/pnl.ts | calculateUnrealizedPnL() | Calculation |
| INV-FIN-013 | domain/invariants/financial.ts | (tested in GP-1 vs GP-2) | Logic |
| INV-FIN-014 | domain/calculations/pnl.ts | calculateRealizedPnL() | Calculation |

## Position Invariants

| Invariant | File | Function | Type |
|---|---|---|---|
| INV-POS-001 | domain/invariants/position.ts | assertStatusProgression() | Assertion |
| INV-POS-002 | validation/validatePosition.ts | validatePositionIdUnique() | Guard |
| INV-POS-003 | validation/validatePosition.ts | validatePositionOwnership() | Guard |
| INV-POS-004 | domain/invariants/position.ts | (immutable after close) | State |
| INV-POS-005 | validation/validatePosition.ts | validatePositionSize() | Guard |
| INV-POS-006 | validation/validatePosition.ts | validateEntryPrice() | Guard |
| INV-POS-007 | validation/validatePosition.ts | validateStopLossLogic() | Guard |
| INV-POS-008 | validation/validatePosition.ts | validateTakeProfitLogic() | Guard |
| INV-POS-009 | validation/validatePosition.ts | validatePositionCountLimit() | Guard |
| INV-POS-010 | state/PositionState.ts | (marketId reference) | Data |
| INV-POS-011 | validation/validatePosition.ts | (closePrice > 0) | Guard |
| INV-POS-012 | state/PositionState.ts | closedBy field | Data |
| INV-POS-013 | validation/validatePosition.ts | (admin metadata validation) | Guard |

## Risk Invariants

| Invariant | File | Function | Type |
|---|---|---|---|
| INV-RISK-004 | domain/invariants/risk.ts | assertMarginLevelSafe() | Assertion |
| INV-RISK-005 | domain/invariants/risk.ts | assertStopLossTrigger() | Assertion |
| INV-RISK-006 | domain/invariants/risk.ts | assertTakeProfitTrigger() | Assertion |
| INV-RISK-007 | domain/invariants/risk.ts | assertSLTPExclusivity() | Assertion |
| INV-RISK-008 | validation/validateRisk.ts | validatePositionMinSize() | Guard |
| INV-RISK-009 | validation/validateRisk.ts | validatePositionMaxSize() | Guard |
| INV-RISK-010 | validation/validateRisk.ts | validateExposure() | Guard |

## State Invariants

| Invariant | File | Function | Type |
|---|---|---|---|
| INV-STATE-001 | domain/invariants/state.ts | assertStateConsistency() | Assertion |
| INV-STATE-002 | domain/invariants/state.ts | assertStatusTransition() | Assertion |
| INV-STATE-003 | validation/validateAccount.ts | validateAccountActive() | Guard |

## Data Invariants

| Invariant | File | Function | Type |
|---|---|---|---|
| INV-DATA-001 | validation/validateAccount.ts | validateAccountExists() | Guard |
| INV-DATA-002 | effects/audit.ts | (all effects include reference) | Effect |
| INV-DATA-003 | domain/invariants/state.ts | assertTemporalOrdering() | Assertion |
| INV-DATA-004 | validation/validateRisk.ts | validateMarketPrice() | Guard |
| INV-DATA-005 | domain/calculations/rounding.ts | formatCurrency() | Utility |

---

## Legend

- **Guard** — Validation layer throws if violated
- **Assertion** — Domain function asserts correctness
- **Calculation** — Math function produces correct result
- **Derived** — Recalculated on every event
- **Execution** — Enforced during execution
- **State** — Enforced by state structure
- **Policy** — Configuration rule
- **Data** — Enforced by data structure
- **Logic** — Enforced by algorithm
- **Effect** — Enforced in effect metadata
- **Utility** — Helper function
