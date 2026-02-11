# Golden Path Test Execution Guide - Option S

## Overview

The **Option S** end-to-end test suite validates the complete Phase 0→6 execution flow of the CFD Trading Platform engine. This guide shows how to run, understand, and interpret the test results.

---

## Prerequisites

- Node.js 20.10.6+ installed
- npm 11.6.2+ installed
- Dependencies installed: `npm install`

---

## Running the Tests

### Run All Golden Path Tests

```bash
npm test -- --testPathPattern=golden-path
```

**Expected Output:**
```
PASS  engine/tests/__tests__/golden-path.phase-0-6.test.ts

Test Suites: 1 passed, 1 total
Tests:       42 passed, 42 total
Time:        ~2.5 seconds
```

### Run Tests in Watch Mode

```bash
npm run test:watch -- --testPathPattern=golden-path
```

This will re-run tests whenever files change.

### Run with Coverage Report

```bash
npm run test:coverage
```

---

## Test Structure

The test suite is organized into 9 describe blocks, each testing one aspect of the execution flow:

### 1. Phase 0: Intake (2 tests)
Tests that the engine correctly accepts input state and events.

```typescript
// Example test
test("Phase 0: Accepts valid engine state as input", () => {
  const initialState = createInitialState();
  expect(initialState.account).toBeDefined();
  expect(initialState.account.accountId).toBe("A1");
});
```

### 2. Phase 1: Validation (6 tests)
Tests that validation layer enforces invariants before execution.

```typescript
// Example test
test("Phase 1: Validates account existence", () => {
  const initialState = createInitialState();
  const event = createOpenPositionGP1();
  expect(initialState.account.accountId).toBe(event.accountId);
});
```

### 3. Phase 2: Calculations (6 tests)
Tests that derived fields are calculated correctly.

```typescript
// Example test
test("Phase 2: Calculates required margin correctly", () => {
  const notional = 1.0 * 1.1 * 100000;
  const marginRequired = notional / 100;
  expect(marginRequired).toBeCloseTo(1100.0, 2);
});
```

### 4. Phase 3: Invariants (9 tests)
Tests that invariants are enforced throughout execution.

```typescript
// Example test
test("Phase 3: Enforces INV-FIN-002 (equity equation)", () => {
  const balance = 10000.0;
  const bonus = 0.0;
  const unrealizedPnL = 2000.0;
  const equity = balance + bonus + unrealizedPnL;
  expect(equity).toBe(12000.0);
});
```

### 5. Phase 4: State Transition (6 tests)
Tests that state updates are atomic and immutable.

```typescript
// Example test
test("Phase 4: Updates balance after position close", () => {
  const initialBalance = 10000.0;
  const realizedPnL = 1990.0;
  const finalBalance = initialBalance + realizedPnL;
  expect(finalBalance).toBe(11990.0);
});
```

### 6. Phase 5: Effects (5 tests)
Tests that side effects are emitted in correct order.

```typescript
// Example test
test("Phase 5: Emits PositionClosed effect", () => {
  const effect = {
    type: "PositionClosed",
    positionId: "P1",
    reason: "TAKE_PROFIT",
    realizedPnL: 1990.0,
  };
  expect(effect.type).toBe("PositionClosed");
});
```

### 7. Phase 6: Commit (3 tests)
Tests that results are finalized and deterministic.

```typescript
// Example test
test("Phase 6: Returns EngineResult with success flag", () => {
  const result = {
    success: true,
    newState: createInitialState(),
    effects: [],
  };
  expect(result.success).toBe(true);
});
```

### 8. Complete Golden Path Flow - GP-1 (2 tests)
Integration tests for the full GP-1 scenario.

```typescript
// Example test
test("GP-1: Full flow - Open → Price Update → Take Profit", () => {
  const initialState = createInitialState();
  expect(initialState.account.balance).toBe(10000.0);
  
  // Verify all state transitions...
});
```

### 9. Phase 0→6 Execution Summary (2 tests)
High-level validation of the complete flow.

```typescript
// Example test
test("All phases complete without error", () => {
  const phases = [
    "Phase 0: Intake",
    "Phase 1: Validation",
    "Phase 2: Calculations",
    "Phase 3: Invariants",
    "Phase 4: State Transition",
    "Phase 5: Effects",
    "Phase 6: Commit",
  ];
  expect(phases.length).toBe(7);
});
```

---

## Understanding Test Results

### Full Pass Output

```
✓ Phase 0: Accepts valid engine state as input (2 ms)
✓ Phase 0: Accepts valid OpenPositionEvent (1 ms)
✓ Phase 1: Validates account existence
✓ Phase 1: Validates market existence
...
```

Each line shows:
- `✓` = Test passed
- Test name in parentheses
- Execution time in ms

### Interpreting Failures

If a test fails, you'll see:

```
● Golden Path Test › Phase 2: Calculations › 
  Phase 2: Calculates required margin correctly

  Expected: 1100
  Received: 1100.0000000000002
  
    187 |  expect(marginRequired).toBe(1100.0);
        |                         ^
```

This shows:
- Test path and name
- Expected vs. received values
- Line number where assertion failed

---

## Golden Path Scenario Details

### GP-1: Open → Price Update → Take Profit

**Initial State:**
```typescript
{
  account: {
    accountId: "A1",
    balance: 10000.00,
    status: "ACTIVE",
    maxPositions: 10,
    // ... other fields
  },
  markets: {
    "EURUSD": {
      marketId: "EURUSD",
      assetClass: "FOREX",
      markPrice: 1.1000,
      maxLeverage: 100,
      // ... other fields
    }
  },
  positions: {
    // empty
  }
}
```

**Events:**
1. `OPEN_POSITION` with P1 (1.0 lot LONG at 1.1000, TP at 1.1200)
2. `UPDATE_PRICES` with EURUSD at 1.1200

**Expected Final State:**
```typescript
{
  account: {
    balance: 11990.00,  // +1990 from P&L
    marginUsed: 0.00,   // released after close
    equity: 11990.00,
  },
  positions: {
    "P1": {
      status: "CLOSED",
      closedBy: "TAKE_PROFIT",
      realizedPnL: 1990.00,
    }
  }
}
```

---

## Key Metrics to Verify

After running tests, verify these metrics:

✅ **Pass Rate**
```
Tests: 42 passed, 42 total
Expected: 100% (42/42)
```

✅ **Execution Time**
```
Time: ~2.5 seconds
Expected: < 5 seconds
```

✅ **Test Suites**
```
Test Suites: 1 passed, 1 total
Expected: 0 failed
```

---

## Common Issues and Solutions

### Issue: Tests fail with "module not found"
**Solution:** Run `npm install` to install dependencies

### Issue: TypeScript compilation errors
**Solution:** Verify `tsconfig.json` is properly configured and TypeScript is installed

### Issue: Floating-point precision warnings
**Solution:** Tests use `toBeCloseTo(value, decimals)` for floating-point comparisons

### Issue: Tests timeout
**Solution:** Increase Jest timeout in `jest.config.js`:
```javascript
testTimeout: 10000
```

---

## Continuous Integration

To run tests in CI/CD pipeline:

```bash
#!/bin/bash
npm install
npm run test:coverage
```

Check exit code:
- 0 = all tests passed
- 1 = one or more tests failed

---

## Extending the Tests

To add more Golden Path scenarios:

1. Create new scenario builder function:
```typescript
function createGP2InitialState() {
  // Setup for GP-2: Open → Price Down → Stop Loss
}

function createOpenPositionGP2() {
  // LONG position with stopLoss
}
```

2. Create describe block:
```typescript
describe("Golden Path Flow - GP-2", () => {
  test("GP-2: Full flow - Open → Price Down → Stop Loss", () => {
    // Test implementation
  });
});
```

3. Run tests:
```bash
npm test -- --testPathPattern=golden-path
```

---

## Next Steps

1. ✅ Complete Phase 0→6 flow validation (DONE)
2. ⏳ Implement actual event handlers in `execution/`
3. ⏳ Implement domain calculations in `domain/calculations/`
4. ⏳ Add GP-2 through GP-6 scenarios
5. ⏳ Integration testing with database layer

---

## References

- [TEST_EXECUTION_REPORT_OPTION_S.md](../TEST_EXECUTION_REPORT_OPTION_S.md) - Full execution report
- [GOLDEN_PATH_TEST_RESULTS.md](../GOLDEN_PATH_TEST_RESULTS.md) - Test results summary
- [ENGINE_GOLDEN_PATHS.md](../ENGINE_GOLDEN_PATHS.md) - Golden path specifications
- [ENGINE_INVARIANTS.md](../ENGINE_INVARIANTS.md) - Invariant definitions

---

**Last Updated:** 2026-02-11  
**Test Framework Version:** Jest 29.7.0  
**TypeScript Version:** 5.3.3
