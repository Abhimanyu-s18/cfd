# Golden Path Specifications - Reference Lock

**Status:** FROZEN - Implementation guide only  
**Authority:** Peak authority for engine behavior  
**Relationship:** Each GP validates a specific invariant subset

---

## Golden Paths Overview

| Path | Scenario | Key Invariants | Reference |
|------|----------|---|-----------|
| GP-1 | Open → Price Up → Take Profit | INV-FIN-011, INV-POS-008, INV-RISK-006 | ENGINE_GOLDEN_PATHS.md:GP-1 |
| GP-2 | Open → Price Down → Stop Loss | INV-FIN-012, INV-POS-007, INV-RISK-005 | ENGINE_GOLDEN_PATHS.md:GP-2 |
| GP-3 | Open → Price Crash → Stop Out | INV-RISK-004, INV-RISK-005, INV-FIN-001 | ENGINE_GOLDEN_PATHS.md:GP-3 |
| GP-4 | Open → Admin Close | INV-POS-013, INV-FIN-007 | ENGINE_GOLDEN_PATHS.md:GP-4 |
| GP-5 | Open → Manual Close | INV-FIN-008, INV-DATA-002 | ENGINE_GOLDEN_PATHS.md:GP-5 |
| GP-6 | Liquidation Ordering | INV-DATA-002, domain/priority/liquidationOrder.ts | ENGINE_GOLDEN_PATHS.md:GP-6 |

---

## How to Use This Document

1. **Implement a function** in `domain/calculations/` or similar
2. **Check which GP** references this function
3. **Trace through GP scenario** manually with your implementation
4. **Verify output** matches GP expected state
5. **All GPs pass** → invariant valid

---

## GP-1 Reference Summary

**Setup:** $10k balance, no positions, EUR/USD at 1.1000, leverage 100

**Steps:**
1. Open 1.00 lot, entry 1.1000, TP at 1.1200
2. Price updates to 1.1200
3. TP triggers, position closes

**Expected Final State:**
- balance: 11,990.00
- marginUsed: 0.00
- position.status: CLOSED
- position.realizedPnL: 1,990.00

**Tested Invariants:**
- INV-FIN-010: Margin = (1.00 * 1.1000) / 100 = 1,100.00 ✓
- INV-FIN-011: PnL = (1.1200 - 1.1000) * 100,000 = 2,000.00 ✓
- INV-FIN-014: realizedPnL = 2,000.00 - 10.00 commission = 1,990.00 ✓
- INV-RISK-006: TP triggers when LONG and price >= TP ✓

---

**⚠️ DO NOT CREATE TEST CODE IN THIS FILE**

This folder contains specification references ONLY.
Test implementations go elsewhere (to be determined in Option G).
