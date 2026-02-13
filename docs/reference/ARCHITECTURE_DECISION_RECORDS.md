# Architecture Decision Records (ADRs)

## ADR-001: Microservices Architecture with Supabase Edge Functions

**Date:** February 13, 2026  
**Status:** Accepted

### Context

We needed to decide how to structure the backend of our CFD trading platform. We had several options:
1. Monolithic Express.js server
2. Microservices with separate Lambda functions
3. Supabase Edge Functions with PostgreSQL
4. Serverless with AWS Step Functions

### Decision

We chose **Supabase Edge Functions with PostgreSQL** for the following reasons:

### Rationale

1. **Rapid Development**: Reduces setup time, focuses on business logic
2. **Database-Driven Security**: RLS policies enforced at database level
3. **Built-in Authentication**: JWT-based with minimal setup
4. **Scalability**: Automatically scales with traffic
5. **Cost Efficiency**: Pay only for what you use
6. **Real-time Capabilities**: PostgreSQL LISTEN/NOTIFY for live updates
7. **Developer Experience**: Simple HTTP functions with TypeScript support

### Consequences

**Positive:**
- Very fast development cycle
- Tight database integration
- Security enforced at data layer
- No server management overhead
- Automatic backups and replication

**Negative:**
- Vendor lock-in to Supabase
- Edge functions have cold start latency (acceptable for our use case)
- Limited local testing without Supabase emulator
- Less control over compute environment

### Alternative Considered

- **Express.js**: More control, but requires infrastructure management
- **AWS Lambda**: More complex, higher baseline cost

---

## ADR-002: Layered Architecture with Separation of Concerns

**Date:** February 13, 2026  
**Status:** Accepted

### Context

We needed to decide how to organize business logic, database access, and domain logic to ensure maintainability and testability.

### Decision

**Three-layer architecture:**
```
Frontend (React UI only - no business logic)
    ↓
Backend (Edge Functions - validation and orchestration)
    ↓
Database (PostgreSQL - data storage and constraint enforcement)
```

### Rationale

1. **Clear Responsibilities:**
   - Frontend: Presentation and user interaction only
   - Backend: Validation, business rules, orchestration
   - Database: Data persistence, constraint enforcement

2. **Testability:**
   - Each layer can be tested independently
   - Pure functions in business logic
   - RLS policies tested at database layer

3. **Security:**
   - No business logic secrets in frontend
   - Backend validates all inputs
   - Database enforces invariants via constraints

4. **Scalability:**
   - Frontend can be served from CDN
   - Backend scales independently
   - Database handles persistence

### Consequences

**Positive:**
- Clear responsibility boundaries
- Easy to test each layer
- Easy to replace layers (e.g., swap frontend framework)
- Security through constraint enforcement
- Deterministic behavior in database

**Negative:**
- Extra network round trips
- Slightly more latency
- Requires coordination between layers
- Migrations require careful planning

---

## ADR-003: Event Sourcing for Trade History

**Date:** February 13, 2026  
**Status:** Accepted

### Context

We needed a way to:
1. Maintain an immutable audit trail of all trades
2. Support deterministic replay of trading engine state
3. Ensure regulatory compliance with trade history
4. Enable debugging and customer support

### Decision

**Event Sourcing pattern:**
- Store all trading events in immutable `effects` table
- Store calculations snapshots in `engine_states` table
- Replay events to compute current state when needed

### Rationale

1. **Audit Trail:** Every action is recorded with timestamp and actor
2. **Compliance:** Can prove exactly what happened and when
3. **Debugging:** Can replay any account's history to debug issues
4. **Recovery:** Can recover from errors by replaying to specific point
5. **Determinism:** Pure functions + event log = reproducible state

### Consequences

**Positive:**
- Complete audit trail
- Can debug any issue
- Deterministic state computation
- Can compute historical states
- Easy to add new calculations

**Negative:**
- Extra storage needed
- Need to manage event versions
- Must handle schema evolution
- Slightly slower real-time queries (minimal with snapshots)

---

## ADR-004: PostgreSQL Constraints for Invariant Enforcement

**Date:** February 13, 2026  
**Status:** Accepted

### Context

We needed to ensure that the state of trading accounts is always consistent with mathematical invariants:
- Balance ≥ 0
- Equity = Balance + UnrealizedPnL
- MarginUsed = Sum(Position Margins)
- FreeMargin = Equity - MarginUsed

We could enforce these either:
1. In application code (Python, TypeScript)
2. In database constraints and triggers
3. Both (defense in depth)

### Decision

**Enforce at database layer with checks and triggers**, backed by application validation.

### Rationale

1. **Impossible to Violate:** Database won't accept invalid state even if app has bugs
2. **Decoupled:** Works regardless of which client talks to database
3. **Performance:** Calculated once at database level
4. **Compliance:** Guarantees financial data accuracy
5. **Testing:** Can test constraints independently

### Database Constraints

```sql
-- Balance never negative
ALTER TABLE account_profiles 
ADD CONSTRAINT balance_non_negative 
CHECK (balance >= 0);

-- Equity includes all components
ALTER TABLE account_profiles
ADD CONSTRAINT equity_calculation_valid
CHECK (equity >= 0);

-- Margin used is positive
ALTER TABLE account_profiles
ADD CONSTRAINT margin_used_non_negative
CHECK (margin_used >= 0);
```

### Consequences

**Positive:**
- Impossible to violate invariants
- Clear intent (constraints document business rules)
- Easy to audit (query constraints directly)
- Works for all clients

**Negative:**
- Database schema is tightly coupled to business logic
- Schema changes require downtime (careful migration planning)
- Makes testing without database harder

---

## ADR-005: Pure Functions for Financial Calculations

**Date:** February 13, 2026  
**Status:** Accepted

### Context

Financial calculations must be:
- Deterministic (same inputs = same output)
- Testable (no side effects)
- Verifiable (can be audited independently)
- Repeatable (for debugging and compliance)

### Decision

**All financial calculations are pure functions:**
- No side effects
- No external state
- No randomness
- No I/O operations

### Example

```typescript
// ✅ GOOD: Pure function
function calculateMarginRequired(
  size: number, 
  price: number, 
  leverage: number
): number {
  return (size * price) / leverage;
}

// ❌ BAD: Not pure (has side effect)
async function calculateMarginRequired(size, price, leverage) {
  const rate = await fetchExchangeRate();
  return (size * price * rate) / leverage;
}
```

### Rationale

1. **Testability:** Easy to test (no mocking needed)
2. **Determinism:** Same input always produces same output
3. **Auditability:** Can verify calculations independently
4. **Performance:** Can be cached easily
5. **Debugging:** Can replay exactly what happened

### Implementation

- Financial calculations in `engine/domain/calculations`
- No I/O (no database calls, no API calls)
- All inputs passed as parameters
- Return only calculated value

### Consequences

**Positive:**
- Extremely testable
- Easy to verify correct
- Easy to audit
- Performance optimizable

**Negative:**
- Need to fetch external state before calling
- Slightly more code to pass data
- Can't use shortcuts (e.g., look up rate in function)

---

## ADR-006: Row-Level Security (RLS) for Multi-Tenant User Data

**Date:** February 13, 2026  
**Status:** Accepted

### Context

Multiple users have trading accounts. We need to ensure:
- Users can only see their own data
- Users cannot access other users' accounts
- No SQL injection vulnerabilities from user data
- Consistent enforcement across all queries

### Decision

**Use PostgreSQL Row-Level Security (RLS) policies:**
```sql
ALTER TABLE account_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own account"
    ON account_profiles
    USING (user_id = current_user_id());
```

### Rationale

1. **Enforcement at Database:** Can't be bypassed even if backend is compromised
2. **Transparent:** Works with regular SQL queries
3. **Consistent:** Applied to all queries on table
4. **Scalable:** No need to add filters in every query
5. **Testing:** Can test security independently

### Policies Implemented

- Account profiles: Users see only their own
- Positions: Users see only their positions
- Effects: Users see only their effects
- Audit logs: Users see only their audit logs

### Consequences

**Positive:**
- Impossible to leak data to wrong user
- Security independent of application code
- Easier to audit (policies in database)

**Negative:**
- Must configure policies correctly (risk of misconfiguration)
- Testing requires database setup
- Service role queries bypass RLS (need careful handling)
- Row-level policies can be slower for large tables

---

## ADR-007: Leverage Limits (1:1 to 1:500)

**Date:** February 13, 2026  
**Status:** Accepted

### Context

Leverage amplifies gains and losses. We needed to decide:
- What leverage limits should we allow?
- Should limits be fixed or configurable?
- How do we handle illegal leverage values?

### Decision

**Allow leverage from 1:1 to 1:500**, with database constraint enforcement:
- Minimum: 1:1 (no leverage)
- Maximum: 1:500 (high risk)
- Configurable per instrument
- Enforced at database level

### Rationale

1. **Regulatory:** Most jurisdictions allow up to 1:30 or 1:50; we allow more for simulation
2. **Risk:** Maximum acceptable loss simulation
3. **Education:** Allows users to see extreme scenarios
4. **Paper Trading:** No real money at risk, so higher is acceptable
5. **Safety:** Database prevents invalid leverage values

### Database Constraint

```sql
ALTER TABLE positions
ADD CONSTRAINT leverage_valid 
CHECK (leverage >= 1 AND leverage <= 500);
```

### Consequences

**Positive:**
- Users can experiment with leverage
- Educational value for risk learning
- Impossible to set invalid leverage

**Negative:**
- Higher simulated losses
- Might give false confidence for real trading
- May need warnings about extreme leverage

---

## ADR-008: Liquidation at 20% Margin Level

**Date:** February 13, 2026  
**Status:** Accepted

### Context

We need to decide when positions are automatically liquidated to prevent negative equity:
- At what margin level should liquidation trigger?
- Should this be per-position or account-wide?
- How do we handle edge cases?

### Decision

**Liquidate all positions when account margin level reaches 20%**

- Margin Level = (Equity / MarginUsed) × 100
- Liquidation Level = 20%
- Applied account-wide (not per-position)
- Deterministic ordering (by entry time, oldest first)

### Rationale

1. **Protection:** Prevents negative equity
2. **Fairness:** Same rules for all users
3. **Simplicity:** Single rule is easy to understand and test
4. **Industry Standard:** Common liquidation threshold
5. **Safety Buffer:** 20% gives room before negative equity

### Liquidation Process

1. Detect when margin level < 20%
2. Liquidate positions oldest-first
3. Continue until margin level ≥ 50% or no positions remain
4. Record liquidation event

### Consequences

**Positive:**
- Prevents negative balances
- Easy to understand for users
- Deterministic (always same order)

**Negative:**
- All positions closed, not just smallest
- Sudden loss of all open positions
- May close profitable positions

---

## ADR-009: Transaction Isolation Level

**Date:** February 13, 2026  
**Status:** Accepted

### Context

Multiple requests could modify the same account simultaneously:
- Opening a position
- Adding funds
- Market price updates
- Liquidation checks

We needed to decide transaction isolation to prevent:
- Phantom reads (race conditions)
- Dirty reads (inconsistent state)
- Lost updates (overwriting each other)

### Decision

**Use SERIALIZABLE isolation level** for critical operations:
- Opening positions
- Closing positions
- Liquidation checks
- Updating account balance

### SQL Configuration

```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

BEGIN;
  -- All operations in this transaction
  UPDATE account_profiles SET equity = ... WHERE user_id = ?;
  INSERT INTO positions VALUES (...);
COMMIT;
```

### Rationale

1. **Correctness:** Prevents all race conditions
2. **Financial:** Money should never be lost to race conditions
3. **Simplicity:** No need to handle partial failures
4. **Testing:** Easier to reason about concurrent behavior

### Consequences

**Positive:**
- Impossible to have race conditions
- Correct financial calculations
- Easy to debug (no concurrency bugs)

**Negative:**
- Slightly slower (serialization overhead)
- Possible serialization failures (retry needed)
- Higher database resource usage

---

## ADR-010: Design Pattern - State Snapshots with Event Log

**Date:** February 13, 2026  
**Status:** Accepted

### Context

We have an event sourcing approach (ADR-003) but need efficient queries for current state.

Options:
1. Replay all events every time (slow)
2. Store current state only (loses audit trail)
3. Snapshots + event log (best of both)

### Decision

**Store snapshots in `engine_states` table alongside event log:**
- Events: Immutable record of everything that happened
- Snapshots: Periodic snapshots for fast current queries
- Snapshots made every N events or daily

### Implementation

```sql
-- Events: immutable audit trail
CREATE TABLE effects (
  id UUID PRIMARY KEY,
  account_id UUID,
  action VARCHAR,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Snapshots: current state cache
CREATE TABLE engine_states (
  account_id UUID PRIMARY KEY,
  balance DECIMAL,
  equity DECIMAL,
  margin_used DECIMAL,
  snapshot_at TIMESTAMP,
  events_processed INT
);
```

### Rationale

1. **Query Performance:** Current queries don't need to replay all events
2. **Audit Trail:** Complete history still available
3. **Recovery:** Can rebuild snapshots from events
4. **Compliance:** Keep immutable records for regulations

### Consequences

**Positive:**
- Fast queries for current state
- Complete audit trail
- Can verify snapshots are correct by replay

**Negative:**
- Extra storage needed
- Must keep snapshots updated
- Potential for stale snapshots (need monitoring)

---

## Summary of Architectural Decisions

| ADR | Title | Status | Key Principle |
|-----|-------|--------|---------------|
| 001 | Supabase Architecture | ✅ Accepted | Rapid development, built-in security |
| 002 | Three-Layer Architecture | ✅ Accepted | Separation of concerns |
| 003 | Event Sourcing | ✅ Accepted | Audit trail and determinism |
| 004 | DB Constraints | ✅ Accepted | Invariant enforcement |
| 005 | Pure Functions | ✅ Accepted | Testability and determinism |
| 006 | Row-Level Security | ✅ Accepted | Multi-tenant data isolation |
| 007 | Leverage Limits | ✅ Accepted | Risk management |
| 008 | Liquidation Rules | ✅ Accepted | Account protection |
| 009 | Transaction Isolation | ✅ Accepted | Race condition prevention |
| 010 | Snapshots + Events | ✅ Accepted | Performance + compliance |

---

**Architecture Decision Records**  
**CFD Trading Platform**  
**Last Updated:** February 13, 2026
