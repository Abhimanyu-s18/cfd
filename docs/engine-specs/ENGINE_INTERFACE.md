# CFD Trading Engine - Interface Specification

**Version:** 1.0  
**Date:** February 5, 2026  
**Status:** FROZEN - No additions without invariant review  
**Related Documents:** ENGINE_INVARIANTS.md, ENGINE_STATE_MAP.md  

---

## DOCUMENT PURPOSE

This document defines the **only legal way** the outside world can communicate with the engine.

**Core Principle:**
> If it's not in this document, it does not exist.

The engine is a pure function:
- **Input:** EngineEvent
- **Output:** EngineResult
- **State:** EngineState (internal, never directly accessed)

---

## THE SINGLE ENGINE ENTRY POINT

```typescript
function processEvent(
  currentState: EngineState,
  event: EngineEvent
): EngineResult
```

**Signature Properties:**
- Pure function (no side effects)
- Deterministic (same input → same output)
- Synchronous (no async operations)
- Stateless (state passed in, returned in result)

**The engine does NOT:**
- Persist state
- Fetch prices
- Send notifications
- Generate timestamps
- Create random values
- Call external APIs
- Throw exceptions (returns errors in EngineResult)

---

## ENGINE EVENT TYPES

```typescript
type EngineEvent =
  | OpenPositionEvent
  | ClosePositionEvent
  | UpdatePricesEvent
  | AddFundsEvent
  | RemoveFundsEvent
  | AddBonusEvent
  | RemoveBonusEvent
  | SetStopLossEvent
  | SetTakeProfitEvent
  | CancelPendingPositionEvent
  | UpdateAccountStatusEvent
  | UpdateAccountPoliciesEvent
```

**Event Rules:**
- Events are immutable after creation
- Events contain ALL required data (no lookups)
- Events include timestamps (provided by system, validated by engine)
- Events are the ONLY way to change state

---

## EVENT SCHEMAS

### OpenPositionEvent

```typescript
interface OpenPositionEvent {
  type: 'OPEN_POSITION'
  
  // Identity
  positionId: string          // UUID, must be unique
  accountId: string           // Must reference existing account
  marketId: string            // Must reference existing market
  
  // Order details
  side: 'LONG' | 'SHORT'
  size: number                // Must be > 0
  executionPrice: number      // Immutable, provided by system
  leverage: number            // Must be > 0
  
  // Risk management (optional)
  stopLoss?: number           // If set, must satisfy INV-POS-007
  takeProfit?: number         // If set, must satisfy INV-POS-008
  
  // Fees
  commissionFee: number       // >= 0
  
  // Metadata
  timestamp: string           // ISO 8601, system-provided
  orderType: 'MARKET' | 'LIMIT'
}
```

**Validation Requirements:**
- positionId must be unique across all positions
- accountId must exist in state
- marketId must exist in state
- size must be > 0
- executionPrice must be > 0
- leverage must be > 0 and <= market.maxLeverage
- stopLoss/takeProfit must satisfy logic invariants
- Account must have sufficient free margin
- Account status must allow trading
- Position count must not exceed account.maxPositions

---

### ClosePositionEvent

```typescript
interface ClosePositionEvent {
  type: 'CLOSE_POSITION'
  
  // Identity
  positionId: string          // Must reference existing OPEN position
  accountId: string           // Must match position owner
  
  // Closure details
  closePrice: number          // Must be > 0, system-provided
  closedBy: 'USER' | 'ADMIN' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'MARGIN_CALL'
  
  // Fees
  swapFee: number            // >= 0
  
  // Admin metadata (required if closedBy = ADMIN)
  adminUserId?: string
  adminCloseComment?: string
  
  // Metadata
  timestamp: string          // ISO 8601, must be >= position.openedAt
}
```

**Validation Requirements:**
- positionId must exist and status = OPEN
- accountId must match position.accountId
- closePrice must be > 0
- timestamp must be >= position.openedAt
- If closedBy = ADMIN: adminUserId and adminCloseComment required

---

### UpdatePricesEvent

```typescript
interface UpdatePricesEvent {
  type: 'UPDATE_PRICES'
  
  // Price updates
  prices: {
    marketId: string
    markPrice: number        // Must be > 0
  }[]
  
  // Metadata
  timestamp: string          // ISO 8601
}
```

**Validation Requirements:**
- All marketId values must exist in state
- All markPrice values must be > 0
- Triggers recalculation of all derived fields
- Checks SL/TP triggers for all positions

---

### AddFundsEvent

```typescript
interface AddFundsEvent {
  type: 'ADD_FUNDS'
  
  // Identity
  accountId: string
  
  // Amount
  amount: number             // Must be > 0
  
  // Admin metadata
  adminUserId: string
  reason: string
  
  // Metadata
  timestamp: string          // ISO 8601
}
```

**Validation Requirements:**
- accountId must exist
- amount must be > 0
- adminUserId required
- reason required

---

### RemoveFundsEvent

```typescript
interface RemoveFundsEvent {
  type: 'REMOVE_FUNDS'
  
  // Identity
  accountId: string
  
  // Amount
  amount: number             // Must be > 0
  
  // Admin metadata
  adminUserId: string
  reason: string
  
  // Metadata
  timestamp: string          // ISO 8601
}
```

**Validation Requirements:**
- accountId must exist
- amount must be > 0
- amount must be <= account.balance
- adminUserId required
- reason required
- After removal, balance must remain >= 0

---

### AddBonusEvent

```typescript
interface AddBonusEvent {
  type: 'ADD_BONUS'
  
  // Identity
  accountId: string
  
  // Amount
  amount: number             // Must be > 0
  
  // Admin metadata
  adminUserId: string
  reason: string
  
  // Metadata
  timestamp: string          // ISO 8601
}
```

**Validation Requirements:**
- accountId must exist
- amount must be > 0
- adminUserId required
- reason required

---

### RemoveBonusEvent

```typescript
interface RemoveBonusEvent {
  type: 'REMOVE_BONUS'
  
  // Identity
  accountId: string
  
  // Amount
  amount: number             // Must be > 0
  
  // Admin metadata
  adminUserId: string
  reason: string
  
  // Metadata
  timestamp: string          // ISO 8601
}
```

**Validation Requirements:**
- accountId must exist
- amount must be > 0
- amount must be <= account.bonus
- adminUserId required
- reason required

---

### SetStopLossEvent

```typescript
interface SetStopLossEvent {
  type: 'SET_STOP_LOSS'
  
  // Identity
  positionId: string         // Must reference existing OPEN position
  accountId: string          // Must match position owner
  
  // Stop loss
  stopLoss: number | null    // If number, must satisfy INV-POS-007
  
  // Metadata
  timestamp: string          // ISO 8601
}
```

**Validation Requirements:**
- positionId must exist and status = OPEN
- accountId must match position.accountId
- If stopLoss not null: must satisfy stop loss logic invariant
- null value removes existing stop loss

---

### SetTakeProfitEvent

```typescript
interface SetTakeProfitEvent {
  type: 'SET_TAKE_PROFIT'
  
  // Identity
  positionId: string         // Must reference existing OPEN position
  accountId: string          // Must match position owner
  
  // Take profit
  takeProfit: number | null  // If number, must satisfy INV-POS-008
  
  // Metadata
  timestamp: string          // ISO 8601
}
```

**Validation Requirements:**
- positionId must exist and status = OPEN
- accountId must match position.accountId
- If takeProfit not null: must satisfy take profit logic invariant
- null value removes existing take profit

---

### CancelPendingPositionEvent

```typescript
interface CancelPendingPositionEvent {
  type: 'CANCEL_PENDING_POSITION'
  
  // Identity
  positionId: string         // Must reference existing PENDING position
  accountId: string          // Must match position owner
  
  // Metadata
  timestamp: string          // ISO 8601
}
```

**Validation Requirements:**
- positionId must exist and status = PENDING
- accountId must match position.accountId

---

### UpdateAccountStatusEvent

```typescript
interface UpdateAccountStatusEvent {
  type: 'UPDATE_ACCOUNT_STATUS'
  
  // Identity
  accountId: string
  
  // New status
  status: 'ACTIVE' | 'LIQUIDATION_ONLY' | 'CLOSED'
  
  // Admin metadata
  adminUserId: string
  reason: string
  
  // Metadata
  timestamp: string          // ISO 8601
}
```

**Validation Requirements:**
- accountId must exist
- Status transition must be valid (per INV-STATE-002)
- adminUserId required
- reason required

---

### UpdateAccountPoliciesEvent

```typescript
interface UpdateAccountPoliciesEvent {
  type: 'UPDATE_ACCOUNT_POLICIES'
  
  // Identity
  accountId: string
  
  // Policies (all optional, only provided fields are updated)
  maxPositions?: number      // If provided, must be > 0
  
  // Admin metadata
  adminUserId: string
  reason: string
  
  // Metadata
  timestamp: string          // ISO 8601
}
```

**Validation Requirements:**
- accountId must exist
- If maxPositions provided: must be > 0
- adminUserId required
- reason required

---

## ENGINE RESULT

```typescript
type EngineResult = EngineSuccess | EngineFailure

interface EngineSuccess {
  success: true
  newState: EngineState
  effects: EngineEffect[]
}

interface EngineFailure {
  success: false
  error: EngineError
  // State is unchanged on failure
}
```

**Result Properties:**
- Either success with new state OR failure with error
- Never partial success
- State only changes on success
- Effects emitted on success (for system to handle)

---

## ENGINE EFFECTS

```typescript
type EngineEffect =
  | PositionOpenedEffect
  | PositionClosedEffect
  | MarginCallEffect
  | StopOutEffect
  | BalanceChangedEffect
```

**Effect Purpose:**
- Signal what happened (for system notifications, persistence, etc.)
- Engine does NOT act on effects
- System layer handles effects

**Effect Rules:**
- **Deduplication:** For any single EngineEvent, each Position may emit at most one PositionClosedEffect
- **Ordering:** Effects are emitted in strict order:
  1. PositionClosedEffect (all position closures, in closure order)
  2. BalanceChangedEffect (all balance changes)
  3. MarginCallEffect (all margin call warnings)
  4. StopOutEffect (all stop out events)
- **No Duplicates:** No duplicate effects for the same entity within a single event

**Effect Examples:**

```typescript
interface PositionOpenedEffect {
  type: 'POSITION_OPENED'
  accountId: string
  positionId: string
  marketId: string
  side: 'LONG' | 'SHORT'
  size: number
  entryPrice: number
}

interface PositionClosedEffect {
  type: 'POSITION_CLOSED'
  accountId: string
  positionId: string
  closedBy: 'USER' | 'ADMIN' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'MARGIN_CALL'
  realizedPnL: number
}

interface MarginCallEffect {
  type: 'MARGIN_CALL'
  accountId: string
  marginLevel: number
}

interface StopOutEffect {
  type: 'STOP_OUT'
  accountId: string
  closedPositions: string[]  // position IDs
}

interface BalanceChangedEffect {
  type: 'BALANCE_CHANGED'
  accountId: string
  oldBalance: number
  newBalance: number
  reason: string
}
```

---

## ENGINE ERRORS

```typescript
interface EngineError {
  code: EngineErrorCode
  message: string
  invariantId?: string        // If invariant violation caused error
  details?: Record<string, any>
}

enum EngineErrorCode {
  // Validation errors
  INVALID_EVENT = 'INVALID_EVENT',
  INVARIANT_VIOLATION = 'INVARIANT_VIOLATION',
  
  // Entity errors
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  POSITION_NOT_FOUND = 'POSITION_NOT_FOUND',
  MARKET_NOT_FOUND = 'MARKET_NOT_FOUND',
  
  // Business logic errors
  INSUFFICIENT_MARGIN = 'INSUFFICIENT_MARGIN',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  POSITION_LIMIT_EXCEEDED = 'POSITION_LIMIT_EXCEEDED',
  INVALID_POSITION_STATUS = 'INVALID_POSITION_STATUS',
  INVALID_ACCOUNT_STATUS = 'INVALID_ACCOUNT_STATUS',
  LEVERAGE_EXCEEDED = 'LEVERAGE_EXCEEDED',
  SIZE_BELOW_MINIMUM = 'SIZE_BELOW_MINIMUM',
  SIZE_ABOVE_MAXIMUM = 'SIZE_ABOVE_MAXIMUM',
  EXPOSURE_LIMIT_EXCEEDED = 'EXPOSURE_LIMIT_EXCEEDED',
  INVALID_STOP_LOSS = 'INVALID_STOP_LOSS',
  INVALID_TAKE_PROFIT = 'INVALID_TAKE_PROFIT',
  TEMPORAL_VIOLATION = 'TEMPORAL_VIOLATION',
  
  // State errors
  DUPLICATE_POSITION_ID = 'DUPLICATE_POSITION_ID',
  POSITION_NOT_OPEN = 'POSITION_NOT_OPEN',
  POSITION_NOT_PENDING = 'POSITION_NOT_PENDING',
}
```

**Error Principles:**
- Errors are values, not exceptions
- Every error has a code
- Every error has a human-readable message
- Invariant violations include invariantId for debugging
- Details object for context (optional)

---

## WHAT THE ENGINE CANNOT DO

**Explicit Prohibitions:**

❌ **Cannot persist state**
- Engine returns new state
- System layer persists it

❌ **Cannot fetch prices**
- Prices provided in UpdatePricesEvent
- Engine validates and uses them

❌ **Cannot generate timestamps**
- Timestamps provided in events
- Engine validates temporal ordering only

❌ **Cannot generate random values**
- All randomness at system layer
- Engine is deterministic

❌ **Cannot send notifications**
- Engine emits effects
- System layer handles notifications

❌ **Cannot query external systems**
- All data in EngineState or EngineEvent
- No external dependencies

❌ **Cannot throw exceptions**
- All errors returned as EngineFailure
- Pure functional error handling

❌ **Cannot make network requests**
- Completely isolated
- No I/O of any kind

❌ **Cannot access system clock**
- Timestamps passed in
- Engine has no concept of "now"

❌ **Cannot log directly**
- Engine returns results
- System layer logs them

---

## ENGINE STATE ACCESS

**State is NEVER directly accessed from outside.**

Only way to read state:
- Query functions that take EngineState and return read-only views
- State is passed in, never stored in engine

Only way to modify state:
- Submit EngineEvent to processEvent
- Receive new state in EngineResult

**No escape hatches.**
**No convenience methods.**
**No shortcuts.**

---

## INTERFACE GUARANTEES

When you call `processEvent(state, event)`:

✅ **Determinism**
- Same state + same event = same result
- Always

✅ **Atomicity**
- Either entire event succeeds OR nothing changes
- No partial updates

✅ **Isolation**
- No side effects
- No global state mutations
- No external calls

✅ **Validation**
- All invariants checked before state change
- First violation stops processing
- Clear error on failure

✅ **Immutability**
- Input state never modified
- New state returned on success
- Can safely retry on failure

---

## INTERFACE VERSION POLICY

**This interface is now FROZEN for v1.**

Changes require:
1. Invariant review
2. State map update
3. Validation order update
4. Breaking version increment

**Non-breaking additions only:**
- New event types (if new invariants added)
- New optional event fields (with defaults)
- New effect types

**Breaking changes prohibited:**
- Removing events
- Removing required fields
- Changing event semantics
- Changing error codes

---

## TESTING INTERFACE

The engine interface makes testing trivial:

```typescript
// Setup
const initialState = createTestState()
const event = createTestEvent()

// Execute
const result = processEvent(initialState, event)

// Assert
if (result.success) {
  assert(result.newState.accounts.get(accountId).balance === expectedBalance)
  assert(result.effects.length === expectedEffectCount)
} else {
  assert(result.error.code === expectedErrorCode)
  assert(result.error.invariantId === expectedInvariantId)
}

// Verify immutability
assert(initialState === initialState) // Original unchanged
```

**Testing benefits:**
- No mocks needed
- No setup/teardown
- No async complexity
- Pure input/output testing

---

## INTEGRATION WITH SYSTEM LAYER

```
┌─────────────────────────────────────┐
│         SYSTEM LAYER                │
│                                     │
│  - Receives HTTP requests           │
│  - Validates auth/permissions       │
│  - Fetches current EngineState      │
│  - Fetches current prices           │
│  - Constructs EngineEvent           │
│  - Calls processEvent()             │
│  - Persists new state (if success)  │
│  - Handles effects (notifications)  │
│  - Returns HTTP response            │
│                                     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│         ENGINE (Pure Function)       │
│                                     │
│  processEvent(state, event)         │
│  → validates all invariants         │
│  → calculates new state             │
│  → returns EngineResult             │
│                                     │
└─────────────────────────────────────┘
```

**System responsibilities:**
- API layer
- Authentication
- Authorization
- Price fetching
- Timestamp generation
- State persistence
- Effect handling
- Notifications
- Logging
- Monitoring

**Engine responsibilities:**
- Invariant validation
- State computation
- Business logic
- Financial calculations
- Risk management logic

**Clear separation.**
**No leakage.**

---

## CONCLUSION

This interface is the **only legal communication channel** with the engine.

**Rules:**
- All state changes via events
- All errors via EngineFailure
- All side effects via EngineEffect
- Zero direct state access
- Zero external dependencies
- Zero non-determinism

**Guarantees:**
- Pure function
- Deterministic
- Testable
- Isolated
- Atomic

If something needs to happen and there's no event for it:
1. Either you need a new invariant
2. Or it belongs in the system layer

**The engine is a sealed box.**
**The interface is the only opening.**

---

**DOCUMENT STATUS:** FROZEN  
**AUTHORITY:** Defines legal engine communication

---

**END OF ENGINE INTERFACE**
