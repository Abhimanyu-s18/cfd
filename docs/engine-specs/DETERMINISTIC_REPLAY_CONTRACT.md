# Deterministic Replay Contract

Status: DRAFT (Option G)

Purpose: Define the exact deterministic contract for replaying events against engine state. This enables audits, backtests, and deterministic debugging.

---

## Core Contract

- Signature: `EngineResult = runEngine(EngineState, EngineEvent)`
- Determinism requirement: For any given `EngineState S` and `EngineEvent E`, `runEngine(S, E)` must always return the identical `EngineResult` (same `success`, `newState`, `effects`, and `error` objects) on every execution, on any machine, at any time.

## Prohibitions (to guarantee determinism)

The engine must not:
- Call `Date.now()` or similar wall-clock APIs.
- Use randomness (`Math.random()`, UUID generation, etc.).
- Perform I/O (database, network, filesystem).
- Read environment variables at runtime to change logic.

## Required Event Properties

Every event MUST include the following fields (system responsibility):
- `timestamp`: ISO 8601 string — used only for ordering and temporal validation (engine does not generate it).
- `positionId`, `accountId`, `marketId` as required by event type.
- `executionPrice` / `prices` when price data is required.

The engine will validate temporal ordering where relevant (e.g., `CLOSE_POSITION.timestamp >= position.openedAt`). If temporal ordering fails, engine returns EngineFailure and does not mutate state.

## Replay File Format (Recommendation)

A replay is an ordered list of records:

```
{
  "initialState": { ... EngineState ... },
  "events": [ { event1 }, { event2 }, ... ]
}
```

Replay runner behaviour:
- Start with `initialState`
- For each event in `events` in provided order, call `runEngine(state, event)`
- If any invocation returns `success=false`, stop replay and record failure details
- The final `newState` is the replay result

## Deterministic Effects

Effects produced by the engine must be deterministic and include stable identifiers only derived from event data and existing state fields. Effects must be emitted in a stable, deterministic order. Effects must not contain generated timestamps or random IDs. If the system needs to timestamp effects, it must do so outside the engine.

## Versioning and Compatibility

- Every replay file MUST include `engineVersion` that maps to the codebase commit/tag.
- If the state shape changes, old replays must either be migrated by a deterministic transformer or rejected explicitly.

## Audit Log Requirements

- Every effect emitted during execution must be persisted by the system with the `engineVersion` and the input event reference.
- This allows one-to-one mapping from event → effect(s) during an audit.

---

## Example: Minimal Replay Runner (pseudo)

```
state = initialState
for event in events:
  result = runEngine(state, event)
  if not result.success:
    write failure and stop
  state = result.newState
```

---

## Next Steps

- Add a small `replay-runner` utility (system-level) that validates replay JSON schema, enforces `engineVersion`, and executes runs using a pinned engine build.
- Create a canonical replay for GP-1..GP-3 as examples.
