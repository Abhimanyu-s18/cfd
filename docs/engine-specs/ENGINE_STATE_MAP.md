# CFD Trading Engine - State Map

**Version:** 1.0  
**Date:** February 5, 2026  
**Status:** FROZEN - Changes require invariant review  
**Related Documents:** ENGINE_INVARIANTS.md  

---

## DOCUMENT PURPOSE

This document maps every engine invariant to the exact state fields responsible for satisfying it.

**Core Rule:**
> Every invariant must map to at least one engine state field. If an invariant cannot be mapped, it is not implementable.

**State Ownership:**
> Each state field has clear invariants protecting it. Each invariant has clear state fields implementing it.

---

## CANONICAL ENGINE STATE (v1)

```
EngineState
├── accounts: Map<AccountId, Account>
├── markets: Map<MarketId, Market>
```

### Account
```
Account
├── accountId
├── balance
├── bonus
├── equity (derived)
├── marginUsed (derived)
├── freeMargin (derived)
├── marginLevel (derived)
├── positions: Map<PositionId, Position>
├── status (ACTIVE | LIQUIDATION_ONLY | CLOSED)
├── maxPositions (policy)
```

### Position
```
Position
├── positionId
├── accountId
├── marketId
├── side (LONG | SHORT)
├── size
├── entryPrice
├── leverage
├── stopLoss?
├── takeProfit?
├── unrealizedPnL (derived)
├── realizedPnL
├── marginUsed (derived)
├── commissionFee
├── swapFee
├── status (PENDING | OPEN | CLOSED)
├── closedBy? (USER | ADMIN | STOP_LOSS | TAKE_PROFIT | MARGIN_CALL)
├── openedAt
├── closedAt?
├── closedPrice?
├── adminUserId?
├── adminCloseComment?
```

### Market
```
Market
├── marketId
├── symbol
├── assetClass
├── markPrice
├── minSize (policy)
├── maxSize (policy)
├── maxLeverage (policy)
```

> 🔒 **Derived fields** are recalculated every event.  
> 🔒 **Stored fields** are immutable unless explicitly changed by an event.  
> 🔒 **Policy fields** are configuration that constrains behavior.

---

## INVARIANT TO STATE MAPPING

### 1. FINANCIAL INVARIANTS

#### INV-FIN-001: Account Balance Non-Negativity [HARD LAW]

**State Fields:**
- Account.balance

**Nature:**
- VALIDATES (balance >= 0)

---

#### INV-FIN-002: Equity Calculation Integrity [HARD LAW]

**State Fields:**
- Account.equity
- Account.balance
- Account.bonus
- Position.unrealizedPnL

**Nature:**
- DERIVES (equity = balance + bonus + sum(unrealizedPnL))
- VALIDATES (calculation correctness)

---

#### INV-FIN-003: Margin Used Accuracy [HARD LAW]

**State Fields:**
- Account.marginUsed
- Position.marginUsed

**Nature:**
- DERIVES (marginUsed = sum(position.marginUsed))
- VALIDATES (summation correctness)

---

#### INV-FIN-004: Free Margin Derivation [HARD LAW]

**State Fields:**
- Account.freeMargin
- Account.equity
- Account.marginUsed

**Nature:**
- DERIVES (freeMargin = equity - marginUsed)
- VALIDATES (calculation correctness)

---

#### INV-FIN-005: Margin Level Calculation [HARD LAW]

**State Fields:**
- Account.marginLevel
- Account.equity
- Account.marginUsed

**Nature:**
- DERIVES (marginLevel = (equity / marginUsed) × 100)
- VALIDATES (division by zero handling)

---

#### INV-FIN-006: Bonus Separation [CONFIGURABLE POLICY]

**State Fields:**
- Account.bonus

**Nature:**
- VALIDATES (bonus >= 0)
- CONSTRAINS (bonus not withdrawable but used in equity)

---

#### INV-FIN-007: Realized P&L Finality [HARD LAW]

**State Fields:**
- Position.realizedPnL
- Position.status
- Account.balance

**Nature:**
- CONSTRAINS (realizedPnL immutable when status = CLOSED)
- VALIDATES (balance updated on close)

---

#### INV-FIN-008: Transaction Balance Consistency [HARD LAW]

**State Fields:**
- Account.balance

**Nature:**
- VALIDATES (balance transitions are consistent)

---

#### INV-FIN-009: Leverage Limits by Asset Class [CONFIGURABLE POLICY]

**State Fields:**
- Position.leverage
- Market.assetClass
- Market.maxLeverage

**Nature:**
- CONSTRAINS (leverage <= maxLeverage for asset class)
- VALIDATES (on position creation)

---

#### INV-FIN-010: Margin Calculation Correctness [HARD LAW]

**State Fields:**
- Position.marginUsed
- Position.size
- Position.entryPrice
- Position.leverage

**Nature:**
- DERIVES (marginUsed = (size × entryPrice) / leverage)
- VALIDATES (calculation correctness)

---

#### INV-FIN-011: Unrealized P&L Calculation (Long Position) [HARD LAW]

**State Fields:**
- Position.unrealizedPnL
- Position.side
- Position.size
- Position.entryPrice
- Market.markPrice

**Nature:**
- DERIVES (for LONG: unrealizedPnL = (markPrice - entryPrice) × size)
- VALIDATES (calculation correctness)

---

#### INV-FIN-012: Unrealized P&L Calculation (Short Position) [HARD LAW]

**State Fields:**
- Position.unrealizedPnL
- Position.side
- Position.size
- Position.entryPrice
- Market.markPrice

**Nature:**
- DERIVES (for SHORT: unrealizedPnL = (entryPrice - markPrice) × size)
- VALIDATES (calculation correctness)

---

#### INV-FIN-013: P&L Symmetry [HARD LAW]

**State Fields:**
- Position.unrealizedPnL
- Position.side
- Position.size
- Position.entryPrice
- Market.markPrice

**Nature:**
- VALIDATES (opposite positions have opposite P&L)

---

#### INV-FIN-014: Fee Accumulation [HARD LAW]

**State Fields:**
- Position.realizedPnL
- Position.commissionFee
- Position.swapFee

**Nature:**
- DERIVES (realizedPnL includes fee deductions)
- VALIDATES (fees reduce profit/increase loss)

---

### 2. POSITION STATE INVARIANTS

#### INV-POS-001: Position Status Progression [HARD LAW]

**State Fields:**
- Position.status

**Nature:**
- CONSTRAINS (valid state transitions only)
- VALIDATES (no backwards transitions)

---

#### INV-POS-002: Position Uniqueness [HARD LAW]

**State Fields:**
- Position.positionId

**Nature:**
- VALIDATES (unique ID, immutable)

---

#### INV-POS-003: Position Ownership [HARD LAW]

**State Fields:**
- Position.accountId
- Account.accountId

**Nature:**
- VALIDATES (accountId references valid Account)
- CONSTRAINS (orphaned positions rejected)

---

#### INV-POS-004: Position Immutability After Close [HARD LAW]

**State Fields:**
- Position.status
- Position.entryPrice
- Position.size
- Position.realizedPnL
- Position.closedPrice
- Position.closedAt

**Nature:**
- CONSTRAINS (core fields immutable when status = CLOSED)
- VALIDATES (no modifications after close)

---

#### INV-POS-005: Positive Position Size [HARD LAW]

**State Fields:**
- Position.size

**Nature:**
- VALIDATES (size > 0)

---

#### INV-POS-006: Valid Entry Price [HARD LAW]

**State Fields:**
- Position.entryPrice

**Nature:**
- VALIDATES (entryPrice > 0)

---

#### INV-POS-007: Stop Loss Logic [HARD LAW]

**State Fields:**
- Position.stopLoss
- Position.side
- Position.entryPrice

**Nature:**
- VALIDATES (for LONG: stopLoss < entryPrice if set)
- VALIDATES (for SHORT: stopLoss > entryPrice if set)
- CONSTRAINS (reject invalid stop loss)

---

#### INV-POS-008: Take Profit Logic [HARD LAW]

**State Fields:**
- Position.takeProfit
- Position.side
- Position.entryPrice

**Nature:**
- VALIDATES (for LONG: takeProfit > entryPrice if set)
- VALIDATES (for SHORT: takeProfit < entryPrice if set)
- CONSTRAINS (reject invalid take profit)

---

#### INV-POS-009: Position Limit Enforcement [CONFIGURABLE POLICY]

**State Fields:**
- Account.positions
- Account.maxPositions

**Nature:**
- VALIDATES (count(positions) <= maxPositions)
- CONSTRAINS (reject new positions when limit reached)

---

#### INV-POS-010: Asset Class Consistency [HARD LAW]

**State Fields:**
- Position.marketId
- Market.marketId
- Market.assetClass

**Nature:**
- VALIDATES (position references valid market)
- VALIDATES (asset class consistency)

---

#### INV-POS-011: Close Price Validity [HARD LAW]

**State Fields:**
- Position.closedPrice
- Position.status

**Nature:**
- VALIDATES (closedPrice > 0 when status = CLOSED)

---

#### INV-POS-012: Close Reason Traceability [HARD LAW]

**State Fields:**
- Position.closedBy
- Position.status

**Nature:**
- VALIDATES (closedBy is set when status = CLOSED)
- CONSTRAINS (closedBy in valid enum values)

---

#### INV-POS-013: Admin Close Documentation [CONFIGURABLE POLICY]

**State Fields:**
- Position.closedBy
- Position.adminUserId
- Position.adminCloseComment

**Nature:**
- VALIDATES (if closedBy = ADMIN: adminUserId and adminCloseComment must be set)
- CONSTRAINS (audit requirements)

---

### 3. RISK LOGIC INVARIANTS

#### INV-RISK-001: Margin Call Threshold [CONFIGURABLE POLICY]

**State Fields:**
- Account.marginLevel
- Account.status

**Nature:**
- VALIDATES (marginLevel calculation)
- CONSTRAINS (warning state when marginLevel < 50%)

---

#### INV-RISK-002: Stop Out Threshold [CONFIGURABLE POLICY]

**State Fields:**
- Account.marginLevel
- Account.status

**Nature:**
- VALIDATES (marginLevel calculation)
- CONSTRAINS (liquidation triggered when marginLevel < 20%)

---

#### INV-RISK-003: Stop Out Priority Logic [HARD LAW]

**State Fields:**
- Position.unrealizedPnL
- Position.status
- Account.positions

**Nature:**
- CONSTRAINS (positions sorted by unrealizedPnL for liquidation order)
- VALIDATES (most losing closed first)

---

#### INV-RISK-004: Margin Utilization Limit [CONFIGURABLE POLICY]

**State Fields:**
- Account.marginUsed
- Account.equity

**Nature:**
- VALIDATES ((marginUsed / equity) <= 0.80)
- CONSTRAINS (reject new positions exceeding limit)

---

#### INV-RISK-005: Stop Loss Trigger Condition [HARD LAW]

**State Fields:**
- Position.stopLoss
- Position.side
- Market.markPrice

**Nature:**
- VALIDATES (trigger condition: for LONG: markPrice <= stopLoss)
- VALIDATES (trigger condition: for SHORT: markPrice >= stopLoss)
- CONSTRAINS (automatic position close on trigger)

---

#### INV-RISK-006: Take Profit Trigger Condition [HARD LAW]

**State Fields:**
- Position.takeProfit
- Position.side
- Market.markPrice

**Nature:**
- VALIDATES (trigger condition: for LONG: markPrice >= takeProfit)
- VALIDATES (trigger condition: for SHORT: markPrice <= takeProfit)
- CONSTRAINS (automatic position close on trigger)

---

#### INV-RISK-007: SL/TP Mutual Exclusivity [HARD LAW]

**State Fields:**
- Position.status
- Position.closedBy

**Nature:**
- CONSTRAINS (only one close trigger can execute)
- VALIDATES (status transitions to CLOSED only once)

---

#### INV-RISK-008: Minimum Position Size [CONFIGURABLE POLICY]

**State Fields:**
- Position.size
- Market.minSize

**Nature:**
- VALIDATES (size >= minSize)
- CONSTRAINS (reject undersized positions)

---

#### INV-RISK-009: Maximum Position Size [CONFIGURABLE POLICY]

**State Fields:**
- Position.size
- Market.maxSize

**Nature:**
- VALIDATES (size <= maxSize)
- CONSTRAINS (reject oversized positions)

---

#### INV-RISK-010: Maximum Total Exposure [CONFIGURABLE POLICY]

**State Fields:**
- Position.size
- Position.entryPrice
- Market.markPrice
- Account.balance
- Account.positions

**Nature:**
- DERIVES (total exposure = sum(position.size × markPrice))
- VALIDATES (total exposure within limits based on balance)
- CONSTRAINS (reject positions exceeding exposure limit)

---

### 4. STATE TRANSITION INVARIANTS

#### INV-STATE-001: Account State Consistency [HARD LAW]

**State Fields:**
- Account.equity
- Account.balance
- Account.bonus
- Account.marginUsed
- Account.freeMargin
- Account.marginLevel
- Position.unrealizedPnL
- Position.marginUsed

**Nature:**
- VALIDATES (all derived fields consistent with stored fields)
- DERIVES (equity, marginUsed, freeMargin, marginLevel)

---

#### INV-STATE-002: KYC Status Progression [HARD LAW]

**State Fields:**
- Account.status

**Nature:**
- CONSTRAINS (valid status transitions only)
- VALIDATES (state machine integrity)

---

#### INV-STATE-003: Account Status Trading Restrictions [CONFIGURABLE POLICY]

**State Fields:**
- Account.status

**Nature:**
- CONSTRAINS (if status = LIQUIDATION_ONLY or CLOSED: no new positions)
- VALIDATES (close operations always allowed)

---

### 5. CALCULATION INVARIANTS

#### INV-CALC-001: Division by Zero Protection [HARD LAW]

**State Fields:**
- Account.marginLevel
- Account.marginUsed
- Account.equity

**Nature:**
- VALIDATES (marginLevel calculation handles marginUsed = 0)
- CONSTRAINS (return null/infinity when divisor is zero)

---

#### INV-CALC-002: Rounding Consistency [HARD LAW]

**State Fields:**
- Account.balance
- Account.equity
- Position.unrealizedPnL
- Position.realizedPnL

**Nature:**
- VALIDATES (all financial values use banker's rounding)
- CONSTRAINS (consistent rounding across all calculations)

---

#### INV-CALC-003: P&L Calculation Order [HARD LAW]

**State Fields:**
- Position.realizedPnL
- Position.unrealizedPnL
- Position.commissionFee
- Position.swapFee

**Nature:**
- VALIDATES (calculation sequence: rawPnL → fees → netPnL → round)
- CONSTRAINS (order enforced to prevent precision errors)

---

#### INV-CALC-004: Simulated Spread [CONFIGURABLE POLICY]

**State Fields:**
- Position.entryPrice
- Market.markPrice

**Nature:**
- VALIDATES (entryPrice incorporates spread)
- CONSTRAINS (spread applied consistently)

---

#### INV-CALC-005: Execution Price Is Final [HARD LAW]

**State Fields:**
- Position.entryPrice

**Nature:**
- VALIDATES (entryPrice is immutable once set)
- CONSTRAINS (engine does not modify executionPrice)

---

### 6. DATA VALIDITY INVARIANTS

#### INV-DATA-001: Position Foreign Key Integrity [HARD LAW]

**State Fields:**
- Position.accountId
- Position.marketId
- Account.accountId
- Market.marketId

**Nature:**
- VALIDATES (accountId references valid Account)
- VALIDATES (marketId references valid Market)
- CONSTRAINS (reject orphaned positions)

---

#### INV-DATA-002: Transaction Traceability [HARD LAW]

**State Fields:**
- Account.balance
- Position.realizedPnL

**Nature:**
- VALIDATES (balance changes traceable to positions)
- CONSTRAINS (audit trail requirements)

---

#### INV-DATA-003: Temporal Ordering [HARD LAW]

**State Fields:**
- Position.openedAt
- Position.closedAt

**Nature:**
- VALIDATES (closedAt >= openedAt)
- CONSTRAINS (time flows forward)

**Note:** The engine does not assign timestamps; it only validates ordering of provided values.

---

#### INV-DATA-004: Price Precision [CONFIGURABLE POLICY]

**State Fields:**
- Market.markPrice
- Position.entryPrice
- Position.closedPrice

**Nature:**
- VALIDATES (prices have sufficient decimal precision)
- CONSTRAINS (precision requirements by asset class)

---

#### INV-DATA-005: Financial Value Precision [HARD LAW]

**State Fields:**
- Account.balance
- Account.bonus
- Account.equity
- Position.realizedPnL
- Position.unrealizedPnL

**Nature:**
- VALIDATES (all financial values use adequate precision)
- CONSTRAINS (exactly 2 decimal places for currency values)

---

## STATE FIELD TO INVARIANT REVERSE MAP

### Account Fields

| Field | Protected By Invariants |
|---|---|
| accountId | INV-POS-003, INV-DATA-001 |
| balance | INV-FIN-001, INV-FIN-002, INV-FIN-007, INV-FIN-008, INV-DATA-005 |
| bonus | INV-FIN-002, INV-FIN-006, INV-DATA-005 |
| equity | INV-FIN-002, INV-FIN-004, INV-FIN-005, INV-RISK-004, INV-STATE-001, INV-CALC-001 |
| marginUsed | INV-FIN-003, INV-FIN-004, INV-FIN-005, INV-RISK-004, INV-STATE-001, INV-CALC-001 |
| freeMargin | INV-FIN-004, INV-STATE-001 |
| marginLevel | INV-FIN-005, INV-RISK-001, INV-RISK-002, INV-STATE-001, INV-CALC-001 |
| positions | INV-FIN-003, INV-POS-009, INV-RISK-003, INV-RISK-010, INV-STATE-001 |
| status | INV-RISK-001, INV-RISK-002, INV-STATE-002, INV-STATE-003 |
| maxPositions | INV-POS-009 |

### Position Fields

| Field | Protected By Invariants |
|---|---|
| positionId | INV-POS-002 |
| accountId | INV-POS-003, INV-DATA-001 |
| marketId | INV-POS-010, INV-DATA-001 |
| side | INV-FIN-011, INV-FIN-012, INV-FIN-013, INV-POS-007, INV-POS-008, INV-RISK-005, INV-RISK-006 |
| size | INV-FIN-010, INV-FIN-011, INV-FIN-012, INV-FIN-013, INV-POS-005, INV-RISK-008, INV-RISK-009, INV-RISK-010 |
| entryPrice | INV-FIN-010, INV-FIN-011, INV-FIN-012, INV-FIN-013, INV-POS-004, INV-POS-006, INV-POS-007, INV-POS-008, INV-CALC-004, INV-CALC-005, INV-DATA-004 |
| leverage | INV-FIN-009, INV-FIN-010 |
| stopLoss | INV-POS-007, INV-RISK-005 |
| takeProfit | INV-POS-008, INV-RISK-006 |
| unrealizedPnL | INV-FIN-002, INV-FIN-011, INV-FIN-012, INV-FIN-013, INV-RISK-003, INV-CALC-003, INV-STATE-001, INV-DATA-005 |
| realizedPnL | INV-FIN-007, INV-FIN-014, INV-POS-004, INV-DATA-002, INV-CALC-003, INV-DATA-005 |
| marginUsed | INV-FIN-003, INV-FIN-010, INV-STATE-001 |
| commissionFee | INV-FIN-014, INV-CALC-003 |
| swapFee | INV-FIN-014, INV-CALC-003 |
| status | INV-FIN-007, INV-POS-001, INV-POS-004, INV-POS-011, INV-POS-012, INV-RISK-007 |
| closedBy | INV-POS-012, INV-POS-013, INV-RISK-007 |
| openedAt | INV-POS-004, INV-DATA-003 |
| closedAt | INV-POS-004, INV-DATA-003 |
| closedPrice | INV-POS-004, INV-POS-011, INV-DATA-004 |
| adminUserId | INV-POS-013 |
| adminCloseComment | INV-POS-013 |

### Market Fields

| Field | Protected By Invariants |
|---|---|
| marketId | INV-POS-010, INV-DATA-001 |
| symbol | INV-POS-010 |
| assetClass | INV-FIN-009, INV-POS-010 |
| markPrice | INV-FIN-011, INV-FIN-012, INV-FIN-013, INV-RISK-005, INV-RISK-006, INV-RISK-010, INV-CALC-004, INV-DATA-004 |
| minSize | INV-RISK-008 |
| maxSize | INV-RISK-009 |
| maxLeverage | INV-FIN-009 |

---

## COMPLETENESS VERIFICATION

### All Invariants Mapped
✅ Section 1 - Financial Invariants (14): All mapped  
✅ Section 2 - Position State Invariants (13): All mapped  
✅ Section 3 - Risk Logic Invariants (10): All mapped  
✅ Section 4 - State Transition Invariants (3): All mapped  
✅ Section 5 - Calculation Invariants (5): All mapped  
✅ Section 6 - Data Validity Invariants (5): All mapped  

**Total: 50 invariants mapped**

### All State Fields Protected
✅ Every Account field has protecting invariants  
✅ Every Position field has protecting invariants  
✅ Every Market field has protecting invariants  

### No Ambiguity
✅ No invariants reference "system", "API", "job", "cache"  
✅ No state fields without invariants  
✅ No invariants without state fields  

---

## VALIDATION CHECKLIST

**Can you answer these for any state field?**

✅ "Which invariants protect this field?" → YES (reverse map provided)  
✅ "Which fields implement this invariant?" → YES (forward map provided)  
✅ "Is this field derived or stored?" → YES (marked in state schema)  
✅ "What happens if this invariant is violated?" → YES (nature specified)  

---

## WHAT THIS ENABLES

With this mapping complete, we can now:

1. **Auto-generate validation order** - Invariants checked in dependency order
2. **Auto-generate test skeletons** - One test per invariant-field mapping
3. **Freeze engine interface** - State model is now immutable
4. **Detect illegal code** - Any code touching unmapped fields is wrong
5. **Build confidently** - Every piece of state has a purpose

---

## NEXT STEPS

This document is now the **contract between invariants and implementation**.

No code may be written that:
- Adds state fields not listed here
- Modifies state without checking relevant invariants
- Violates the derived/stored distinction

---

**DOCUMENT STATUS:** COMPLETE  
**AUTHORITY:** Implements ENGINE_INVARIANTS.md in state model

---

**END OF ENGINE STATE MAP**
