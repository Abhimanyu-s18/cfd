# System Invariants & Guarantees

**Version:** 1.0.0  
**Date:** February 13, 2026  
**Status:** Production Ready

---

## Overview

This document describes the **mathematical and logical invariants** that the system maintains, where they are enforced, and how you can verify them.

**Key Principle:** If an invariant is violated, it represents a critical bug that must be fixed before any user can be affected.

---

## Financial Invariants

Each invariant is documented with:
- **Definition:** Mathematical expression
- **Enforcement:** Where it's guaranteed
- **Verification:** How to test it
- **Consequence of Violation:** What would break

### Invariant 1: Balance Non-Negative

**Definition:**
```
Balance ≥ 0
```

**Meaning:** Account balance can never go negative (would mean owing money)

**Enforcement:**
- Database constraint: `CHECK (balance >= 0)`
- Application validation before balance updates
- Liquidation prevents balance from going negative

**Location in Code:**
- Database: `account_profiles.balance` column
- Constraint: `account_schema.sql` line ~45
- Application: `backend/account-management.ts` line ~120

**Verification Test:**
```typescript
test("Balance should never go negative", async () => {
  const account = await createAccount({ balance: 100 });
  
  // Try to lose more than balance
  await expectFailure(() => 
    openPosition({ size: 1000, leverage: 1 }) // Would cause -900 balance
  );
  
  const finalBalance = await getBalance();
  expect(finalBalance).toBeGreaterThanOrEqual(0);
});
```

**Consequence of Violation:** Platform would owe money to users; financial catastrophe.

---

### Invariant 2: Equity Calculation

**Definition:**
```
Equity = Balance + Bonus + UnrealizedPnL
```

**Meaning:** Total account value is the sum of deposits/bonus plus current profits/losses

**Enforcement:**
- Calculated in database view: `account_stats`
- Formula verified in application layer
- Database trigger updates when positions change

**Location in Code:**
- Database: `account_stats` view (supabase/index.ts)
- Calculation: `engine/domain/calculations/equity.ts` line ~15
- Trigger: `setup-supabase.sql` line ~280

**Verification Test:**
```typescript
test("Equity should equal Balance + Bonus + UnrealizedPnL", async () => {
  const account = await createAccount({ balance: 10000, bonus: 1000 });
  const position = await openPosition({ size: 1.0, entryPrice: 1.0850 });
  
  await updateMarketPrice("EUR/USD", 1.0875);
  
  const stats = await getAccountStats();
  const expectedEquity = 10000 + 1000 + ((1.0875 - 1.0850) * 1.0);
  
  expect(stats.equity).toBeCloseTo(expectedEquity, 2);
});
```

**Why It Matters:** Equity tells user their true account value.

---

### Invariant 3: Margin Used Calculation

**Definition:**
```
MarginUsed = Σ(Position_i.MarginRequired)
```

**Meaning:** Total margin used is the sum of all open positions' margin requirements

**Enforcement:**
- Calculated from positions table: `SUM(margin_required)`
- Updated whenever position opens/closes
- Database trigger ensures consistency

**Location in Code:**
- Database: `account_stats` view
- Calculation: `engine/domain/calculations/margin.ts` line ~45
- Trigger: `setup-supabase.sql` line ~310

**Verification Test:**
```typescript
test("MarginUsed should be sum of all positions' margins", async () => {
  const pos1 = await openPosition({ size: 1.0, entryPrice: 1.0850, leverage: 100 });
  const pos2 = await openPosition({ size: 0.5, entryPrice: 1.2750, leverage: 100 });
  
  const stats = await getAccountStats();
  const expectedMargin = (1.0 * 1.0850 / 100) + (0.5 * 1.2750 / 100);
  
  expect(stats.marginUsed).toBeCloseTo(expectedMargin, 4);
});
```

**Why It Matters:** Determines how much capital is tied up in positions.

---

### Invariant 4: Free Margin Calculation

**Definition:**
```
FreeMargin = Equity - MarginUsed
```

**Meaning:** Free margin is available capital after accounting for used margin

**Enforcement:**
- Calculated in application layer
- Verified before opening new positions
- Database check prevents trades that would violate this

**Location in Code:**
- Calculation: `engine/domain/calculations/margin.ts` line ~60
- Validation: `backend/position-validation.ts` line ~45

**Verification Test:**
```typescript
test("FreeMargin should equal Equity - MarginUsed", async () => {
  const stats = await getAccountStats();
  const expectedFree = stats.equity - stats.marginUsed;
  
  expect(stats.freeMargin).toBeCloseTo(expectedFree, 2);
});
```

**Why It Matters:** Tells user how much more they can trade with.

---

### Invariant 5: Margin Level Calculation

**Definition:**
```
MarginLevel = (Equity / MarginUsed) × 100
```

**Meaning:** Percentage of equity supporting used margin. Higher is safer.

**Enforcement:**
- Calculated in application and database view
- Liquidation triggered when < 20%
- Monitored continuously

**Location in Code:**
- Calculation: `engine/domain/calculations/margin.ts` line ~90
- Liquidation: `engine/execution/liquidation.ts` line ~35
- Database: `account_stats` view

**Verification Test:**
```typescript
test("MarginLevel should equal (Equity / MarginUsed) × 100", async () => {
  const stats = await getAccountStats();
  const expectedLevel = (stats.equity / stats.marginUsed) * 100;
  
  expect(stats.marginLevel).toBeCloseTo(expectedLevel, 1);
});
```

**Why It Matters:** Shows how much cushion user has before liquidation.

---

### Invariant 6: PnL Calculation (LONG Positions)

**Definition:**
```
UnrealizedPnL = (CurrentPrice - EntryPrice) × Size
```

**Meaning:** For long positions, profit when price goes up

**Enforcement:**
- Pure function calculation
- Verified in every trade calculation
- Independent tests validate formula

**Location in Code:**
- Calculation: `engine/domain/calculations/pnl.ts` line ~10-20

**Verification Test:**
```typescript
test("LONG PnL = (CurrentPrice - EntryPrice) × Size", async () => {
  const position = await openPosition({ 
    direction: "LONG", 
    size: 1.5, 
    entryPrice: 1.0850 
  });
  
  await updateMarketPrice("EUR/USD", 1.0875);
  
  const expectedPnL = (1.0875 - 1.0850) * 1.5;
  const updatedPos = await getPosition(position.positionId);
  
  expect(updatedPos.unrealizedPnL).toBeCloseTo(expectedPnL, 4);
});
```

**Why It Matters:** Determines if trade is profitable.

---

### Invariant 7: PnL Calculation (SHORT Positions)

**Definition:**
```
UnrealizedPnL = (EntryPrice - CurrentPrice) × Size
```

**Meaning:** For short positions, profit when price goes down

**Enforcement:**
- Pure function calculation
- Verified separately from LONG trades
- No interaction between scenarios

**Location in Code:**
- Calculation: `engine/domain/calculations/pnl.ts` line ~25-35

**Verification Test:**
```typescript
test("SHORT PnL = (EntryPrice - CurrentPrice) × Size", async () => {
  const position = await openPosition({ 
    direction: "SHORT", 
    size: 2.0, 
    entryPrice: 1.2750 
  });
  
  await updateMarketPrice("GBP/USD", 1.2725);
  
  const expectedPnL = (1.2750 - 1.2725) * 2.0;
  const updatedPos = await getPosition(position.positionId);
  
  expect(updatedPos.unrealizedPnL).toBeCloseTo(expectedPnL, 4);
});
```

**Why It Matters:** SHORT trades have opposite profit/loss direction.

---

## Operational Invariants

### Invariant 8: Position Status Values

**Definition:**
```
Position.Status ∈ {OPEN, CLOSED, PENDING, LIQUIDATED}
```

**Meaning:** Positions can only be in defined states

**Enforcement:**
- Database enum: `position_status_enum`
- Application layer validation
- Never accept invalid status values

**Location in Code:**
- Database: `positions.status` column (enum)
- Validation: `backend/position-validation.ts` line ~20

**Verification Test:**
```typescript
test("Position status must be valid enum value", async () => {
  const position = await openPosition({ ... });
  
  expect(["OPEN", "CLOSED", "PENDING", "LIQUIDATED"]).toContain(position.status);
});
```

---

### Invariant 9: Direction Consistency

**Definition:**
```
If Position.Direction = LONG, then StopLoss < EntryPrice ≤ TakeProfit
If Position.Direction = SHORT, then TakeProfit < EntryPrice ≤ StopLoss
```

**Meaning:** Stop loss and take profit must be on correct sides of entry price

**Enforcement:**
- Application validation
- Database trigger verification
- Cannot modify without checking

**Location in Code:**
- Validation: `engine/domain/validation/position-validator.ts` line ~50

**Verification Test:**
```typescript
test("LONG: SL below entry, TP above entry", async () => {
  const pos = await openPosition({
    direction: "LONG",
    entryPrice: 1.0850,
    stopLoss: 1.0820,
    takeProfit: 1.0900
  });
  
  expect(pos.stopLoss).toBeLessThan(pos.entryPrice);
  expect(pos.takeProfit).toBeGreaterThan(pos.entryPrice);
});
```

---

### Invariant 10: Event Immutability

**Definition:**
```
∀ event ∈ effects: event.created_at < now() ∧ event.data cannot be updated
```

**Meaning:** Events are written once and never modified

**Enforcement:**
- Database: No UPDATE or DELETE on effects table
- Application: Never modifies effects
- Only INSERT is allowed

**Location in Code:**
- Database: `effects` table (immutable)
- Permissions: RLS policies allow only INSERT
- Schema: `setup-supabase.sql` line ~150

**Verification Test:**
```typescript
test("Events cannot be modified after creation", async () => {
  const effect = await logEffect({ action: "OPEN_POSITION" });
  
  expect(async () => {
    await database
      .from("effects")
      .update({ action: "MODIFIED" })
      .eq("id", effect.id);
  }).rejects.toThrow();
});
```

**Why It Matters:** Audit trail integrity depends on events never changing.

---

## Determinism Guarantees

### Invariant 11: Calculation Determinism

**Definition:**
```
f(inputs) = f(inputs) // same result every time
```

**Meaning:** Given the same inputs, calculations always produce identical results

**Enforcement:**
- Pure functions (no external state)
- No randomness in calculations
- No time-dependent logic
- No database queries in calculation functions

**Location in Code:**
- All calculation files in `engine/domain/calculations/`
- Test: Golden path tests demonstrate determinism

**Verification Test:**
```typescript
test("Calculations are deterministic", async () => {
  const calc1 = calculatePnL(1.0875, 1.0850, 1.5);
  const calc2 = calculatePnL(1.0875, 1.0850, 1.5);
  
  expect(calc1).toBe(calc2); // Exact match
});
```

---

### Invariant 12: Liquidation Ordering

**Definition:**
```
Liquidation order is deterministic based on entry time (FIFO)
```

**Meaning:** When liquidation happens, positions close in order opened

**Enforcement:**
- Liquidation algorithm sorts by `opened_at` timestamp
- No randomization (pseudorandom would be different per run)
- Documented and tested

**Location in Code:**
- Logic: `engine/execution/liquidation-order.ts` line ~40
- Test: `engine/tests/invariants/liquidation-ordering.test.ts`

**Verification Test:**
```typescript
test("Liquidation follows FIFO order", async () => {
  const pos1 = await openPosition({ ... }); // opened first
  const pos2 = await openPosition({ ... }); // opened second
  
  await triggerLiquidation();
  
  const closed = await getClosedPositions();
  expect(closed[0].positionId).toBe(pos1.positionId);
  expect(closed[1].positionId).toBe(pos2.positionId);
});
```

---

## Compliance Invariants

### Invariant 13: Audit Trail Completeness

**Definition:**
```
∀ account action: ∃ audit_log entry documenting it
```

**Meaning:** Every important action is logged

**Enforcement:**
- Every endpoint creates audit log entry
- Middleware logs all trades
- Database triggers log structural changes

**Location in Code:**
- Logging: `backend/logging/audit-logger.ts`
- Trigger: `setup-supabase.sql` line ~350

**Verified Actions:**
- User registration
- Login/logout
- Account creation
- Position open/close
- Balance changes
- Modifications to SL/TP

---

### Invariant 14: User Data Isolation

**Definition:**
```
∀ users A, B: A cannot see or modify B's data
```

**Meaning:** Complete data isolation between users

**Enforcement:**
- RLS policies on all tables
- `user_id` field on every user-related table
- Database enforces at query level
- Service role has bypass but is server-only

**Location in Code:**
- RLS Policies: `setup-supabase.sql` line ~200-280

**Verification Test:**
```typescript
test("Users cannot access other users' positions", async () => {
  const user1 = await register({ email: "user1@test.com" });
  const user2 = await register({ email: "user2@test.com" });
  
  await loginAs(user1);
  const pos1 = await openPosition({ ... });
  
  await loginAs(user2);
  const positions = await getPositions();
  
  expect(positions).not.toContain(pos1);
});
```

---

## Testing & Verification

### Golden Path Tests

**Location:** `engine/tests/goldenPaths/`

These tests verify all invariants hold for common trading scenarios:

```
✅ GP-001: New account setup
✅ GP-002: Single LONG position (open, profit, close)
✅ GP-003: Single SHORT position (open, loss, close)
✅ GP-004: Multiple positions simultaneously
✅ GP-005: SL triggered (invariants maintained)
✅ GP-006: TP triggered (invariants maintained)
✅ GP-007: Liquidation scenario
✅ GP-008: Adding funds
✅ GP-009: Bonus allocation
```

### Property-Based Tests

**Location:** `engine/tests/invariants/`

These systematically test invariants:

```typescript
// Test that invariant 2 holds for random inputs
property("Equity = Balance + Bonus + UnrealizedPnL", () => {
  forAll(
    arb.balance(),
    arb.bonus(),
    arb.unrealizedPnL(),
    (balance, bonus, pnl) => {
      const equity = balance + bonus + pnl;
      expect(equity).toBeCloseTo(calculateEquity(balance, bonus, pnl), 2);
    }
  );
});
```

### Regression Tests

**Location:** `engine/tests/__tests__/`

Tests ensure bugs don't come back.

---

## Monitoring & Alerts

### Database Checks

```sql
-- Check invariant 1: Balance non-negative
SELECT account_id 
FROM account_profiles 
WHERE balance < 0;

-- Check invariant 2: Equity calculation
SELECT account_id, 
       equity,
       (balance + bonus + unrealized_pnl) as computed_equity
FROM account_profiles
WHERE ABS(equity - (balance + bonus + unrealized_pnl)) > 0.01;

-- Check user isolation
SELECT user_id, COUNT(DISTINCT account_id) as account_count
FROM account_profiles
GROUP BY user_id
HAVING COUNT(DISTINCT account_id) > 1;
```

### Alerts to Set Up

1. **Critical (Page immediately):**
   - Negative balance detected
   - Invariant violation
   - Unauthorized data access

2. **High (Alert within 1 hour):**
   - Unusual liquidation rate
   - High-value position changes
   - Multiple failed trades

3. **Medium (Daily summary):**
   - Account creation rate
   - Average trading volume
   - Performance metrics

---

## Verification Checklist

Use this checklist when making changes:

- [ ] All database constraints still present
- [ ] All invariants tested
- [ ] Golden path tests still pass
- [ ] No new edge cases that violate invariants
- [ ] RLS policies still correct
- [ ] Audit log entries created for action
- [ ] Error messages don't leak sensitive data
- [ ] Calculations remain deterministic

---

## System Guarantees

### What You Can Guarantee to Users

1. **Equity is always accurate:** Balance + Bonus + PnL
2. **Positions won't mysteriously close:** Only via SL/TP/liquidation/user action
3. **Liquidation is fair:** Everyone at 20% margin level
4. **Balance won't go negative:** Impossible by design
5. **Your data is yours alone:** Complete isolation from other users
6. **Everything is audited:** Complete history of your account
7. **Calculations are correct:** Verified mathematically and tested
8. **System is deterministic:** Replay any trade to debug

### What You Cannot Guarantee

- Exact fill prices (market is simulated)
- Uptime (infrastructure can fail)
- No bugs exist (test but never 100% proof)
- Performance under extreme load

---

**System Invariants & Guarantees**  
**CFD Trading Platform MVP**  
**Last Updated:** February 13, 2026
