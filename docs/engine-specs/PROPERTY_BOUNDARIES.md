# Property Boundaries — What the Engine MUST NOT DO

Status: DRAFT (Option G)

Purpose: Explicit list of boundaries, assumptions, and out-of-scope items so tests and implementers avoid false failures.

---

## 1. Core Assumptions (never encoded in engine logic)

- Market data is authoritative and delivered via `UpdatePricesEvent` with timestamps and mark prices.
- Timestamps and IDs are produced by the system (outside engine) and included in events.
- Engine does not call external services, does not fetch prices, and does not generate random values or timestamps.

## 2. Out of Scope for the Engine

The engine will NOT:

- Persist state to a database. Persistence is the responsibility of the system layer consuming `EngineEffect`s.
- Send notifications, emails, or externally visible side effects directly. The engine emits effects; delivery is external.
- Generate IDs or timestamps. IDs and timestamps must be provided in events.
- Make policy decisions that change invariant definitions (e.g., change definition of margin formula). Policies are configuration and must be validated before reaching the engine.

## 3. Validation vs. Execution Boundary

- Validation layer (`validation/`) is the only place invariants may throw.
- Execution layer (`execution/`) MUST NOT perform invariant checks; it only orchestrates and calls pure domain functions.
- Domain (`domain/`) contains pure math/assertions and may contain invariant assertions, but only those that are mathematical (not policy). If a domain assertion fails, it indicates a mathematical bug.

## 4. Which Failures Are Allowed vs Rejected

Allowed rejections (engine returns EngineFailure):
- Malformed events (missing required fields)
- Invalid entity references (account/market not found)
- Violations of input invariants (size<=0, leverage>maxLeverage)
- Stale price usage when the event’s price timestamp is older than allowed (policy enforced at system layer; engine will still validate timestamps per `ENGINE_VALIDATION_ORDER.md`)

Not allowed / Must not happen inside engine:
- Partial state commits — engine must return newState atomically or fail without state change.
- Time-dependent logic that reads wall-clock time inside engine.

## 5. Testing Boundaries

Tests must:
- Provide complete state objects; do not rely on external cron jobs or timers.
- Provide deterministic event sequences (state + event = reproducible result).
- Not mock internal randomizers because there are none.

## 6. Contractual Invariants (Examples)

- The engine may be given an event with a price timestamp older than 5s; the system must reject such events before the engine where required. The engine will still validate timestamp ordering where relevant (e.g., closing timestamps >= open timestamps).

- The engine will not attempt to re-fetch a price; it expects fresh, validated prices.

---

## Next Steps

- Convert these boundaries to test harness rules and a checklist for system integrators.
