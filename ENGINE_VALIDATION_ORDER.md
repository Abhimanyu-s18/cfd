# CFD Trading Engine - Validation Order

**Version:** 1.0  
**Date:** February 5, 2026  
**Status:** FROZEN - This is engine law  
**Related Documents:** ENGINE_INVARIANTS.md, ENGINE_STATE_MAP.md, ENGINE_INTERFACE.md  

---

## DOCUMENT PURPOSE

This document defines the **immutable execution order** for processing every event type.

**Core Principle:**
> Order matters. Invariants must be checked in dependency order. First failure stops execution.

This is not an implementation detail. This is **engine law**.

---

## EXECUTION MODEL

For every event:

```
1. Parse event
2. Validate invariants (in order)
3. Calculate new state (if all validations pass)
4. Emit effects
5. Return result
```

**On first validation failure:**
- Stop immediately
- Return EngineFailure with error
- State unchanged
- No effects emitted

**On all validations pass:**
- Apply state changes atomically
- Emit effects
- Return EngineSuccess with new state

---

## VALIDATION ORDER BY EVENT TYPE

### 1. OpenPositionEvent

**Step 1: Entity Existence Validation**
```
Invariants: INV-DATA-001, INV-POS-003
Checks:
  - Account exists (accountId in state)
  - Market exists (marketId in state)
Error: ACCOUNT_NOT_FOUND | MARKET_NOT_FOUND
Stop: YES on failure
```

**Step 2: Position ID Uniqueness**
```
Invariants: INV-POS-002
Checks:
  - positionId is unique (not in any account.positions)
Error: DUPLICATE_POSITION_ID
Stop: YES on failure
```

**Step 3: Input Value Validation**
```
Invariants: INV-POS-005, INV-POS-006, INV-CALC-005
Checks:
  - size > 0
  - executionPrice > 0
  - leverage > 0
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 4: Stop Loss Logic Validation**
```
Invariants: INV-POS-007
Checks:
  - If stopLoss set:
    - For LONG: stopLoss < executionPrice
    - For SHORT: stopLoss > executionPrice
Error: INVALID_STOP_LOSS
Stop: YES on failure
```

**Step 5: Take Profit Logic Validation**
```
Invariants: INV-POS-008
Checks:
  - If takeProfit set:
    - For LONG: takeProfit > executionPrice
    - For SHORT: takeProfit < executionPrice
Error: INVALID_TAKE_PROFIT
Stop: YES on failure
```

**Step 6: Leverage Limit Validation**
```
Invariants: INV-FIN-009
Checks:
  - leverage <= market.maxLeverage (for market.assetClass)
Error: LEVERAGE_EXCEEDED
Stop: YES on failure
```

**Step 7: Position Size Limits Validation**
```
Invariants: INV-RISK-008, INV-RISK-009
Checks:
  - size >= market.minSize
  - size <= market.maxSize
Error: SIZE_BELOW_MINIMUM | SIZE_ABOVE_MAXIMUM
Stop: YES on failure
```

**Step 8: Account Status Validation**
```
Invariants: INV-STATE-003
Checks:
  - account.status = ACTIVE (not LIQUIDATION_ONLY or CLOSED)
Error: INVALID_ACCOUNT_STATUS
Stop: YES on failure
```

**Step 9: Position Count Limit Validation**
```
Invariants: INV-POS-009
Checks:
  - count(account.positions) < account.maxPositions
Error: POSITION_LIMIT_EXCEEDED
Stop: YES on failure
```

**Step 10: Margin Calculation**
```
Invariants: INV-FIN-010
Calculation:
  - marginRequired = (size × executionPrice) / leverage
Validates:
  - Calculation correctness
  - No division by zero (leverage > 0 already checked)
```

**Step 11: Current Equity Calculation**
```
Invariants: INV-FIN-002, INV-FIN-003, INV-FIN-004
Calculation:
  - currentEquity = balance + bonus + sum(position.unrealizedPnL for all open positions)
  - currentMarginUsed = sum(position.marginUsed for all open positions)
  - currentFreeMargin = currentEquity - currentMarginUsed
```

**Step 12: Margin Availability Validation**
```
Invariants: INV-FIN-004, INV-RISK-004
Checks:
  - marginRequired <= currentFreeMargin
  - After position: (currentMarginUsed + marginRequired) / currentEquity <= 0.80
Error: INSUFFICIENT_MARGIN
Stop: YES on failure
```

**Step 13: Total Exposure Validation**
```
Invariants: INV-RISK-010
Calculation:
  - currentExposure = sum(position.size × markPrice for all positions)
  - newExposure = currentExposure + (size × executionPrice)
Checks:
  - newExposure <= getMaxExposure(account.balance)
Error: EXPOSURE_LIMIT_EXCEEDED
Stop: YES on failure
```

**Step 14: Create Position**
```
State Changes:
  - Create new Position with:
    - positionId, accountId, marketId
    - side, size, entryPrice = executionPrice, leverage
    - stopLoss, takeProfit (if provided)
    - marginUsed = marginRequired
    - unrealizedPnL = 0 (just opened)
    - commissionFee
    - status = OPEN (or PENDING if orderType = LIMIT)
    - openedAt = timestamp
  - Add position to account.positions
```

**Step 15: Update Derived Account Fields**
```
Invariants: INV-FIN-002, INV-FIN-003, INV-FIN-004, INV-FIN-005, INV-STATE-001
Recalculate:
  - account.marginUsed = sum(position.marginUsed)
  - account.equity = balance + bonus + sum(position.unrealizedPnL)
  - account.freeMargin = equity - marginUsed
  - account.marginLevel = (equity / marginUsed) × 100 if marginUsed > 0
```

**Step 16: Emit Effects**
```
Effects:
  - PositionOpenedEffect
```

**Step 17: Return Success**
```
Return:
  - EngineSuccess with newState and effects
```

---

### 2. ClosePositionEvent

**Step 1: Entity Existence Validation**
```
Invariants: INV-DATA-001, INV-POS-003
Checks:
  - Account exists (accountId in state)
  - Position exists (positionId in account.positions)
Error: ACCOUNT_NOT_FOUND | POSITION_NOT_FOUND
Stop: YES on failure
```

**Step 2: Position Ownership Validation**
```
Invariants: INV-POS-003
Checks:
  - position.accountId = accountId (ownership match)
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 3: Position Status Validation**
```
Invariants: INV-POS-001
Checks:
  - position.status = OPEN (can only close open positions)
Error: POSITION_NOT_OPEN
Stop: YES on failure
```

**Step 4: Close Price Validation**
```
Invariants: INV-POS-011
Checks:
  - closePrice > 0
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 5: Temporal Ordering Validation**
```
Invariants: INV-DATA-003
Checks:
  - timestamp >= position.openedAt
Error: TEMPORAL_VIOLATION
Stop: YES on failure
```

**Step 6: Admin Close Validation**
```
Invariants: INV-POS-013
Checks:
  - If closedBy = ADMIN:
    - adminUserId IS NOT NULL
    - adminCloseComment IS NOT NULL
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 7: Calculate Raw P&L**
```
Invariants: INV-FIN-011, INV-FIN-012
Calculation:
  - If position.side = LONG:
    - rawPnL = (closePrice - position.entryPrice) × position.size
  - If position.side = SHORT:
    - rawPnL = (position.entryPrice - closePrice) × position.size
```

**Step 8: Calculate Net P&L**
```
Invariants: INV-FIN-014, INV-CALC-003
Calculation:
  - realizedPnL = rawPnL - position.commissionFee - swapFee
  - Round to 2 decimal places (banker's rounding)
```

**Step 9: Update Account Balance**
```
Invariants: INV-FIN-007, INV-FIN-008
Calculation:
  - newBalance = account.balance + realizedPnL
Checks:
  - newBalance >= 0 (INV-FIN-001)
Error: INSUFFICIENT_BALANCE (should not happen if margin management correct)
Stop: YES on failure
```

**Step 10: Update Position to CLOSED**
```
Invariants: INV-POS-001, INV-POS-004, INV-POS-012
State Changes:
  - position.status = CLOSED
  - position.closedPrice = closePrice
  - position.closedAt = timestamp
  - position.closedBy = closedBy
  - position.realizedPnL = realizedPnL
  - position.swapFee = swapFee
  - If closedBy = ADMIN:
    - position.adminUserId = adminUserId
    - position.adminCloseComment = adminCloseComment
Validation:
  - These fields now IMMUTABLE (INV-POS-004)
```

**Step 11: Release Margin**
```
State Changes:
  - position.marginUsed remains as-is (for history)
  - But no longer counted in account.marginUsed calculation
```

**Step 12: Update Derived Account Fields**
```
Invariants: INV-FIN-002, INV-FIN-003, INV-FIN-004, INV-FIN-005, INV-STATE-001
Recalculate:
  - account.balance = newBalance
  - account.marginUsed = sum(position.marginUsed for OPEN positions only)
  - account.equity = balance + bonus + sum(position.unrealizedPnL for OPEN positions)
  - account.freeMargin = equity - marginUsed
  - account.marginLevel = (equity / marginUsed) × 100 if marginUsed > 0
```

**Step 13: Emit Effects**
```
Effects:
  - PositionClosedEffect
  - BalanceChangedEffect
```

**Step 14: Return Success**
```
Return:
  - EngineSuccess with newState and effects
```

---

### 3. UpdatePricesEvent

**Critical: Two-Phase Execution**

UpdatePricesEvent follows a strict two-phase pattern to maintain atomicity:

**Phase A - Dry Run (Steps 1-9):**
- Update market prices
- Recalculate all unrealized P&L
- Detect all SL/TP triggers
- Detect all margin calls
- Detect all stop outs
- Determine complete closure set
- NO state mutations except price updates

**Phase B - Commit (Steps 10-13):**
- Execute all position closures
- Update all account balances
- Recalculate all derived fields
- Emit all effects

**Atomicity Guarantee:** If Phase A completes successfully, Phase B executes completely. No partial closures.

---

**Step 1: Price Validity Validation**
```
Invariants: INV-DATA-004
Checks:
  - For each price update:
    - marketId exists in state
    - markPrice > 0
Error: MARKET_NOT_FOUND | INVALID_EVENT
Stop: YES on failure
```

**Step 2: Update Market Prices**
```
State Changes:
  - For each price in event.prices:
    - market.markPrice = markPrice
```

**Step 3: Recalculate Unrealized P&L for All Open Positions**
```
Invariants: INV-FIN-011, INV-FIN-012, INV-FIN-013
For each OPEN position:
  - Get market.markPrice for position.marketId
  - If position.side = LONG:
    - position.unrealizedPnL = (markPrice - position.entryPrice) × position.size
  - If position.side = SHORT:
    - position.unrealizedPnL = (position.entryPrice - markPrice) × position.size
```

**Step 4: Recalculate Account Equity for All Accounts**
```
Invariants: INV-FIN-002, INV-STATE-001
For each account with positions:
  - account.equity = balance + bonus + sum(position.unrealizedPnL for OPEN positions)
```

**Step 5: Recalculate Margin Levels**
```
Invariants: INV-FIN-005, INV-STATE-001
For each account with positions:
  - If account.marginUsed > 0:
    - account.marginLevel = (account.equity / account.marginUsed) × 100
  - Else:
    - account.marginLevel = null
```

**Step 6: Detect Stop Loss Triggers (Dry Run)**
```
Invariants: INV-RISK-005
For each OPEN position with stopLoss set:
  - Get market.markPrice for position.marketId
  - If position.side = LONG AND markPrice <= position.stopLoss:
    - Mark position for closure
    - closePrice = position.stopLoss
    - closedBy = STOP_LOSS
  - If position.side = SHORT AND markPrice >= position.stopLoss:
    - Mark position for closure
    - closePrice = position.stopLoss
    - closedBy = STOP_LOSS

Note: Positions are marked, not closed yet. Actual closure happens in Step 10.
```

**Step 7: Detect Take Profit Triggers (Dry Run)**
```
Invariants: INV-RISK-006
For each OPEN position with takeProfit set (and not already marked by SL):
  - Get market.markPrice for position.marketId
  - If position.side = LONG AND markPrice >= position.takeProfit:
    - Mark position for closure
    - closePrice = position.takeProfit
    - closedBy = TAKE_PROFIT
  - If position.side = SHORT AND markPrice <= position.takeProfit:
    - Mark position for closure
    - closePrice = position.takeProfit
    - closedBy = TAKE_PROFIT

Note: Positions are marked, not closed yet. Actual closure happens in Step 10.
```

**Step 8: Detect Margin Call Triggers (Dry Run)**
```
Invariants: INV-RISK-001
For each account:
  - Calculate hypothetical marginLevel (after SL/TP closes but before execution)
  - If marginLevel < 50%:
    - Mark account for margin call warning
```

**Step 9: Detect Stop Out Triggers (Dry Run)**
```
Invariants: INV-RISK-002, INV-RISK-003
For each account:
  - Calculate hypothetical marginLevel (after SL/TP closes)
  - If marginLevel < 20%:
    - Sort account.positions by unrealizedPnL (ascending = most losing first)
    - Determine which positions must close to reach marginLevel >= 20%
    - Mark positions for closure with:
      - closePrice = current markPrice
      - closedBy = MARGIN_CALL
    - Mark account for stop out

Note: All closures are determined but not yet executed.
```

**Step 10: Execute All Position Closures (Commit Phase)**
```
For each position marked for closure (from Steps 6, 7, 9):
  - Execute CLOSE POSITION TRANSITION LOGIC inline:
    
    A. Calculate Raw P&L (INV-FIN-011, INV-FIN-012):
       - If position.side = LONG:
         - rawPnL = (closePrice - position.entryPrice) × position.size
       - If position.side = SHORT:
         - rawPnL = (position.entryPrice - closePrice) × position.size
    
    B. Calculate Net P&L (INV-FIN-014, INV-CALC-003):
       - realizedPnL = rawPnL - position.commissionFee - (swapFee if applicable)
       - Round to 2 decimal places (banker's rounding)
    
    C. Update Account Balance (INV-FIN-007, INV-FIN-008):
       - newBalance = account.balance + realizedPnL
       - Validate: newBalance >= 0 (INV-FIN-001)
       - account.balance = newBalance
    
    D. Update Position to CLOSED (INV-POS-001, INV-POS-004, INV-POS-012):
       - position.status = CLOSED
       - position.closedPrice = closePrice
       - position.closedAt = event.timestamp
       - position.closedBy = closedBy
       - position.realizedPnL = realizedPnL
       - These fields now IMMUTABLE

Note: This inline execution follows ClosePositionEvent steps 7-12 without 
re-entering processEvent. No event nesting occurs.
```

**Step 11: Final Account State Recalculation (Post-Commit)**
```
Invariants: INV-STATE-001
For all accounts affected by closures:
  - Recalculate all derived fields:
    - account.marginUsed = sum(position.marginUsed for OPEN positions only)
    - account.equity = balance + bonus + sum(position.unrealizedPnL for OPEN positions)
    - account.freeMargin = equity - marginUsed
    - account.marginLevel = (equity / marginUsed) × 100 if marginUsed > 0
```

**Step 12: Emit Effects (In Order)**
```
Effects emitted in strict order:
  1. PositionClosedEffect (one per closed position, in closure order)
  2. BalanceChangedEffect (one per account with balance change)
  3. MarginCallEffect (one per account marked for margin call)
  4. StopOutEffect (one per account marked for stop out, includes closed position IDs)

Effect Rules:
  - For any single EngineEvent, each Position emits at most one PositionClosedEffect
  - Effects are emitted in the order listed above
  - No duplicate effects for the same entity in single event
```

**Step 13: Return Success**
```
Return:
  - EngineSuccess with newState and effects
```

---

### 4. AddFundsEvent

**Step 1: Entity Existence Validation**
```
Checks:
  - Account exists (accountId in state)
Error: ACCOUNT_NOT_FOUND
Stop: YES on failure
```

**Step 2: Amount Validation**
```
Invariants: INV-FIN-008
Checks:
  - amount > 0
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 3: Admin Metadata Validation**
```
Checks:
  - adminUserId IS NOT NULL
  - reason IS NOT NULL
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 4: Update Account Balance**
```
Invariants: INV-FIN-001, INV-FIN-008
Calculation:
  - newBalance = account.balance + amount
Checks:
  - newBalance >= 0 (always true for addition)
State Changes:
  - account.balance = newBalance
```

**Step 5: Update Derived Account Fields**
```
Invariants: INV-FIN-002, INV-FIN-004, INV-STATE-001
Recalculate:
  - account.equity = balance + bonus + sum(position.unrealizedPnL)
  - account.freeMargin = equity - marginUsed
  - account.marginLevel = (equity / marginUsed) × 100 if marginUsed > 0
```

**Step 6: Emit Effects**
```
Effects:
  - BalanceChangedEffect
```

**Step 7: Return Success**
```
Return:
  - EngineSuccess with newState and effects
```

---

### 5. RemoveFundsEvent

**Step 1: Entity Existence Validation**
```
Checks:
  - Account exists (accountId in state)
Error: ACCOUNT_NOT_FOUND
Stop: YES on failure
```

**Step 2: Amount Validation**
```
Invariants: INV-FIN-008
Checks:
  - amount > 0
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 3: Admin Metadata Validation**
```
Checks:
  - adminUserId IS NOT NULL
  - reason IS NOT NULL
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 4: Balance Sufficiency Validation**
```
Invariants: INV-FIN-001, INV-FIN-008
Checks:
  - amount <= account.balance
  - (account.balance - amount) >= 0
Error: INSUFFICIENT_BALANCE
Stop: YES on failure
```

**Step 5: Update Account Balance**
```
Invariants: INV-FIN-001, INV-FIN-008
Calculation:
  - newBalance = account.balance - amount
State Changes:
  - account.balance = newBalance
```

**Step 6: Update Derived Account Fields**
```
Invariants: INV-FIN-002, INV-FIN-004, INV-STATE-001
Recalculate:
  - account.equity = balance + bonus + sum(position.unrealizedPnL)
  - account.freeMargin = equity - marginUsed
  - account.marginLevel = (equity / marginUsed) × 100 if marginUsed > 0
```

**Step 7: Emit Effects**
```
Effects:
  - BalanceChangedEffect
```

**Step 8: Return Success**
```
Return:
  - EngineSuccess with newState and effects
```

---

### 6. AddBonusEvent

**Step 1: Entity Existence Validation**
```
Checks:
  - Account exists (accountId in state)
Error: ACCOUNT_NOT_FOUND
Stop: YES on failure
```

**Step 2: Amount Validation**
```
Invariants: INV-FIN-006
Checks:
  - amount > 0
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 3: Admin Metadata Validation**
```
Checks:
  - adminUserId IS NOT NULL
  - reason IS NOT NULL
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 4: Update Account Bonus**
```
Invariants: INV-FIN-006
Calculation:
  - newBonus = account.bonus + amount
Checks:
  - newBonus >= 0 (always true for addition)
State Changes:
  - account.bonus = newBonus
```

**Step 5: Update Derived Account Fields**
```
Invariants: INV-FIN-002, INV-FIN-004, INV-STATE-001
Recalculate:
  - account.equity = balance + bonus + sum(position.unrealizedPnL)
  - account.freeMargin = equity - marginUsed
  - account.marginLevel = (equity / marginUsed) × 100 if marginUsed > 0
```

**Step 6: Emit Effects**
```
Effects:
  - (No specific effect, or generic AccountUpdatedEffect)
```

**Step 7: Return Success**
```
Return:
  - EngineSuccess with newState and effects
```

---

### 7. RemoveBonusEvent

**Step 1: Entity Existence Validation**
```
Checks:
  - Account exists (accountId in state)
Error: ACCOUNT_NOT_FOUND
Stop: YES on failure
```

**Step 2: Amount Validation**
```
Invariants: INV-FIN-006
Checks:
  - amount > 0
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 3: Admin Metadata Validation**
```
Checks:
  - adminUserId IS NOT NULL
  - reason IS NOT NULL
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 4: Bonus Sufficiency Validation**
```
Invariants: INV-FIN-006
Checks:
  - amount <= account.bonus
  - (account.bonus - amount) >= 0
Error: INSUFFICIENT_BALANCE
Stop: YES on failure
```

**Step 5: Update Account Bonus**
```
Invariants: INV-FIN-006
Calculation:
  - newBonus = account.bonus - amount
State Changes:
  - account.bonus = newBonus
```

**Step 6: Update Derived Account Fields**
```
Invariants: INV-FIN-002, INV-FIN-004, INV-STATE-001
Recalculate:
  - account.equity = balance + bonus + sum(position.unrealizedPnL)
  - account.freeMargin = equity - marginUsed
  - account.marginLevel = (equity / marginUsed) × 100 if marginUsed > 0
```

**Step 7: Emit Effects**
```
Effects:
  - (No specific effect, or generic AccountUpdatedEffect)
```

**Step 8: Return Success**
```
Return:
  - EngineSuccess with newState and effects
```

---

### 8. SetStopLossEvent

**Step 1: Entity Existence Validation**
```
Invariants: INV-POS-003
Checks:
  - Account exists (accountId in state)
  - Position exists (positionId in account.positions)
Error: ACCOUNT_NOT_FOUND | POSITION_NOT_FOUND
Stop: YES on failure
```

**Step 2: Position Ownership Validation**
```
Invariants: INV-POS-003
Checks:
  - position.accountId = accountId
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 3: Position Status Validation**
```
Invariants: INV-POS-001
Checks:
  - position.status = OPEN
Error: POSITION_NOT_OPEN
Stop: YES on failure
```

**Step 4: Stop Loss Logic Validation**
```
Invariants: INV-POS-007
Checks:
  - If stopLoss IS NOT NULL:
    - If position.side = LONG: stopLoss < position.entryPrice
    - If position.side = SHORT: stopLoss > position.entryPrice
Error: INVALID_STOP_LOSS
Stop: YES on failure
```

**Step 5: Update Position Stop Loss**
```
State Changes:
  - position.stopLoss = stopLoss (or null to remove)
```

**Step 6: Return Success**
```
Return:
  - EngineSuccess with newState
  - No effects (silent update)
```

---

### 9. SetTakeProfitEvent

**Step 1: Entity Existence Validation**
```
Invariants: INV-POS-003
Checks:
  - Account exists (accountId in state)
  - Position exists (positionId in account.positions)
Error: ACCOUNT_NOT_FOUND | POSITION_NOT_FOUND
Stop: YES on failure
```

**Step 2: Position Ownership Validation**
```
Invariants: INV-POS-003
Checks:
  - position.accountId = accountId
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 3: Position Status Validation**
```
Invariants: INV-POS-001
Checks:
  - position.status = OPEN
Error: POSITION_NOT_OPEN
Stop: YES on failure
```

**Step 4: Take Profit Logic Validation**
```
Invariants: INV-POS-008
Checks:
  - If takeProfit IS NOT NULL:
    - If position.side = LONG: takeProfit > position.entryPrice
    - If position.side = SHORT: takeProfit < position.entryPrice
Error: INVALID_TAKE_PROFIT
Stop: YES on failure
```

**Step 5: Update Position Take Profit**
```
State Changes:
  - position.takeProfit = takeProfit (or null to remove)
```

**Step 6: Return Success**
```
Return:
  - EngineSuccess with newState
  - No effects (silent update)
```

---

### 10. CancelPendingPositionEvent

**Step 1: Entity Existence Validation**
```
Invariants: INV-POS-003
Checks:
  - Account exists (accountId in state)
  - Position exists (positionId in account.positions)
Error: ACCOUNT_NOT_FOUND | POSITION_NOT_FOUND
Stop: YES on failure
```

**Step 2: Position Ownership Validation**
```
Invariants: INV-POS-003
Checks:
  - position.accountId = accountId
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 3: Position Status Validation**
```
Invariants: INV-POS-001
Checks:
  - position.status = PENDING
Error: POSITION_NOT_PENDING
Stop: YES on failure
```

**Step 4: Remove Position from State**
```
State Changes:
  - Remove position entirely from account.positions
  - Position no longer exists in engine state

Note: PENDING positions that are cancelled are removed entirely, not marked 
as CANCELLED. They never entered OPEN state, so no historical record needed.
```

**Step 5: Release Margin**
```
Invariants: INV-FIN-003
Note:
  - Margin was reserved for pending position
  - Now released
```

**Step 6: Update Derived Account Fields**
```
Invariants: INV-FIN-003, INV-FIN-004, INV-STATE-001
Recalculate:
  - account.marginUsed = sum(position.marginUsed for OPEN positions)
  - account.freeMargin = equity - marginUsed
  - account.marginLevel = (equity / marginUsed) × 100 if marginUsed > 0
```

**Step 7: Return Success**
```
Return:
  - EngineSuccess with newState
  - No specific effect
```

---

### 11. UpdateAccountStatusEvent

**Step 1: Entity Existence Validation**
```
Checks:
  - Account exists (accountId in state)
Error: ACCOUNT_NOT_FOUND
Stop: YES on failure
```

**Step 2: Status Transition Validation**
```
Invariants: INV-STATE-002
Checks:
  - Status transition is valid:
    - ACTIVE → LIQUIDATION_ONLY (allowed)
    - ACTIVE → CLOSED (allowed)
    - LIQUIDATION_ONLY → CLOSED (allowed)
    - CLOSED → * (not allowed)
    - * → ACTIVE (may have restrictions)
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 3: Admin Metadata Validation**
```
Checks:
  - adminUserId IS NOT NULL
  - reason IS NOT NULL
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 4: Update Account Status**
```
State Changes:
  - account.status = status
```

**Step 5: Return Success**
```
Return:
  - EngineSuccess with newState
  - No specific effect
```

---

### 12. UpdateAccountPoliciesEvent

**Step 1: Entity Existence Validation**
```
Checks:
  - Account exists (accountId in state)
Error: ACCOUNT_NOT_FOUND
Stop: YES on failure
```

**Step 2: Policy Value Validation**
```
Invariants: INV-POS-009
Checks:
  - If maxPositions provided: maxPositions > 0
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 3: Admin Metadata Validation**
```
Checks:
  - adminUserId IS NOT NULL
  - reason IS NOT NULL
Error: INVALID_EVENT
Stop: YES on failure
```

**Step 4: Update Account Policies**
```
State Changes:
  - If maxPositions provided:
    - account.maxPositions = maxPositions
```

**Step 5: Return Success**
```
Return:
  - EngineSuccess with newState
  - No specific effect
```

---

## DERIVED FIELD RECALCULATION ORDER

When any event modifies state, derived fields MUST be recalculated in this order:

**Order 1: Position-level derivations**
```
For each modified position:
  1. position.unrealizedPnL (from markPrice, entryPrice, size, side)
  2. position.marginUsed (from size, entryPrice, leverage)
```

**Order 2: Account-level derivations (depends on Order 1)**
```
For each account with modified positions:
  1. account.marginUsed = sum(position.marginUsed for OPEN positions)
  2. account.equity = balance + bonus + sum(position.unrealizedPnL for OPEN positions)
  3. account.freeMargin = equity - marginUsed
  4. account.marginLevel = (equity / marginUsed) × 100 if marginUsed > 0
```

**Dependency chain:**
```
markPrice → unrealizedPnL → equity → freeMargin
                         ↓
                    marginLevel
```

**Critical:**
- Never calculate freeMargin before equity
- Never calculate marginLevel before equity and marginUsed
- Never use stale derived values in calculations

---

## VALIDATION FAILURE HANDLING

**On any validation failure:**

1. **Stop immediately** - Do not proceed to next step
2. **Preserve state** - No state mutations
3. **Return EngineFailure** with:
   - Appropriate error code
   - Error message
   - Invariant ID (if invariant violation)
   - Relevant details (position ID, account ID, etc.)
4. **No effects emitted** - Clean failure

**Example:**
```typescript
// Step 5 fails (stop loss validation)
return {
  success: false,
  error: {
    code: 'INVALID_STOP_LOSS',
    message: 'Stop loss must be below entry price for LONG positions',
    invariantId: 'INV-POS-007',
    details: {
      positionId: event.positionId,
      side: 'LONG',
      entryPrice: 1.0850,
      stopLoss: 1.0900
    }
  }
}
```

---

## VALIDATION ORDER PRINCIPLES

**1. Fail Fast**
- Cheapest checks first
- Existence before logic
- Input validation before calculation

**2. Dependency Respect**
- Check prerequisites before dependents
- Never check derived value before its source

**3. Atomic Guarantees**
- All validations pass OR none apply
- No partial state changes

**4. Clear Errors**
- First failure reported
- Subsequent failures not checked (fail fast)

**5. Invariant Grouping**
- Related invariants checked together
- Logical flow preserved

---

## IMMUTABILITY GUARANTEES

**These orders are FROZEN.**

Changes require:
1. New invariant addition
2. State map update
3. Interface update
4. Complete re-audit

**Why frozen:**
- Validation order affects correctness
- Bugs hide in order changes
- Tests assume this order
- Proofs depend on this order

---

## TESTING VALIDATION ORDER

**For each event type:**

```typescript
describe('OpenPositionEvent Validation Order', () => {
  it('Step 1: Rejects if account does not exist', () => {
    const result = processEvent(state, eventWithInvalidAccount)
    expect(result.success).toBe(false)
    expect(result.error.code).toBe('ACCOUNT_NOT_FOUND')
  })
  
  it('Step 2: Rejects duplicate position ID', () => {
    const result = processEvent(state, eventWithDuplicateId)
    expect(result.success).toBe(false)
    expect(result.error.code).toBe('DUPLICATE_POSITION_ID')
  })
  
  it('Step 4: Rejects invalid stop loss before checking margin', () => {
    // Invalid SL but sufficient margin
    const result = processEvent(state, eventWithInvalidSL)
    expect(result.error.code).toBe('INVALID_STOP_LOSS')
    // Never reached margin check
  })
  
  // ... test each step's failure mode
})
```

---

## CONCLUSION

This validation order is **engine law**.

**Properties guaranteed:**
- Deterministic execution
- Fail-fast behavior
- Clear error reporting
- Atomic state changes
- Dependency-respecting order

**Every event follows:**
1. Validate existence
2. Validate ownership/permissions
3. Validate input values
4. Validate business logic
5. Calculate new state
6. Emit effects
7. Return success

**First failure stops the chain.**
**All validations pass or nothing changes.**

This is not negotiable. This is not flexible. This is the law.

---

**DOCUMENT STATUS:** FROZEN  
**AUTHORITY:** Defines engine execution law

---

**END OF VALIDATION ORDER**
