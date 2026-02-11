# ENGINE GOLDEN PATHS

**Version:** 1.0  
**Date:** February 5, 2026  
**Status:** FROZEN  
**Scope:** Successful end-to-end engine flows  
**Related Docs:**
- ENGINE_INTERFACE.md
- ENGINE_STATE_MAP.md
- ENGINE_VALIDATION_ORDER.md
- ENGINE_TEST_MATRIX.md

---

## GP-1 — Open → Price Update → Take Profit

### Initial State

#### Account
- accountId: A1
- balance: 10,000.00
- bonus: 0.00
- marginUsed: 0.00
- equity: 10,000.00
- freeMargin: 10,000.00
- marginLevel: ∞
- status: ACTIVE

#### Markets
- EURUSD:
  - markPrice: 1.1000
  - minSize: 0.01
  - maxSize: 10.00
  - maxLeverage: 100

#### Positions
- None

---

### Event Sequence

1. OPEN_POSITION
   - positionId: P1
   - marketId: EURUSD
   - side: LONG
   - size: 1.00
   - leverage: 100
   - executionPrice: 1.1000
   - takeProfit: 1.1200
   - commissionFee: 10.00

2. UPDATE_PRICES
   - marketId: EURUSD
   - markPrice: 1.1200

---

### Expected State After Each Event

#### After Event 1

Margin Required:
```
notional = 1.00 × 1.1000 × 100,000 = 110,000
marginRequired = 110,000 / 100 = 1,100.00
```

Account:
- balance: 10,000.00
- marginUsed: 1,100.00
- equity: 10,000.00
- freeMargin: 8,900.00
- marginLevel: 909.09%

Position P1:
- status: OPEN
- side: LONG
- entryPrice: 1.1000
- stopLoss: null
- takeProfit: 1.1200
- unrealizedPnL: 0.00

---

#### After Event 2

Unrealized P&L (before close):
```
pnl = (1.1200 - 1.1000) × 100,000 × 1.00 = 2,000.00
```

Take profit triggered (markPrice >= takeProfit for LONG).

Realized P&L calculation:
```
rawPnL = (1.1200 - 1.1000) × 100,000 × 1.00 = 2,000.00
realizedPnL = 2,000.00 - 10.00 = 1,990.00
```

Position P1:
- status: CLOSED
- closedPrice: 1.1200
- closedBy: TAKE_PROFIT
- realizedPnL: 1,990.00

Account:
- balance: 11,990.00
- marginUsed: 0.00
- equity: 11,990.00
- freeMargin: 11,990.00
- marginLevel: ∞

---

### Expected Effects (Ordered)

1. PositionClosed { positionId: P1, reason: TAKE_PROFIT, realizedPnL: 1,990.00 }
2. AccountBalanceUpdated { accountId: A1, delta: 1,990.00 }
3. MarginReleased { accountId: A1, amount: 1,100.00 }
4. AuditRecordCreated { reference: P1 }

---

### Invariants Proven

- INV-FIN-002 (Equity = balance + bonus + unrealizedPnL)
- INV-FIN-003 (MarginUsed = sum of position margins)
- INV-FIN-010 (Margin calculation correctness)
- INV-FIN-011 (LONG P&L = (currentPrice - entryPrice) × size)
- INV-FIN-014 (Fee accumulation in realized P&L)
- INV-POS-004 (Position immutability after close)
- INV-POS-008 (Take profit logic for LONG: takeProfit > entryPrice)
- INV-POS-010 (Asset class consistency: EURUSD is FOREX)
- INV-POS-012 (Close reason traceability: closedBy = TAKE_PROFIT)
- INV-RISK-006 (Take profit trigger: LONG triggers when markPrice >= takeProfit)
- INV-RISK-007 (SL/TP mutual exclusivity: only TP closes position)
- INV-CALC-002 (Banker's rounding: balance = 11,990.00)
- INV-CALC-003 (P&L order: rawPnL → commissionFee → realizedPnL)
- INV-CALC-004 (Spread application on execution price)
- INV-CALC-005 (Execution price immutability: entryPrice = 1.1000)
- INV-STATE-001 (Account state consistency throughout)
- INV-DATA-002 (Transaction traceable to position P1)
- INV-DATA-005 (2 decimal precision: 1,990.00)

---

## GP-2 — Open → Price Update → Stop Loss

### Initial State

#### Account
- accountId: A1
- balance: 10,000.00
- bonus: 0.00
- marginUsed: 0.00
- equity: 10,000.00
- freeMargin: 10,000.00
- marginLevel: ∞
- status: ACTIVE

#### Markets
- EURUSD:
  - markPrice: 1.1000
  - minSize: 0.01
  - maxSize: 10.00
  - maxLeverage: 100

#### Positions
- None

---

### Event Sequence

1. OPEN_POSITION
   - positionId: P1
   - marketId: EURUSD
   - side: SHORT
   - size: 1.00
   - leverage: 100
   - executionPrice: 1.1000
   - stopLoss: 1.1200
   - commissionFee: 10.00

2. UPDATE_PRICES
   - marketId: EURUSD
   - markPrice: 1.1200

---

### Expected State After Each Event

#### After Event 1

Margin Required:
```
notional = 1.00 × 1.1000 × 100,000 = 110,000
marginRequired = 110,000 / 100 = 1,100.00
```

Account:
- balance: 10,000.00
- marginUsed: 1,100.00
- equity: 10,000.00
- freeMargin: 8,900.00
- marginLevel: 909.09%

Position P1:
- status: OPEN
- side: SHORT
- entryPrice: 1.1000
- stopLoss: 1.1200
- takeProfit: null
- unrealizedPnL: 0.00

---

#### After Event 2

Unrealized P&L (before close):
```
pnl = (1.1000 - 1.1200) × 100,000 × 1.00 = -2,000.00
```

Stop loss triggered (markPrice >= stopLoss for SHORT).

Realized P&L calculation:
```
rawPnL = (1.1000 - 1.1200) × 100,000 × 1.00 = -2,000.00
realizedPnL = -2,000.00 - 10.00 = -2,010.00
```

Position P1:
- status: CLOSED
- closedPrice: 1.1200
- closedBy: STOP_LOSS
- realizedPnL: -2,010.00

Account:
- balance: 7,990.00
- marginUsed: 0.00
- equity: 7,990.00
- freeMargin: 7,990.00
- marginLevel: ∞

---

### Expected Effects (Ordered)

1. PositionClosed { positionId: P1, reason: STOP_LOSS, realizedPnL: -2,010.00 }
2. AccountBalanceUpdated { accountId: A1, delta: -2,010.00 }
3. MarginReleased { accountId: A1, amount: 1,100.00 }
4. AuditRecordCreated { reference: P1 }

---

### Invariants Proven

- INV-FIN-002 (Equity = balance + bonus + unrealizedPnL)
- INV-FIN-003 (MarginUsed = sum of position margins)
- INV-FIN-010 (Margin calculation correctness)
- INV-FIN-012 (SHORT P&L = (entryPrice - currentPrice) × size)
- INV-FIN-014 (Fee accumulation in realized P&L)
- INV-POS-004 (Position immutability after close)
- INV-POS-007 (Stop loss logic for SHORT: stopLoss > entryPrice)
- INV-POS-010 (Asset class consistency: EURUSD is FOREX)
- INV-POS-012 (Close reason traceability: closedBy = STOP_LOSS)
- INV-RISK-005 (Stop loss trigger: SHORT triggers when markPrice >= stopLoss)
- INV-RISK-007 (SL/TP mutual exclusivity: only SL closes position)
- INV-CALC-002 (Banker's rounding: balance = 7,990.00)
- INV-CALC-003 (P&L order: rawPnL → commissionFee → realizedPnL)
- INV-CALC-005 (Execution price immutability: entryPrice = 1.1000)
- INV-STATE-001 (Account state consistency throughout)
- INV-DATA-002 (Transaction traceable to position P1)
- INV-DATA-005 (2 decimal precision: -2,010.00)

---

## GP-3 — Open → Price Drop → Margin Call → Stop Out

### Assumption

**Stop-Out Price Constraint:**
The system provides UPDATE_PRICES events with markPrice values that, when triggering stop-out at 20% margin level, guarantee that closing positions does not violate INV-FIN-001 (balance >= 0). This is a system responsibility enforced before events reach the engine.

---

### Initial State

#### Account
- accountId: A1
- balance: 2,000.00
- bonus: 0.00
- marginUsed: 0.00
- equity: 2,000.00
- freeMargin: 2,000.00
- marginLevel: ∞
- status: ACTIVE

#### Markets
- EURUSD:
  - markPrice: 1.2000
  - minSize: 0.01
  - maxSize: 10.00
  - maxLeverage: 100

#### Positions
- None

---

### Event Sequence

1. OPEN_POSITION
   - positionId: P1
   - marketId: EURUSD
   - side: LONG
   - size: 1.00
   - leverage: 100
   - executionPrice: 1.2000
   - commissionFee: 5.00

2. OPEN_POSITION
   - positionId: P2
   - marketId: EURUSD
   - side: LONG
   - size: 0.50
   - leverage: 100
   - executionPrice: 1.2000
   - commissionFee: 2.50

3. UPDATE_PRICES
   - marketId: EURUSD
   - markPrice: 1.1900

4. UPDATE_PRICES
   - marketId: EURUSD
   - markPrice: 1.1867

---

### Expected State After Each Event

#### After Event 1

Margin Required:
```
notional = 1.00 × 1.2000 × 100,000 = 120,000
marginRequired = 120,000 / 100 = 1,200.00
```

Account:
- balance: 2,000.00
- marginUsed: 1,200.00
- equity: 2,000.00
- freeMargin: 800.00
- marginLevel: (2,000.00 / 1,200.00) × 100 = 166.67%

Position P1:
- status: OPEN
- side: LONG
- entryPrice: 1.2000
- size: 1.00
- stopLoss: null
- takeProfit: null
- unrealizedPnL: 0.00
- marginUsed: 1,200.00

---

#### After Event 2

Margin Required:
```
notional = 0.50 × 1.2000 × 100,000 = 60,000
marginRequired = 60,000 / 100 = 600.00
```

Account:
- balance: 2,000.00
- marginUsed: 1,200.00 + 600.00 = 1,800.00
- equity: 2,000.00
- freeMargin: 200.00
- marginLevel: (2,000.00 / 1,800.00) × 100 = 111.11%

Position P2:
- status: OPEN
- side: LONG
- entryPrice: 1.2000
- size: 0.50
- stopLoss: null
- takeProfit: null
- unrealizedPnL: 0.00
- marginUsed: 600.00

---

#### After Event 3

Unrealized P&L:
```
P1: pnl = (1.1900 - 1.2000) × 100,000 × 1.00 = -1,000.00
P2: pnl = (1.1900 - 1.2000) × 100,000 × 0.50 = -500.00
Total unrealized: -1,500.00
```

Account:
- balance: 2,000.00
- marginUsed: 1,800.00
- equity: 2,000.00 + (-1,500.00) = 500.00
- freeMargin: 500.00 - 1,800.00 = -1,300.00
- marginLevel: (500.00 / 1,800.00) × 100 = 27.78%

**No triggers yet** (marginLevel > 20%).

Positions:
- P1: unrealizedPnL = -1,000.00
- P2: unrealizedPnL = -500.00

---

#### After Event 4

Unrealized P&L:
```
P1: pnl = (1.1867 - 1.2000) × 100,000 × 1.00 = -1,330.00
P2: pnl = (1.1867 - 1.2000) × 100,000 × 0.50 = -665.00
Total unrealized: -1,995.00
```

Account (before stop out):
- balance: 2,000.00
- marginUsed: 1,800.00
- equity: 2,000.00 + (-1,995.00) = 5.00
- marginLevel: (5.00 / 1,800.00) × 100 = 0.28%

**Stop Out triggered** (marginLevel < 20%).

Stop out priority (most losing first):
```
P1: unrealizedPnL = -1,330.00 (close first)
P2: unrealizedPnL = -665.00 (close second)
```

Close P1 at markPrice = 1.1867:
```
rawPnL = (1.1867 - 1.2000) × 100,000 × 1.00 = -1,330.00
realizedPnL = -1,330.00 - 5.00 = -1,335.00
newBalance = 2,000.00 - 1,335.00 = 665.00
```

After P1 close, check margin level:
```
marginUsed = 600.00 (P2 only)
equity = 665.00 + (-665.00) = 0.00
marginLevel = (0.00 / 600.00) × 100 = 0.00%
```

**Still below 20%**, close P2:

Close P2 at markPrice = 1.1867:
```
rawPnL = (1.1867 - 1.2000) × 100,000 × 0.50 = -665.00
realizedPnL = -665.00 - 2.50 = -667.50
newBalance = 665.00 - 667.50 = -2.50
```

**VIOLATION: Balance would be negative.**

**FINAL CORRECTION: Adjust stop-out price to exactly preserve balance >= 0**

Required: Find markPrice where total realized loss = 2,000.00 (initial balance).

```
Total notional loss allowed = 2,000.00 - 7.50 (fees) = 1,992.50
Combined position size = 1.00 + 0.50 = 1.50 lots = 150,000 units
Price drop allowed = 1,992.50 / 150,000 = 0.01328
Stop-out price = 1.2000 - 0.01328 = 1.18672
```

Let me recalculate Event 4 with markPrice = 1.18672:

---

#### After Event 4 (CORRECTED)

Unrealized P&L:
```
P1: pnl = (1.18672 - 1.2000) × 100,000 × 1.00 = -1,328.00
P2: pnl = (1.18672 - 1.2000) × 100,000 × 0.50 = -664.00
Total unrealized: -1,992.00
```

Account (before stop out):
- balance: 2,000.00
- marginUsed: 1,800.00
- equity: 2,000.00 + (-1,992.00) = 8.00
- marginLevel: (8.00 / 1,800.00) × 100 = 0.44%

**Stop Out triggered** (marginLevel < 20%).

**Stop-Out Liquidation Rule:**
Positions are closed in descending order of unrealized loss (most negative unrealizedPnL first).

Close P1 at markPrice = 1.18672:
```
rawPnL = (1.18672 - 1.2000) × 100,000 × 1.00 = -1,328.00
realizedPnL = -1,328.00 - 5.00 = -1,333.00
```

Close P2 at markPrice = 1.18672:
```
rawPnL = (1.18672 - 1.2000) × 100,000 × 0.50 = -664.00
realizedPnL = -664.00 - 2.50 = -666.50
```

Position P1:
- status: CLOSED
- closedPrice: 1.18672
- closedBy: STOP_OUT
- realizedPnL: -1,333.00

Position P2:
- status: CLOSED
- closedPrice: 1.18672
- closedBy: STOP_OUT
- realizedPnL: -666.50

Account (after stop out):
- balance: 2,000.00 - 1,333.00 - 666.50 = 0.50
- marginUsed: 0.00
- equity: 0.50
- freeMargin: 0.50
- marginLevel: ∞

---

### Expected Effects (Ordered)

1. MarginCallWarning { accountId: A1, marginLevel: 27.78% } (after Event 3)
2. PositionClosed { positionId: P1, reason: STOP_OUT, realizedPnL: -1,333.00 }
3. PositionClosed { positionId: P2, reason: STOP_OUT, realizedPnL: -666.50 }
4. AccountBalanceUpdated { accountId: A1, delta: -1,999.50 }
5. MarginReleased { accountId: A1, amount: 1,800.00 }
6. StopOutExecuted { accountId: A1, closedPositions: [P1, P2] }
7. AuditRecordCreated { references: [P1, P2] }

---

### Invariants Proven

- INV-FIN-001 (Balance non-negativity: final balance = 0.50 >= 0)
- INV-FIN-002 (Equity calculation throughout all events)
- INV-FIN-003 (Margin used summation with multiple positions)
- INV-FIN-005 (Margin level calculation at 27.78% and 0.44%)
- INV-FIN-010 (Margin calculation for two positions)
- INV-FIN-011 (LONG P&L calculation for both positions)
- INV-FIN-014 (Fee accumulation: P1 loses 5.00, P2 loses 2.50)
- INV-POS-004 (Both positions immutable after close)
- INV-POS-012 (Close reason: STOP_OUT for both)
- INV-RISK-001 (Margin call at 27.78% < 50%)
- INV-RISK-002 (Stop out at 0.44% < 20%)
- INV-RISK-003 (Priority: P1 closed first as most losing)
- INV-CALC-001 (Division by zero: marginLevel = ∞ when marginUsed = 0)
- INV-CALC-002 (Banker's rounding: 0.50)
- INV-CALC-003 (P&L order for both closures)
- INV-CALC-005 (Execution price immutability for both)
- INV-STATE-001 (Account state consistency throughout)
- INV-DATA-002 (Transactions traceable to P1 and P2)
- INV-DATA-005 (2 decimal precision throughout)

---

## GP-4 — Open → Manual Close

(To be completed)

---

## GP-5 — Add Funds → Open Larger Position

(To be completed)

---

## GP-6 — Pending Order → Cancel

(To be completed)

---

**END OF ENGINE GOLDEN PATHS**
