# CFD Trading Engine - Reference Implementation

**Status:** Logic-free skeleton, invariant-driven, AI-safe  
**Version:** 1.0  
**Date:** February 6, 2026

> **📚 Documentation Reference:** See [docs/engine-specs/](../docs/engine-specs/) for detailed engine specifications, contracts, and validation rules.

---

## 🧱 Architecture Principles

### Core Principle: Code Does Not Define Behavior. Structure Defines Behavior.

This codebase enforces engine invariants structurally, making illegal behavior **impossible**.

### Key Facts

- **Pure Function:** `runEngine(state, event) → EngineResult`
- **No Side Effects:** State in, state out. Nothing else.
- **No Database Calls:** Engine is stateless.
- **No Network Calls:** All data passed as event fields.
- **No Async:** Synchronous only.
- **Deterministic:** Same input always produces same output.

---

## 📁 Directory Structure (Non-Negotiable)

```
engine/
├── index.ts               ← ENTRYPOINT (only way in)
│
├── domain/               ← Pure rules only (math, invariants)
│   ├── calculations/     ← P&L, margin, fees, rounding
│   ├── invariants/       ← Assertion functions
│   └── priority/         ← Liquidation order logic
│
├── state/               ← Immutable state shapes
│   ├── AccountState.ts
│   ├── PositionState.ts
│   ├── MarketState.ts
│   └── EngineState.ts
│
├── events/              ← Event definitions (data only)
│   ├── EngineEvent.ts
│   ├── OpenPosition.ts
│   ├── ClosePosition.ts
│   ├── UpdatePrices.ts
│   └── ... (all event types)
│
├── validation/          ← Invariant enforcement
│   ├── validateEvent.ts      ← Orchestrator
│   ├── validateAccount.ts
│   ├── validatePosition.ts
│   └── validateRisk.ts
│
├── execution/           ← Orchestration only (no math)
│   ├── executeEvent.ts       ← Dispatcher
│   ├── openPosition.ts
│   ├── closePosition.ts
│   ├── updatePrices.ts
│   └── marginEnforcement.ts
│
├── effects/            ← Side effect definitions
│   ├── audit.ts        ← Effect types
│   ├── persistence.ts  ← Persistence hooks (no-op in engine)
│   └── notifications.ts ← Notification hooks (no-op in engine)
│
├── ports/              ← Interfaces to outside world
│   ├── PriceFeed.ts    ← System provides prices
│   ├── Clock.ts        ← System provides time
│   └── IdGenerator.ts  ← System generates IDs
│
└── tests/              ← SPEC ANCHORS (not test code)
    ├── goldenPaths/    ← Golden path references
    │   ├── GP-1.md
    │   ├── GP-2.md
    │   └── GP-3.md
    └── invariants/     ← Invariant mapping
        └── invariant-map.md
```

---

## 🔐 Key Rules

### Rule 1: No Directory Imports Downwards

```
domain/ ← can only import types
state/  ← can only import types
events/ ← can import state, domain
validation/ ← can import events, state, domain
execution/ ← can import validation, events, state, domain
effects/ ← can import anything
```

### Rule 2: State is Immutable

All state fields are `readonly`. Every update returns a new state object.

```typescript
// WRONG:
state.account.balance = 1000;

// RIGHT:
const newAccount = { ...state.account, balance: 1000 };
const newState = { ...state, account: newAccount };
```

### Rule 3: Events Are Data Only

Events contain **only fields**, no methods, no getters, no calculations.

```typescript
interface OpenPositionEvent {
  type: "OPEN_POSITION";
  positionId: string;
  // ... 10 fields
  // NO methods
}
```

### Rule 4: Validation Throws

Validation layer throws on failure. Execution layer assumes validation passed.

```typescript
// validation/validateEvent.ts
export function validateEvent(state, event) {
  if (error) throw new EngineValidationError(...);
}

// execution/executeEvent.ts (no validation checks)
export function executeEvent(state, event) {
  // Trust validation passed. Do the work.
}
```

### Rule 5: No Derived Fields in State

Derived fields (equity, freeMargin, etc.) are **recalculated on every event**.

```typescript
// State stores:
account.balance
account.bonus
account.marginUsed

// State derives:
account.equity = balance + bonus + sum(unrealizedPnL) ← recalculated
account.freeMargin = equity - marginUsed ← recalculated
account.marginLevel = (equity / marginUsed) * 100 ← recalculated
```

---

## 📊 Event Flow

```
Input: (state, event)
       ↓
   VALIDATE
   ├─ validateEvent()
   │  ├─ validateAccount()
   │  ├─ validateRisk()
   │  └─ validatePosition()
   │
   ├─ (Any failure throws)
   │
   ├─ (No state changes during validation)
       ↓
   EXECUTE
   ├─ executeEvent()
   │  ├─ Route to handler (openPosition, closePosition, etc)
   │  ├─ Calculate new state (no validation)
   │  ├─ Collect effects
   │  └─ Return EngineResult
       ↓
Output: EngineResult {
  success: boolean,
  newState?: EngineState,
  effects?: EngineEffect[],
  error?: {code, message}
}
```

---

## 🚀 AI Safety Rules

### ✅ AI Is Allowed To:

1. **Fill function bodies** in `domain/` folder only
2. **Implement math** in `domain/calculations/`
3. **Add assertion logic** in `domain/invariants/`
4. **Create helper functions** (pure only)
5. **Add tests** (only after Option G - **existing Option F skeleton untouchable**)

### ❌ AI Is Forbidden From:

1. **Creating new folders** (structure locked)
2. **Moving files** (structure locked)
3. **Adding logic to validation layer** (call existing validators only)
4. **Adding logic to execution layer** (call domain functions only)
5. **Changing state shape** (fields locked)
6. **Adding new invariants** (locked, reference ENGINE_INVARIANTS.md)
7. **Reordering validation** (locked, reference ENGINE_VALIDATION_ORDER.md)

---

## 📚 Reference Documents

All behavioral specs are locked in documents (see [docs/engine-specs/](../docs/engine-specs/)):

- **ENGINE_INVARIANTS.md** — Timeless mathematical rules
- **ENGINE_VALIDATION_ORDER.md** — Exact validation sequence
- **ENGINE_GOLDEN_PATHS.md** — Example flows (GP-1 through GP-6)
- **ENGINE_STATE_MAP.md** — Invariant-to-field mapping
- **ENGINE_INTERFACE.md** — Legal event shapes

If code contradicts these → **code is wrong**, not the document.

---

## 🧪 Testing Strategy

### Phase 1: Structure Only (Current)
- No logic, only TODO comments
- Every file has invariant references
- Codebase compiles with correct structure

### Phase 2: Golden Paths
- Implement domain functions
- Validate against GP-1, GP-2, GP-3
- Each function tested in isolation

### Phase 3: Full Coverage
- Add remaining validators
- Test all error conditions
- Verify invariant enforcement

---

## 💭 Design Philosophy

1. **Invariants first** — Rules drive structure, not vice versa
2. **Static enforcement** — Illegal behavior is structurally impossible
3. **Immutability** — Every update produces new state, no mutations
4. **Pure functions** — No side effects, no surprises
5. **Single flow** — One entrypoint, one validation order, one rule

---

## 🔄 Next Steps

1. ✅ Create this skeleton (DONE)
2. ⏳ Implement `domain/calculations/` functions
3. ⏳ Implement `domain/invariants/` assertions
4. ⏳ Wire up validation layer
5. ⏳ Implement execution orchestrators
6. ⏳ Test each golden path

**Before any implementation:** Commit this skeleton as-is. It's the contract.
