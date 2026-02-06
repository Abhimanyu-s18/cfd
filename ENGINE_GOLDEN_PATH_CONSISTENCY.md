# ENGINE GOLDEN PATHS — Consistency Table

**Version:** 1.0  
**Date:** February 5, 2026  
**Purpose:** Engine contract checksum — proof of behavioral consistency across golden paths  
**Status:** FROZEN  

---

## GOLDEN PATH CONSISTENCY MATRIX

| Rule / Behavior                              | GP-1 | GP-2 | GP-3 | Notes |
|----------------------------------------------|------|------|------|-------|
| **Position Lifecycle** ||||
| Stop loss closes position                    | ❌    | ✅    | ❌    | GP-2 only |
| Take profit closes position                  | ✅    | ❌    | ❌    | GP-1 only |
| Stop-out closes position(s)                  | ❌    | ❌    | ✅    | GP-3 only (multiple) |
| Manual close                                 | ❌    | ❌    | ❌    | GP-4 (not yet complete) |
| **Risk Management** ||||
| Margin call warning emitted                  | ❌    | ❌    | ✅    | GP-3: 27.78% < 50% |
| Stop-out liquidation executed                | ❌    | ❌    | ✅    | GP-3: 0.44% < 20% |
| Priority-based liquidation (most losing first)| ❌    | ❌    | ✅    | GP-3: P1 before P2 |
| **Financial Integrity** ||||
| Fees applied exactly once per position      | ✅    | ✅    | ✅    | Commission at close |
| Balance non-negativity maintained (INV-FIN-001)| ✅    | ✅    | ✅    | Always >= 0 |
| Equity calculation consistent (INV-FIN-002)  | ✅    | ✅    | ✅    | All events |
| Margin summation correct (INV-FIN-003)       | ✅    | ✅    | ✅    | GP-3: multiple positions |
| **P&L Calculations** ||||
| LONG P&L: (current - entry) × size          | ✅    | ❌    | ✅    | GP-1, GP-3 |
| SHORT P&L: (entry - current) × size         | ❌    | ✅    | ❌    | GP-2 only |
| Fee deduction from realized P&L              | ✅    | ✅    | ✅    | All closures |
| Banker's rounding applied                    | ✅    | ✅    | ✅    | 2 decimal places |
| **State Transitions** ||||
| Position immutable after close (INV-POS-004) | ✅    | ✅    | ✅    | All closures |
| Execution price never modified (INV-CALC-005)| ✅    | ✅    | ✅    | All paths |
| Account state consistency (INV-STATE-001)    | ✅    | ✅    | ✅    | Every event |
| **Close Reasons** ||||
| closedBy = TAKE_PROFIT                       | ✅    | ❌    | ❌    | GP-1 only |
| closedBy = STOP_LOSS                         | ❌    | ✅    | ❌    | GP-2 only |
| closedBy = STOP_OUT                          | ❌    | ❌    | ✅    | GP-3: both positions |
| closedBy = USER                              | ❌    | ❌    | ❌    | GP-4 (not yet complete) |
| **Margin Mechanics** ||||
| Margin required calculation correct          | ✅    | ✅    | ✅    | (notional / leverage) |
| Margin released on close                     | ✅    | ✅    | ✅    | All closures |
| marginLevel = ∞ when marginUsed = 0          | ✅    | ✅    | ✅    | After all closes |
| Division by zero handled (INV-CALC-001)      | ✅    | ✅    | ✅    | All paths |
| **Effects Ordering** ||||
| PositionClosed emitted first                 | ✅    | ✅    | ✅    | Effect order 1-2 |
| AccountBalanceUpdated follows                | ✅    | ✅    | ✅    | After position close |
| MarginReleased emitted                       | ✅    | ✅    | ✅    | After balance update |
| AuditRecordCreated emitted last              | ✅    | ✅    | ✅    | Final effect |
| **Multi-Position Scenarios** ||||
| Single position lifecycle                    | ✅    | ✅    | ❌    | GP-1, GP-2 |
| Multiple positions opened                    | ❌    | ❌    | ✅    | GP-3: 2 positions |
| Multiple positions closed simultaneously     | ❌    | ❌    | ✅    | GP-3: stop-out |
| Margin summation across positions            | ❌    | ❌    | ✅    | GP-3: 1,800.00 total |
| **SL/TP Mutual Exclusivity** ||||
| Only one close trigger executes              | ✅    | ✅    | ✅    | INV-RISK-007 |
| SL exists when TP triggers                   | ❌    | N/A  | N/A  | GP-1: stopLoss=null |
| TP exists when SL triggers                   | N/A  | ❌    | N/A  | GP-2: takeProfit=null |
| Neither SL nor TP on stop-out                | N/A  | N/A  | ✅    | GP-3: both null |
| **Numeric Precision** ||||
| 2 decimal places for all monetary values     | ✅    | ✅    | ✅    | INV-DATA-005 |
| 5 decimal places for prices                  | ✅    | ✅    | ✅    | Entry/close prices |
| Intermediate calculations unrounded          | ✅    | ✅    | ✅    | Round only at boundaries |

---

## CROSS-PATH CONSISTENCY PROOFS

### Profit vs Loss Symmetry (GP-1 vs GP-2)
- **Setup:** Same instrument (EURUSD), same size (1.00), same leverage (100)
- **Entry price:** Both 1.1000
- **Price movement magnitude:** 200 pips (0.0200)
- **GP-1 profit:** +1,990.00 (after 10.00 fee)
- **GP-2 loss:** -2,010.00 (after 10.00 fee)
- **Symmetry:** Profit + Loss = -20.00 (exactly 2× commission fee)
- **Proof:** P&L formulas are inverses for LONG vs SHORT

### Margin Call Warning vs Stop Out (GP-3)
- **Margin call threshold:** 50%
- **Stop out threshold:** 20%
- **GP-3 Event 3 marginLevel:** 27.78% → Margin call warning only
- **GP-3 Event 4 marginLevel:** 0.44% → Stop out execution
- **Proof:** Thresholds are enforced in correct order

### Balance Preservation Across All Paths
- **GP-1 final balance:** 11,990.00 (gain from initial 10,000.00)
- **GP-2 final balance:** 7,990.00 (loss from initial 10,000.00)
- **GP-3 final balance:** 0.50 (near-total loss from initial 2,000.00)
- **All paths:** balance >= 0 (INV-FIN-001 never violated)
- **Proof:** Stop-out price calculated to preserve non-negativity

### Fee Application Consistency
- **GP-1:** Commission 10.00 deducted once at close
- **GP-2:** Commission 10.00 deducted once at close
- **GP-3 P1:** Commission 5.00 deducted once at close
- **GP-3 P2:** Commission 2.50 deducted once at close
- **Proof:** Fees never double-applied, always in realizedPnL calculation

---

## BEHAVIORAL INVARIANTS PROVEN ACROSS ALL PATHS

### Universal Truths (Hold in GP-1, GP-2, GP-3)
1. **Balance non-negativity:** Never violated
2. **Equity calculation:** Always balance + bonus + unrealizedPnL
3. **Margin summation:** Always sum of position margins
4. **Position immutability:** Closed positions never modified
5. **Execution price finality:** Entry price never changes
6. **Effect ordering:** Always consistent sequence
7. **Banker's rounding:** Applied to all monetary values
8. **Division by zero:** Handled when marginUsed = 0
9. **Account state consistency:** Derived fields always correct
10. **Fee application:** Exactly once per position at close

### Path-Specific Behaviors (Mutually Exclusive)
1. **GP-1 only:** Take profit closes LONG position
2. **GP-2 only:** Stop loss closes SHORT position
3. **GP-3 only:** Stop-out closes multiple positions with priority ordering

---

## ENGINE CONTRACT CHECKSUM

**Total Golden Paths Analyzed:** 3 (of 6 planned)  
**Universal Invariants Proven:** 10  
**Path-Specific Behaviors Documented:** 3  
**Consistency Violations Found:** 0  
**Ambiguities Remaining:** 0  

**Certification:**
All golden paths GP-1, GP-2, and GP-3 are internally consistent and mutually compatible. No contradictions exist between paths. The engine behavior is fully deterministic and predictable.

---

## NEXT GOLDEN PATHS

The following paths remain to be authored:

- **GP-4:** Open → Manual Close (proves USER close reason, standard profit taking)
- **GP-5:** Add Funds → Open Larger Position (proves balance modification allows larger margin usage)
- **GP-6:** Pending Order → Cancel (proves PENDING status lifecycle and clean removal)

These paths will extend the consistency matrix but must maintain all universal invariants proven in GP-1, GP-2, and GP-3.

---

**DOCUMENT STATUS:** COMPLETE  
**FROZEN PATHS:** GP-1, GP-2, GP-3  
**CONSISTENCY:** VERIFIED  

---

**END OF GOLDEN PATH CONSISTENCY TABLE**
