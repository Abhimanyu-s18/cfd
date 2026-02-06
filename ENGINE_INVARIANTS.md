# CFD Trading Engine - Core Invariants

**Version:** 1.0  
**Date:** February 5, 2026  
**Status:** IMMUTABLE - Changes require formal review  
**Authority Level:** HIGHEST - Overrides all other specifications  

---

## DOCUMENT PURPOSE

> **"These invariants are timeless, deterministic, and environment-agnostic. They MUST hold regardless of infrastructure, timing, or delivery mechanisms."**

This document defines the **pure mathematical and logical rules** of the CFD trading engine. These rules would hold true even if the engine ran in a sealed box with no clock, no database, and no network.

**The Timeless Test:**
> "If this engine ran in a sealed box with no clock, no database, and no network — would this rule still make sense?"

If YES → it belongs here.  
If NO → it belongs in `SYSTEM_GUARANTEES.md`.

---

## INVARIANT CLASSIFICATION SYSTEM

Each invariant is tagged as:

- **[HARD LAW]** - Violating this breaks financial correctness. Never configurable.
- **[CONFIGURABLE POLICY]** - Can change per deployment, but must be enforced consistently once set.

---

## TABLE OF CONTENTS

1. [Financial Invariants](#1-financial-invariants)
2. [Position State Invariants](#2-position-state-invariants)
3. [Risk Logic Invariants](#3-risk-logic-invariants)
4. [State Transition Invariants](#4-state-transition-invariants)
5. [Calculation Invariants](#5-calculation-invariants)
6. [Data Validity Invariants](#6-data-validity-invariants)

---

## 1. FINANCIAL INVARIANTS

### 1.1 Core Financial Rules

#### INV-FIN-001: Account Balance Non-Negativity [HARD LAW]
**Rule:** Account balance (excluding unrealized P&L) MUST never be negative.

```
balance >= 0
```

**Rationale:** Paper trading cannot create debt. Negative balance implies a system error.

**Test:** `assert(account.balance >= 0)`

---

#### INV-FIN-002: Equity Calculation Integrity [HARD LAW]
**Rule:** Equity MUST always equal balance + bonus + unrealized P&L.

```
equity = balance + bonus + sum(all_open_positions.unrealizedPnL)
```

**Rationale:** Equity represents total account value including floating profit/loss.

**Test:** `assert(account.equity == account.balance + account.bonus + sumUnrealizedPnL())`

---

#### INV-FIN-003: Margin Used Accuracy [HARD LAW]
**Rule:** Used margin MUST equal the sum of all open positions' margin requirements.

```
usedMargin = sum(all_open_positions.marginUsed)
```

**Rationale:** Margin tracking must be precise for risk management.

**Test:** `assert(account.usedMargin == sumPositionMargins())`

---

#### INV-FIN-004: Free Margin Derivation [HARD LAW]
**Rule:** Free margin MUST equal equity minus used margin.

```
freeMargin = equity - usedMargin
```

**Rationale:** Free margin determines trading capacity.

**Test:** `assert(account.freeMargin == account.equity - account.usedMargin)`

---

#### INV-FIN-005: Margin Level Calculation [HARD LAW]
**Rule:** Margin level MUST equal (equity / used margin) × 100%.

```
if usedMargin > 0:
    marginLevel = (equity / usedMargin) × 100
else:
    marginLevel = ∞ (or NULL)
```

**Rationale:** Margin level triggers risk management actions.

**Test:** 
```
if (usedMargin > 0):
    assert(marginLevel == (equity / usedMargin) * 100)
else:
    assert(marginLevel == null or marginLevel == Infinity)
```

---

#### INV-FIN-006: Bonus Separation [CONFIGURABLE POLICY]
**Rule:** Bonus funds MUST remain separate from balance and can only be used for margin, not withdrawn.

```
bonus >= 0
bonus is available for margin calculation
bonus is NOT available for withdrawal
```

**Rationale:** Bonus is promotional credit, not user-owned funds.

**Test:** `assert(account.bonus >= 0)`

---

#### INV-FIN-007: Realized P&L Finality [HARD LAW]
**Rule:** Once a position is closed, its realized P&L MUST be immediately applied to balance and become immutable.

```
On position close:
    balance = balance + realizedPnL
    position.realizedPnL = FINAL (immutable)
```

**Rationale:** Closed trades are final; retroactive changes would violate audit integrity.

**Test:** `assert(closedPosition.realizedPnL is immutable)`

---

#### INV-FIN-008: Transaction Balance Consistency [HARD LAW]
**Rule:** For every transaction, balance_after MUST equal balance_before + amount.

```
transaction.balanceAfter = transaction.balanceBefore + transaction.amount
```

**Rationale:** Every fund movement must be traceable and consistent.

**Test:** `assert(tx.balanceAfter == tx.balanceBefore + tx.amount)`

---

### 1.2 Leverage Constraints

#### INV-FIN-009: Leverage Limits by Asset Class [CONFIGURABLE POLICY]
**Rule:** Leverage MUST NOT exceed maximum for each asset class.

```
Forex (Majors):       leverage <= 500
Forex (Crosses):      leverage <= 400
Commodities (Metals): leverage <= 100
Commodities (Energy): leverage <= 50
Commodities (Agri):   leverage <= 50
Indices:              leverage <= 200
Cryptocurrencies:     leverage <= 50
Stocks:               leverage <= 20
```

**Rationale:** Risk management and regulatory compliance.

**Test:** `assert(position.leverage <= getMaxLeverageForAssetClass(position.assetClass))`

---

#### INV-FIN-010: Margin Calculation Correctness [HARD LAW]
**Rule:** Required margin MUST equal (position size × entry price) / leverage.

```
marginRequired = (size × entryPrice) / leverage
```

**Rationale:** Core CFD calculation; errors here cascade to entire system.

**Test:** `assert(position.marginUsed == (position.size * position.entryPrice) / position.leverage)`

---

### 1.3 P&L Calculation Rules

#### INV-FIN-011: Unrealized P&L Calculation (Long Position) [HARD LAW]
**Rule:** For BUY positions, unrealized P&L = (current price - entry price) × size.

```
For BUY positions:
    unrealizedPnL = (currentPrice - entryPrice) × size
```

**Rationale:** Standard CFD profit calculation for long positions.

**Test:** `assert(buyPosition.unrealizedPnL == (currentPrice - buyPosition.entryPrice) * buyPosition.size)`

---

#### INV-FIN-012: Unrealized P&L Calculation (Short Position) [HARD LAW]
**Rule:** For SELL positions, unrealized P&L = (entry price - current price) × size.

```
For SELL positions:
    unrealizedPnL = (entryPrice - currentPrice) × size
```

**Rationale:** Standard CFD profit calculation for short positions.

**Test:** `assert(sellPosition.unrealizedPnL == (sellPosition.entryPrice - currentPrice) * sellPosition.size)`

---

#### INV-FIN-013: P&L Symmetry [HARD LAW]
**Rule:** A BUY and SELL position of equal size at the same price MUST have equal and opposite P&L.

```
If:
    position1: BUY size S at price P1, current price P2
    position2: SELL size S at price P1, current price P2
Then:
    position1.unrealizedPnL = -(position2.unrealizedPnL)
```

**Rationale:** Mathematical correctness; opposite positions have opposite P&L.

**Test:** `assert(buyPos.unrealizedPnL == -(sellPos.unrealizedPnL))`

---

#### INV-FIN-014: Fee Accumulation [HARD LAW]
**Rule:** Total fees (swap + commission) MUST be subtracted from realized P&L.

```
realizedPnL = rawPnL - swapFee - commissionFee
```

**Rationale:** Fees are real costs that reduce profit.

**Test:** `assert(position.realizedPnL == rawPnL - position.swapFee - position.commissionFee)`

---

## 2. POSITION STATE INVARIANTS

### 2.1 Position Lifecycle

#### INV-POS-001: Position Status Progression [HARD LAW]
**Rule:** Position status MUST follow this strict sequence.

```
Status transitions allowed:
    NULL → PENDING (limit orders)
    NULL → OPEN (market orders)
    PENDING → OPEN (limit triggered)
    PENDING → CANCELLED (user cancellation)
    OPEN → CLOSED (any close method)

Status transitions FORBIDDEN:
    CLOSED → anything (final state)
    OPEN → PENDING (impossible)
    PENDING → CLOSED (must go through OPEN or CANCELLED)
```

**Rationale:** Positions have a defined lifecycle; backwards transitions indicate errors.

**Test:** Validate state machine transitions

---

#### INV-POS-002: Position Uniqueness [HARD LAW]
**Rule:** Each position MUST have a unique ID that never changes.

```
position.id = UUID (immutable)
```

**Rationale:** Positions must be uniquely identifiable across entire system lifetime.

**Test:** `assert(position.id is unique and immutable)`

---

#### INV-POS-003: Position Ownership [HARD LAW]
**Rule:** Every position MUST belong to exactly one user.

```
position.userId IS NOT NULL
position.userId references valid User.id
```

**Rationale:** Orphaned positions indicate data corruption.

**Test:** `assert(position.userId != null and userExists(position.userId))`

---

#### INV-POS-004: Position Immutability After Close [HARD LAW]
**Rule:** Once a position is CLOSED, its core fields (entry price, size, realized P&L) MUST never change.

```
If position.status == CLOSED:
    position.entryPrice = IMMUTABLE
    position.size = IMMUTABLE
    position.realizedPnL = IMMUTABLE
    position.closedPrice = IMMUTABLE
    position.closedAt = IMMUTABLE
```

**Rationale:** Historical data integrity; closed trades are facts.

**Test:** `assert(closedPosition.entryPrice is immutable)`

---

### 2.2 Position Constraints

#### INV-POS-005: Positive Position Size [HARD LAW]
**Rule:** Position size MUST be greater than zero.

```
position.size > 0
```

**Rationale:** Zero or negative size is meaningless; indicates input error.

**Test:** `assert(position.size > 0)`

---

#### INV-POS-006: Valid Entry Price [HARD LAW]
**Rule:** Entry price MUST be positive.

```
position.entryPrice > 0
```

**Rationale:** Prevents data entry errors and unrealistic prices.

**Test:** `assert(position.entryPrice > 0)`

---

#### INV-POS-007: Stop Loss Logic [HARD LAW]
**Rule:** If set, stop loss MUST be on the losing side of entry price.

```
For BUY positions:
    if stopLoss IS NOT NULL:
        stopLoss < entryPrice

For SELL positions:
    if stopLoss IS NOT NULL:
        stopLoss > entryPrice
```

**Rationale:** Stop loss is for limiting losses, not locking profits.

**Test:** 
```
if (position.type == BUY and position.stopLoss != null):
    assert(position.stopLoss < position.entryPrice)
if (position.type == SELL and position.stopLoss != null):
    assert(position.stopLoss > position.entryPrice)
```

---

#### INV-POS-008: Take Profit Logic [HARD LAW]
**Rule:** If set, take profit MUST be on the winning side of entry price.

```
For BUY positions:
    if takeProfit IS NOT NULL:
        takeProfit > entryPrice

For SELL positions:
    if takeProfit IS NOT NULL:
        takeProfit < entryPrice
```

**Rationale:** Take profit is for locking profits.

**Test:** 
```
if (position.type == BUY and position.takeProfit != null):
    assert(position.takeProfit > position.entryPrice)
if (position.type == SELL and position.takeProfit != null):
    assert(position.takeProfit < position.entryPrice)
```

---

#### INV-POS-009: Position Limit Enforcement [CONFIGURABLE POLICY]
**Rule:** User MUST NOT exceed maximum allowed open positions.

```
count(user.openPositions) <= user.account.maxPositions
```

**Rationale:** Risk management and system resource protection.

**Test:** `assert(countOpenPositions(userId) <= account.maxPositions)`

---

#### INV-POS-010: Asset Class Consistency [HARD LAW]
**Rule:** Position's asset class MUST match its symbol's asset class.

```
position.assetClass = instruments[position.symbol].assetClass
```

**Rationale:** Data consistency; prevents classification errors.

**Test:** `assert(position.assetClass == getInstrument(position.symbol).assetClass)`

---

### 2.3 Position Close Rules

#### INV-POS-011: Close Price Validity [HARD LAW]
**Rule:** When closing a position, close price MUST be positive and valid.

```
position.closedPrice > 0
```

**Rationale:** Closed price must reflect actual market conditions.

**Test:** `assert(closedPosition.closedPrice > 0)`

---

#### INV-POS-012: Close Reason Traceability [HARD LAW]
**Rule:** Every closed position MUST have a documented close reason.

```
If position.status == CLOSED:
    position.closedBy IS NOT NULL
    position.closedBy IN (USER, ADMIN, STOP_LOSS, TAKE_PROFIT, MARGIN_CALL)
```

**Rationale:** Audit trail for why positions closed.

**Test:** `assert(closedPosition.closedBy != null and closedPosition.closedBy in validCloseReasons)`

---

#### INV-POS-013: Admin Close Documentation [CONFIGURABLE POLICY]
**Rule:** Admin-closed positions MUST have admin user ID and comment.

```
If position.closedBy == ADMIN:
    position.adminUserId IS NOT NULL
    position.adminCloseComment IS NOT NULL
```

**Rationale:** Admin actions must be fully auditable.

**Test:** 
```
if (closedPosition.closedBy == ADMIN):
    assert(closedPosition.adminUserId != null)
    assert(closedPosition.adminCloseComment != null)
```

---

## 3. RISK LOGIC INVARIANTS

### 3.1 Margin Thresholds

#### INV-RISK-001: Margin Call Threshold [CONFIGURABLE POLICY]
**Rule:** Margin call warning state is triggered when margin level falls below 50%.

```
if marginLevel < 50%:
    marginCallWarning = TRUE
```

**Rationale:** Early warning system for account risk.

**Test:** `assert((marginLevel < 50) == account.marginCallWarning)`

---

#### INV-RISK-002: Stop Out Threshold [CONFIGURABLE POLICY]
**Rule:** Stop out state is triggered when margin level falls below 20%.

```
if marginLevel < 20%:
    stopOutTriggered = TRUE
```

**Rationale:** Prevents account insolvency.

**Test:** `assert((marginLevel < 20) == account.stopOutTriggered)`

---

#### INV-RISK-003: Stop Out Priority Logic [HARD LAW]
**Rule:** During stop out, positions MUST be prioritized by most losing to least losing.

```
stop_out_order = sort(open_positions, by: unrealizedPnL, ascending)
```

**Rationale:** Minimize damage by closing worst performers first.

**Test:** `assert(stopOutQueue is sorted by unrealizedPnL ascending)`

---

#### INV-RISK-004: Margin Utilization Limit [CONFIGURABLE POLICY]
**Rule:** Total margin utilization MUST NOT exceed 80% of account equity.

```
(usedMargin / equity) <= 0.80
```

**Rationale:** Prevents over-leveraging; maintains safety buffer.

**Test:** `assert((account.usedMargin / account.equity) <= 0.80)`

---

### 3.2 Stop Loss / Take Profit Logic

#### INV-RISK-005: Stop Loss Trigger Condition [HARD LAW]
**Rule:** Stop loss is triggered when market price crosses the stop loss threshold.

```
For BUY positions:
    stopLossTriggered = (currentPrice <= stopLoss)

For SELL positions:
    stopLossTriggered = (currentPrice >= stopLoss)
```

**Rationale:** Stop loss is a risk control; must have clear trigger logic.

**Test:** 
```
if (position.type == BUY):
    assert(position.stopLossTriggered == (currentPrice <= position.stopLoss))
if (position.type == SELL):
    assert(position.stopLossTriggered == (currentPrice >= position.stopLoss))
```

---

#### INV-RISK-006: Take Profit Trigger Condition [HARD LAW]
**Rule:** Take profit is triggered when market price crosses the take profit threshold.

```
For BUY positions:
    takeProfitTriggered = (currentPrice >= takeProfit)

For SELL positions:
    takeProfitTriggered = (currentPrice <= takeProfit)
```

**Rationale:** Take profit locks in gains; must have clear trigger logic.

**Test:** 
```
if (position.type == BUY):
    assert(position.takeProfitTriggered == (currentPrice >= position.takeProfit))
if (position.type == SELL):
    assert(position.takeProfitTriggered == (currentPrice <= position.takeProfit))
```

---

#### INV-RISK-007: SL/TP Mutual Exclusivity [HARD LAW]
**Rule:** Position closure can only be triggered by ONE of (stop loss, take profit, manual close, margin call).

```
position can only be closed once
first trigger wins
```

**Rationale:** Prevents duplicate closure attempts.

**Test:** `assert(position.status == CLOSED implies exactly one closeReason)`

---

### 3.3 Position Sizing Limits

#### INV-RISK-008: Minimum Position Size [CONFIGURABLE POLICY]
**Rule:** Position size MUST meet minimum requirements for each asset class.

```
Forex:           size >= 0.01 lots (1,000 units)
Commodities:     varies (e.g., Gold >= 0.01 oz)
Indices:         contractValue >= $1
Cryptocurrencies: value >= $10
Stocks:          size >= 0.1 shares
```

**Rationale:** Prevents dust positions; realistic trading simulation.

**Test:** `assert(position.size >= getMinimumSize(position.assetClass))`

---

#### INV-RISK-009: Maximum Position Size [CONFIGURABLE POLICY]
**Rule:** Single position size MUST NOT exceed maximum for asset class.

```
Forex:           <= 50 lots per pair
Commodities:     <= $500,000 notional value
Indices:         <= $250,000 notional value
Cryptocurrencies: <= $100,000 notional value
Stocks:          <= $200,000 notional value
```

**Rationale:** Risk management; prevents excessive concentration.

**Test:** `assert(getNotionalValue(position) <= getMaxNotional(position.assetClass))`

---

#### INV-RISK-010: Maximum Total Exposure [CONFIGURABLE POLICY]
**Rule:** Sum of all open position notional values MUST NOT exceed configured limits.

```
total_exposure = sum(all_positions.size × all_positions.currentPrice)

Based on account balance:
    if balance < $1,000:     total_exposure <= 5 lots (Forex equivalent)
    if balance < $5,000:     total_exposure <= 20 lots
    if balance < $10,000:    total_exposure <= 50 lots
    if balance >= $10,000:   total_exposure <= 100 lots
```

**Rationale:** Prevents over-trading; manages aggregate risk.

**Test:** `assert(getTotalExposure(account) <= getMaxExposure(account.balance))`

---

## 4. STATE TRANSITION INVARIANTS

#### INV-STATE-001: Account State Consistency [HARD LAW]
**Rule:** Account state (balance, equity, margin) MUST always be internally consistent.

```
At any point in time:
    equity = balance + bonus + sum(positions.unrealizedPnL)
    usedMargin = sum(positions.marginUsed)
    freeMargin = equity - usedMargin
    marginLevel = (equity / usedMargin) × 100 if usedMargin > 0
```

**Rationale:** Core financial invariants must hold simultaneously.

**Test:** Validate all four equations hold true

---

#### INV-STATE-002: KYC Status Progression [HARD LAW]
**Rule:** KYC status MUST follow valid state transitions.

```
Allowed transitions:
    NOT_SUBMITTED → PENDING
    PENDING → APPROVED
    PENDING → REJECTED
    REJECTED → PENDING (resubmission)

Forbidden transitions:
    APPROVED → anything (final state)
    NOT_SUBMITTED → APPROVED
```

**Rationale:** KYC workflow integrity.

**Test:** Validate state machine transitions

---

#### INV-STATE-003: Account Status Trading Restrictions [CONFIGURABLE POLICY]
**Rule:** SUSPENDED or BANNED accounts MUST NOT be able to open new positions.

```
if user.accountStatus IN (SUSPENDED, BANNED):
    canOpenNewPositions = FALSE
    canCloseExistingPositions = TRUE
```

**Rationale:** Account restrictions must be enforced.

**Test:** 
```
if (user.accountStatus in [SUSPENDED, BANNED]):
    assert(canOpenPosition(user) == false)
    assert(canClosePosition(user) == true)
```

---

## 5. CALCULATION INVARIANTS

### 5.1 Mathematical Correctness

#### INV-CALC-001: Division by Zero Protection [HARD LAW]
**Rule:** All division operations MUST handle zero divisor.

```
Examples:
    marginLevel = (equity / usedMargin) × 100
        → if usedMargin = 0, return NULL or ∞

    leverage = (notionalValue / margin)
        → if margin = 0, return ERROR
```

**Rationale:** Prevents runtime crashes.

**Test:** `assert(divisionByZero is handled for all calculations)`

---

#### INV-CALC-002: Rounding Consistency [HARD LAW]
**Rule:** Financial calculations MUST use banker's rounding (round half to even).

```
0.125 → 0.12
0.135 → 0.14
0.145 → 0.14
0.155 → 0.16
```

**Rationale:** Minimizes rounding bias over many operations.

**Test:** `assert(roundingMode == BANKERS_ROUNDING)`

---

#### INV-CALC-003: P&L Calculation Order [HARD LAW]
**Rule:** P&L calculations MUST use this exact sequence.

```
1. rawPnL = calculate based on price difference × size
2. commissionFee = calculate if applicable
3. swapFee = calculate if applicable
4. netPnL = rawPnL - commissionFee - swapFee
5. Round to 2 decimal places
```

**Rationale:** Consistent calculation order prevents rounding errors.

**Test:** Verify calculation sequence in code

---

### 5.2 Spread Application

#### INV-CALC-004: Simulated Spread [CONFIGURABLE POLICY]
**Rule:** For market orders, apply realistic bid-ask spread.

```
For BUY orders:
    executionPrice = ask = midPrice × (1 + spread/2)

For SELL orders:
    executionPrice = bid = midPrice × (1 - spread/2)
```

**Rationale:** Realistic trading simulation includes market costs.

**Test:** `assert(buyExecution == midPrice * (1 + spread/2))`

---

#### INV-CALC-005: Execution Price Is Final [HARD LAW]
**Rule:** The engine MUST treat executionPrice as an immutable input. The engine MUST NOT introduce randomness or price modification.

```
executionPrice is provided by the system layer
engine accepts executionPrice as-is
engine does NOT modify executionPrice
```

**Rationale:** Determinism, replayability, and test reproducibility require the engine to be pure. Randomness breaks these guarantees.

**Test:** `assert(position.entryPrice == providedExecutionPrice)` (no modification)

---

## 6. DATA VALIDITY INVARIANTS

### 6.1 Referential Integrity

#### INV-DATA-001: Position Foreign Key Integrity [HARD LAW]
**Rule:** Every position MUST reference a valid user and valid instrument.

```
position.userId references valid User
position.symbol exists in valid Instruments
```

**Rationale:** Orphaned data indicates corruption.

**Test:** 
```
assert(userExists(position.userId))
assert(instrumentExists(position.symbol))
```

---

#### INV-DATA-002: Transaction Traceability [HARD LAW]
**Rule:** Every balance-changing transaction MUST be traceable.

```
if transaction.type IN (TRADE_PROFIT, TRADE_LOSS, COMMISSION, SWAP):
    transaction.positionId IS NOT NULL

if transaction.type IN (BALANCE_ADD, BALANCE_REMOVE, BONUS_ADD, BONUS_REMOVE):
    transaction.adminUserId IS NOT NULL
```

**Rationale:** All money movements must be auditable.

**Test:** Validate foreign keys based on transaction type

---

### 6.2 Timestamp Logic

#### INV-DATA-003: Temporal Ordering [HARD LAW]
**Rule:** Position close time MUST be after or equal to position open time.

```
position.closedAt >= position.openedAt
```

**Rationale:** Time flows forward.

**Clarification:** The engine does not assign timestamps; it only validates ordering of provided values.

**Test:** `assert(position.closedAt >= position.openedAt)`

---

### 6.3 Numeric Precision

#### INV-DATA-004: Price Precision [CONFIGURABLE POLICY]
**Rule:** Prices MUST be stored with sufficient decimal precision.

```
Forex:           5 decimal places
Commodities:     2-5 decimal places
Indices:         2 decimal places
Cryptocurrencies: 8 decimal places
Stocks:          2 decimal places
```

**Rationale:** Prevents rounding errors in calculations.

**Test:** `assert(getPrecision(price, assetClass) >= minimumPrecision)`

---

#### INV-DATA-005: Financial Value Precision [HARD LAW]
**Rule:** Account balances, equity, margin MUST use adequate precision.

```
All financial fields: DECIMAL(15, 2) or equivalent
    - Exactly 2 decimal places for currency
```

**Rationale:** Standard financial precision.

**Test:** `assert(decimalPlaces(balance) == 2)`

---

## INVARIANT VIOLATION HANDLING

### Detection Strategy

**Pre-Operation Validation:**
Check invariants before executing operations.

**Post-Operation Verification:**
Verify invariants after state changes.

**Example:**
```typescript
function enforceInvariant(invariantId: string, condition: boolean, message: string) {
  if (!condition) {
    throw new InvariantViolationError(invariantId, message);
  }
}

// Usage
enforceInvariant(
  'INV-FIN-001',
  account.balance >= 0,
  `Account balance cannot be negative: ${account.balance}`
);
```

---

## INVARIANT QUICK REFERENCE

### Critical Financial Laws

| ID | Rule | Type |
|---|---|---|
| INV-FIN-001 | Balance ≥ 0 | HARD LAW |
| INV-FIN-002 | Equity = Balance + Bonus + Unrealized P&L | HARD LAW |
| INV-FIN-010 | Margin = (Size × Price) / Leverage | HARD LAW |
| INV-FIN-011 | BUY P&L = (Current - Entry) × Size | HARD LAW |
| INV-FIN-012 | SELL P&L = (Entry - Current) × Size | HARD LAW |

### Critical Position Laws

| ID | Rule | Type |
|---|---|---|
| INV-POS-001 | Status: PENDING → OPEN → CLOSED | HARD LAW |
| INV-POS-004 | Closed positions immutable | HARD LAW |
| INV-POS-005 | Size > 0 | HARD LAW |
| INV-POS-007 | SL on losing side | HARD LAW |
| INV-POS-008 | TP on winning side | HARD LAW |

---

## CONCLUSION

These invariants represent the **pure mathematical and logical core** of the trading engine.

They are:
- **Environment-agnostic** - No references to infrastructure
- **Deterministic** - Same inputs always produce same outputs
- **Testable** - Every invariant can be verified
- **Timeless** - Would hold true even on paper

**Key Principle:**
> "If you can't test this invariant with a pencil and paper, it doesn't belong here."

---

**DOCUMENT STATUS:** APPROVED  
**AUTHORITY:** Overrides all other specifications in case of conflict.

---

**END OF ENGINE INVARIANTS DOCUMENT**
