# Final Engine Execution Contract (Option H)

**Status:** FINAL — FROZEN  
**Date:** February 7, 2026  
**Scope:** Engine core only (no I/O, no persistence, no infra)  
**Audience:** Engine implementers, auditors, AI copilots  
**Authority Level:** HIGHEST — Overrides all other specifications except invariants

---

## 1️⃣ Engine Boundary (Immutable)

### Canonical Signature

```ts
runEngine(
  state: EngineState,
  event: EngineEvent
): EngineResult
```

### Hard Rules

* `runEngine` is **pure** and **deterministic**
* It must not:
  * mutate input `state`
  * perform I/O
  * read time, randomness, environment
* Output depends **only** on `(state, event)`

This aligns with:
* Deterministic Replay Contract
* All Golden Paths
* All invariant enforcement mappings

---

## 2️⃣ EngineResult Shape (Frozen)

```ts
type EngineResult =
  | {
      success: true
      newState: EngineState
      effects: EngineEffect[]
    }
  | {
      success: false
      error: EngineError
    }
```

### Guarantees

* On `success: false`
  * `state` is NOT modified
  * `effects` are NOT emitted
* On `success: true`
  * `newState` reflects **exactly one event**
  * `effects` are **fully deterministic and ordered**

---

## 3️⃣ Execution Phases (Strict Order)

The engine **must** execute these phases in order.
No phase may be skipped.
No phase may be reordered.

---

### **Phase 0 — Event Intake**

**Purpose:** Accept event as-is.

Rules:
* Engine does NOT enrich, normalize, or auto-correct events
* Engine trusts system to provide required fields (timestamp, price, IDs)

Failure:
* None (shape validation happens in Phase 1)

---

### **Phase 1 — Structural & Referential Validation**

**Enforced by:**
* `validation/*`
* `INV-DATA-*`
* `INV-STATE-003`

Validations include:
* Account exists
* Position exists (if referenced)
* Account is active
* Market price present and valid
* Event references are coherent

❌ If any validation fails:

```ts
return {
  success: false,
  error: ValidationError
}
```

No state mutation.
No effects.

---

### **Phase 2 — Pure Domain Calculations**

**Enforced by:**
* `domain/calculations/*`

Includes:
* Margin required
* Unrealized P&L
* Realized P&L (if closing)
* Equity
* Free margin
* Margin level
* Fees

Rules:
* Calculations are pure functions
* No branching on policy
* No side effects
* No state mutation

Outputs are **intermediate values only**.

---

### **Phase 3 — Invariant Enforcement**

**Enforced by:**
* `domain/invariants/*`
* Invariant → Enforcement Map (Option G)

Rules:
* All invariants relevant to the event **must be evaluated**
* Enforcement order is deterministic
* Severity does NOT affect enforcement (CRITICAL vs HIGH is informational)

❌ If any invariant fails:

```ts
return {
  success: false,
  error: InvariantViolationError
}
```

No partial state updates.
No effects.

**Reference:** See `invariant-enforcement-map.json` for definitive phase 3 responsibility allocation.

---

### **Phase 4 — State Transition**

**Enforced by:**
* `execution/*`
* `state/*`

Rules:
* Apply exactly one event
* Position state transitions must follow `INV-POS-001`
* Financial mutations must match calculations from Phase 2
* Closed entities become immutable

State changes here are **atomic**.

---

### **Phase 5 — Effect Emission**

**Enforced by:**
* `effects/*`
* Deterministic Replay Contract

Rules:
* Effects are **descriptive**, not active
* Effects include:
  * audit records
  * persistence intents
* Effects must:
  * contain no timestamps
  * contain no generated IDs
  * be ordered deterministically

Effects are returned, not executed.

---

### **Phase 6 — Commit Result**

```ts
return {
  success: true,
  newState,
  effects
}
```

No post-processing.
No hooks.
No retries.

---

## 4️⃣ Failure Taxonomy (Frozen)

The engine may return **only** these failure classes:

### 1. `ValidationError`

* Structural issues
* Missing entities
* Invalid references
* Account not active

➡️ Indicates caller/system error

---

### 2. `InvariantViolationError`

* Any `INV-*` failure

➡️ Indicates logic breach or disallowed state transition

---

### 3. `ImpossibleStateError`

* Only for contradictions that should be unreachable if invariants are correct

➡️ Indicates engine bug

This category must be rare and loud.

---

## 5️⃣ Determinism Guarantees

The following must hold:

* Same `(state, event)` → same `EngineResult`
* Effect ordering is stable
* Floating point rounding uses:
  * `bankersRound`
  * `formatCurrency`

No exceptions.

---

## 6️⃣ What This Contract Forbids (Explicitly)

The engine must NOT:

* Auto-liquidate outside an event
* Auto-add funds
* Generate timestamps
* Generate IDs
* Mutate global state
* Catch and continue after invariant failure
* Emit partial effects

All such behavior must be **outside the engine**.

---

## 7️⃣ Contract Stability

Once implementation begins:

* This contract may only change via:
  * explicit version bump
  * replay migration plan
* No silent evolution

---

## 8️⃣ Mapping to Architecture

This contract aligns exactly with:

| Component | Responsibility |
|-----------|-----------------|
| `index.ts` | Implement Phases 0, 1, 2, 3, 4, 5, 6 |
| `validation/*` | Phase 1 enforcement |
| `domain/calculations/*` | Phase 2 computation |
| `domain/invariants/*` | Phase 3 assertion |
| `execution/*` | Phase 4 orchestration |
| `effects/*` | Phase 5 description |

---

## ✅ Option H Status

**COMPLETED AND FROZEN**

This contract is now the **single execution authority**.

Every implementation file must trace back to exactly one phase.
Every test must validate exactly one phase boundary.
Every failure must map to exactly one error class.

---

## 📋 Next: Option I — Skeleton Generation

With this contract frozen, the skeleton becomes:
* Structurally locked
* Behaviorally deterministic
* Audit-proof
