# COMPLETE PRE-DEVELOPMENT BLUEPRINT
## Multi-Asset CFD Trading Web Application
**Version:** 2.0 - Master Edition  
**Date:** February 5, 2026  
**Status:** Complete Pre-Development Package  
**For:** Complete Beginner with AI Assistance  

---

## DOCUMENT PURPOSE

This is the **definitive, no-restart blueprint** for building a CFD trading platform from absolute zero.

**What This Document Contains:**
- Every concept explained from first principles
- Complete system architecture
- All technical decisions justified
- Step-by-step implementation roadmap
- Quality gates and checkpoints
- Legal and compliance framework
- Project management structure

**How to Use This Document:**
1. Read sections 1-6 in order (DO NOT SKIP)
2. Complete each checklist before proceeding
3. Refer back when making decisions
4. Use as the single source of truth

**Critical Success Factors:**
✅ Understanding BEFORE coding  
✅ Architecture BEFORE implementation  
✅ Tests BEFORE features  
✅ Documentation BEFORE deployment  

---

# TABLE OF CONTENTS

1. [FUNDAMENTAL KNOWLEDGE REQUIREMENTS](#1-fundamental-knowledge-requirements)
2. [TECHNICAL PLANNING PHASE](#2-technical-planning-phase)
3. [LEGAL AND COMPLIANCE PREPARATION](#3-legal-and-compliance-preparation)
4. [PROJECT MANAGEMENT SETUP](#4-project-management-setup)
5. [RESOURCE PREPARATION](#5-resource-preparation)
6. [RISK MITIGATION STRATEGIES](#6-risk-mitigation-strategies)
7. [IMPLEMENTATION ROADMAP](#7-implementation-roadmap)
8. [QUALITY ASSURANCE FRAMEWORK](#8-quality-assurance-framework)

---

# 1. FUNDAMENTAL KNOWLEDGE REQUIREMENTS

> **CRITICAL:** Software does not fail first—understanding does.

## 1.1 Essential Programming Concepts (Non-Negotiable)

### Why This Matters
You cannot debug what you don't understand. These concepts form the mental model for ALL programming.

### Core Concepts with Detailed Explanations

#### 1.1.1 Variable
**What It Really Means:** A named storage location for data that can change.

**Analogy:** A labeled box where you put things. The label stays the same, but what's inside can change.

**Examples:**
```typescript
// Good variable - clear purpose
let accountBalance = 10000;

// Bad variable - unclear purpose
let x = 10000;
```

**Red Flag:** If you can't explain what the variable stores in one sentence → rename it.

#### 1.1.2 Function
**What It Really Means:** A reusable block of code that performs a specific task.

**Analogy:** A machine that takes input, processes it, and produces output.

**Examples:**
```typescript
// Pure function - same input ALWAYS gives same output
function calculateMargin(tradeSize: number, leverage: number): number {
  return tradeSize / leverage;
}

// Impure function - output depends on external state
function getUserBalance(): number {
  return database.query('SELECT balance FROM accounts');
}
```

**Red Flag:** If a function does multiple unrelated things → split it.

#### 1.1.3 Pure Function
**What It Really Means:** A function with NO side effects - doesn't change anything outside itself.

**Analogy:** A calculator. 2 + 2 always equals 4, and it doesn't change the world around it.

**Why This Matters for Trading:**
Pure functions are PREDICTABLE and TESTABLE. Your liquidation logic MUST be pure.

**Example:**
```typescript
// PURE - Can test reliably
function isLiquidatable(equity: number, maintenanceMargin: number): boolean {
  return equity < maintenanceMargin;
}

// IMPURE - Dangerous for trading
function checkLiquidation(): boolean {
  const equity = getEquity(); // External call
  const margin = getMargin(); // External call
  return equity < margin;
}
```

#### 1.1.4 State
**What It Really Means:** The current condition of data at a specific point in time.

**Analogy:** Your bank account balance right now.

**Critical Rule:** State MUST have a single owner. Two places updating the same state = chaos.

**Example:**
```typescript
// Good - Single source of truth
interface AccountState {
  balance: number;
  equity: number;
  usedMargin: number;
  freeMargin: number;
}

// Bad - Distributed state
// balance in one place
// equity calculated elsewhere
// margin in third location
```

#### 1.1.5 Event
**What It Really Means:** Something that happened in the system.

**Analogy:** A notification. "Button clicked", "Price updated", "Position closed".

**Trading Events:**
- User places order
- Price changes
- Position hits stop loss
- Margin call triggered
- Account liquidated

**Example:**
```typescript
interface TradingEvent {
  type: 'ORDER_PLACED' | 'PRICE_UPDATE' | 'POSITION_CLOSED';
  timestamp: Date;
  data: any;
}
```

#### 1.1.6 Invariant
**What It Really Means:** A rule that MUST NEVER be violated.

**Analogy:** Laws of physics. Gravity doesn't turn off.

**CFD Trading Invariants:**
1. Balance can never be negative
2. Used margin ≤ Account equity
3. Position size ≤ Maximum allowed
4. Leverage ≤ Maximum for asset class
5. Total open positions ≤ Account limit

**Example:**
```typescript
// This should be IMPOSSIBLE
if (account.balance < 0) {
  throw new Error('INVARIANT VIOLATED: Balance negative');
}

// This protects the invariant
function deductBalance(amount: number) {
  if (account.balance - amount < 0) {
    throw new Error('Insufficient balance');
  }
  account.balance -= amount;
}
```

**Red Flag:** If your code CAN create negative balances → architecture is broken.

#### 1.1.7 Side Effect
**What It Really Means:** Any change to things outside a function.

**Examples of Side Effects:**
- Writing to database
- Sending email
- Logging to console
- Calling an API
- Modifying a global variable

**Why This Matters:**
Side effects are where bugs hide. Isolate them.

**Example:**
```typescript
// Pure calculation
function calculatePnL(entry: number, current: number, size: number): number {
  return (current - entry) * size;
}

// Side effect isolated
function updatePosition(positionId: string, pnl: number): void {
  database.update('positions', { id: positionId, unrealizedPnL: pnl });
}

// Composition
const pnl = calculatePnL(1.0850, 1.0875, 1.5);
updatePosition('pos-123', pnl);
```

#### 1.1.8 Dependency
**What It Really Means:** Something your code needs to work.

**Analogy:** Electricity for a fridge. Without it, the fridge is useless.

**Example:**
```typescript
// Function depends on database
function getUser(id: string) {
  return database.query('SELECT * FROM users WHERE id = ?', id);
}

// Make dependency explicit
function getUser(database: Database, id: string) {
  return database.query('SELECT * FROM users WHERE id = ?', id);
}
```

### 1.1.9 Learning Validation

**Test Your Understanding:**

Can you explain in plain English:
- [ ] What a pure function is and why it matters?
- [ ] What an invariant is in a CFD system?
- [ ] Why state should have one owner?
- [ ] What makes a side effect dangerous?

**Red Flag:** If you say "I think I understand" → You don't. Keep learning.

---

## 1.2 CFD Trading Terminology (Mandatory Glossary)

### Why This Matters
You CANNOT build what you can't define. Every term below is used in your code.

### Core CFD Concepts with Practical Meaning

#### 1.2.1 CFD (Contract for Difference)
**Definition:** A financial derivative where you speculate on price movement without owning the underlying asset.

**Plain English:** 
You bet on whether a price will go up or down. If you're right, you profit. If wrong, you lose.

**Real Example:**
- Gold price: $2,000/oz
- You think it will rise
- You open BUY position for 1 oz
- Gold rises to $2,050
- You profit: $50
- You NEVER owned actual gold

**Code Representation:**
```typescript
interface CFDPosition {
  asset: string;        // 'Gold'
  type: 'BUY' | 'SELL'; // Direction
  entryPrice: number;   // $2,000
  currentPrice: number; // $2,050
  size: number;         // 1 oz
  pnl: number;          // $50
}
```

#### 1.2.2 Leverage
**Definition:** Borrowed exposure that multiplies both profit AND loss.

**Plain English:**
You control more money than you have. Like using a lever to lift a heavy object.

**Real Example:**
- Account balance: $1,000
- Leverage: 1:100
- You can control: $100,000 worth of positions
- 1% price move = $1,000 profit OR loss
- You can lose your entire balance in ONE trade

**Math:**
```
Exposure = Account Balance × Leverage
Exposure = $1,000 × 100 = $100,000

Required Margin = Exposure / Leverage
Required Margin = $100,000 / 100 = $1,000
```

**Code Representation:**
```typescript
function calculateExposure(balance: number, leverage: number): number {
  return balance * leverage;
}

function calculateMargin(tradeSize: number, leverage: number): number {
  return tradeSize / leverage;
}
```

**CRITICAL WARNING:**
Leverage is dangerous. Most beginners lose money because they don't understand this.

#### 1.2.3 Initial Margin
**Definition:** Money required to open a position.

**Plain English:**
The deposit you need to start a trade.

**Real Example:**
- Trade size: $10,000 (EUR/USD)
- Leverage: 1:100
- Initial margin: $100

**Formula:**
```
Initial Margin = Trade Size / Leverage
```

**Code:**
```typescript
function calculateInitialMargin(
  tradeSize: number,
  leverage: number
): number {
  return tradeSize / leverage;
}
```

#### 1.2.4 Maintenance Margin
**Definition:** Minimum equity required to keep positions open.

**Plain English:**
The threshold below which your positions get liquidated.

**Real Example:**
- Initial margin: $100
- Maintenance margin: $50 (50% of initial)
- If equity drops to $49 → LIQUIDATION

**Industry Standard:**
Maintenance margin is typically 50% of initial margin.

**Code:**
```typescript
function calculateMaintenanceMargin(initialMargin: number): number {
  return initialMargin * 0.5; // 50%
}

function isLiquidatable(equity: number, maintenanceMargin: number): boolean {
  return equity < maintenanceMargin;
}
```

#### 1.2.5 Equity
**Definition:** Your account's current total value.

**Formula:**
```
Equity = Balance + Unrealized PnL
```

**Plain English:**
Your balance plus/minus the profit/loss from open positions.

**Real Example:**
- Balance: $10,000
- Open position profit: +$500
- Equity: $10,500

**Code:**
```typescript
function calculateEquity(
  balance: number,
  unrealizedPnL: number
): number {
  return balance + unrealizedPnL;
}
```

#### 1.2.6 Unrealized PnL (Profit and Loss)
**Definition:** Floating profit or loss from open positions (not yet closed).

**Plain English:**
Money you would make or lose if you closed positions right now.

**Real Example:**
- Entry price: $1.0850 (EUR/USD)
- Current price: $1.0875
- Size: 1.5 lots (150,000 units)
- Unrealized PnL: +$375

**Formula for Forex:**
```
PnL = (Current Price - Entry Price) × Position Size
```

**Code:**
```typescript
function calculateUnrealizedPnL(
  entryPrice: number,
  currentPrice: number,
  size: number,
  type: 'BUY' | 'SELL'
): number {
  const priceDiff = currentPrice - entryPrice;
  const multiplier = type === 'BUY' ? 1 : -1;
  return priceDiff * size * multiplier;
}
```

#### 1.2.7 Liquidation
**Definition:** Forced closure of positions when equity falls below maintenance margin.

**Plain English:**
The system automatically closes your trades to prevent negative balance.

**Why It Happens:**
To protect the broker (or platform) from losses.

**Real Example:**
- Initial margin: $1,000
- Maintenance margin: $500
- Equity drops to $480 → LIQUIDATION
- Positions closed automatically
- Remaining equity: ~$480 (minus fees)

**CRITICAL TRUTH:**
Liquidation is NOT when balance hits zero. It happens BEFORE to protect the system.

**Common Misconception:**
❌ "Liquidation happens at $0 balance"  
✅ "Liquidation happens at maintenance margin"

**Code:**
```typescript
function checkLiquidation(
  equity: number,
  maintenanceMargin: number
): { shouldLiquidate: boolean; reason?: string } {
  if (equity < maintenanceMargin) {
    return {
      shouldLiquidate: true,
      reason: `Equity ($${equity}) below maintenance margin ($${maintenanceMargin})`
    };
  }
  return { shouldLiquidate: false };
}
```

#### 1.2.8 Mark Price
**Definition:** Fair price used for liquidation calculations, preventing manipulation.

**Plain English:**
An average or fair price to prevent traders from manipulating liquidations with sudden price spikes.

**Why It Exists:**
Without mark price, whales could create fake price spikes to liquidate others.

**Calculation (Simplified):**
```
Mark Price = (Best Bid + Best Ask) / 2
```

**Code:**
```typescript
function calculateMarkPrice(bid: number, ask: number): number {
  return (bid + ask) / 2;
}
```

#### 1.2.9 Free Margin
**Definition:** Funds available for new positions.

**Formula:**
```
Free Margin = Equity - Used Margin
```

**Plain English:**
How much money you can still use to open new trades.

**Code:**
```typescript
function calculateFreeMargin(
  equity: number,
  usedMargin: number
): number {
  return equity - usedMargin;
}
```

#### 1.2.10 Margin Level
**Definition:** Ratio of equity to used margin, expressed as percentage.

**Formula:**
```
Margin Level = (Equity / Used Margin) × 100
```

**Thresholds:**
- > 100%: Healthy account
- < 100%: Warning - cannot open new positions
- < 50%: Margin call
- < 20%: Liquidation

**Plain English:**
Health indicator of your account. Higher is better.

**Code:**
```typescript
function calculateMarginLevel(
  equity: number,
  usedMargin: number
): number {
  if (usedMargin === 0) return Infinity;
  return (equity / usedMargin) * 100;
}

function getMarginStatus(marginLevel: number): string {
  if (marginLevel >= 100) return 'HEALTHY';
  if (marginLevel >= 50) return 'WARNING';
  if (marginLevel >= 20) return 'MARGIN_CALL';
  return 'LIQUIDATION';
}
```

### 1.2.11 Learning Validation

**Test Your Understanding:**

Scenario: Account balance $10,000, leverage 1:100

1. What's your maximum exposure?
   Answer: $1,000,000

2. You open EUR/USD position worth $100,000. What's the initial margin?
   Answer: $1,000

3. Position loses $9,600. What's your equity?
   Answer: $400

4. What happens next?
   Answer: Liquidation (equity < maintenance margin of $500)

**Red Flag:** If any answer is wrong → Re-read section 1.2

---

## 1.3 Web Application Architecture Fundamentals

### Why This Matters
Without understanding how web apps work, you'll put code in the wrong place.

### The Three-Layer Mental Model

```
┌─────────────────────────────────────────────┐
│            FRONTEND (Browser)               │
│  • Displays information                     │
│  • Collects user intent                     │
│  • NEVER decides truth                      │
│  • Example: "User clicked BUY button"       │
└────────────────┬────────────────────────────┘
                 │ HTTP Request
                 │ "I want to buy EUR/USD"
                 ▼
┌─────────────────────────────────────────────┐
│            BACKEND (Server)                 │
│  • Validates requests                       │
│  • Enforces business rules                  │
│  • SOURCE OF TRUTH                          │
│  • Example: "Check if user has funds"      │
└────────────────┬────────────────────────────┘
                 │ SQL Query
                 │ "Get user balance"
                 ▼
┌─────────────────────────────────────────────┐
│            DATABASE (Storage)               │
│  • Remembers state                          │
│  • Persists data                            │
│  • Example: "Balance = $10,000"            │
└─────────────────────────────────────────────┘
```

### Golden Rules (NEVER VIOLATE)

#### Rule 1: Frontend NEVER Decides Truth
**Wrong:**
```typescript
// ❌ Frontend calculating if trade is allowed
if (accountBalance >= tradeSize) {
  executeTrade();
}
```

**Right:**
```typescript
// ✅ Frontend only expresses intent
sendTradeRequest({ symbol: 'EURUSD', size: 1.0 });
// Backend decides if allowed
```

#### Rule 2: Backend Validates EVERYTHING
**Wrong:**
```typescript
// ❌ Trusting frontend data
app.post('/trade', (req, res) => {
  const trade = req.body;
  database.save(trade); // DANGEROUS
});
```

**Right:**
```typescript
// ✅ Validating everything
app.post('/trade', (req, res) => {
  const trade = validateTrade(req.body);
  if (!isAllowed(trade)) {
    return res.status(403).json({ error: 'Not allowed' });
  }
  database.save(trade);
});
```

#### Rule 3: Database Stores, Doesn't Calculate
**Wrong:**
```typescript
// ❌ Calculating in SQL
SELECT balance + (SELECT SUM(pnl) FROM positions) AS equity
```

**Right:**
```typescript
// ✅ Calculate in application, store result
const balance = await getBalance();
const pnl = await calculateTotalPnL();
const equity = balance + pnl;
await saveEquity(equity);
```

### Request Flow Example

**User Action:** Click "BUY EUR/USD"

**Step-by-Step:**

1. **Frontend:**
   ```typescript
   // User clicks button
   onClick={() => {
     // Only expresses intent
     api.placeTrade({
       symbol: 'EURUSD',
       type: 'BUY',
       size: 1.0
     });
   }}
   ```

2. **Backend Receives:**
   ```typescript
   POST /api/trades
   Body: { symbol: 'EURUSD', type: 'BUY', size: 1.0 }
   ```

3. **Backend Validates:**
   ```typescript
   // Check user authentication
   const user = await authenticateToken(req.headers.authorization);
   
   // Validate trade data
   const trade = validateTradeRequest(req.body);
   
   // Check business rules
   const canTrade = await checkTradingRules(user, trade);
   if (!canTrade) {
     return res.status(403).json({ error: 'Cannot trade' });
   }
   ```

4. **Backend Executes:**
   ```typescript
   // Pure calculation
   const margin = calculateMargin(trade.size, leverage);
   
   // Database operation
   const position = await createPosition({
     userId: user.id,
     ...trade,
     margin,
     timestamp: Date.now()
   });
   ```

5. **Backend Responds:**
   ```typescript
   res.json({
     success: true,
     position: {
       id: position.id,
       symbol: 'EURUSD',
       type: 'BUY',
       size: 1.0,
       entryPrice: 1.0875
     }
   });
   ```

6. **Frontend Updates:**
   ```typescript
   // Receives response
   .then(response => {
     // Update UI
     setPositions([...positions, response.position]);
     showNotification('Position opened successfully');
   });
   ```

### Common Architecture Mistakes

#### Mistake 1: Smart Frontend
**Wrong Thinking:** "Let's calculate everything in the browser for speed"

**Reality:** 
- User can manipulate frontend code
- Different users see different calculations
- Bugs multiply

**Fix:** Backend is source of truth

#### Mistake 2: Fat Database
**Wrong Thinking:** "Database should handle all calculations"

**Reality:**
- Complex business logic in SQL is hard to test
- Hard to maintain
- Performance issues

**Fix:** Calculate in application, store results

#### Mistake 3: Stateful Frontend
**Wrong Thinking:** "Store account balance in browser"

**Reality:**
- Gets out of sync
- Refresh loses data
- Multiple tabs have different values

**Fix:** Frontend queries backend for current state

### Learning Validation

**Test Your Understanding:**

Where should this logic live?

1. Calculating if equity < maintenance margin
   Answer: Backend (business rule)

2. Displaying current price
   Answer: Frontend (presentation)

3. Storing user's current balance
   Answer: Database (persistence)

4. Validating password strength
   Answer: Both (UX in frontend, security in backend)

**Red Flag:** If you think frontend should calculate margin → Re-read section 1.3

---

## 1.4 Full-Stack Blueprint (CFD-Specific)

### The Complete Request Flow

```
User Action (Click "BUY")
         ↓
Frontend (React)
• Collects intent only
• No validation
• No calculation
         ↓ HTTP POST /api/orders
Backend API (Express/Fastify)
• Authentication
• Authorization
• Input validation
• Rate limiting
         ↓ Validated Request
Trading Engine (Pure TypeScript)
• Calculates margin
• Checks balance
• Validates invariants
• Returns decision
         ↓ Command
Database (PostgreSQL)
• Creates position record
• Updates balance
• Logs transaction
         ↓ Success/Failure
Response back to UI
• Position created
• New balance
• Updated equity
```

### Layer Responsibilities (Detailed)

#### Layer 1: Frontend (React + TypeScript)
**Purpose:** User interface and intent collection

**Responsibilities:**
- Display data
- Collect user input
- Send requests
- Handle responses
- Show loading states
- Display errors

**NEVER:**
- Calculate margin
- Validate trading rules
- Determine if action is allowed
- Store authoritative state

**Example:**
```typescript
// frontend/components/TradeButton.tsx
function TradeButton() {
  const [loading, setLoading] = useState(false);
  
  const handleTrade = async () => {
    setLoading(true);
    
    try {
      // Only sends intent
      const response = await api.post('/orders', {
        symbol: 'EURUSD',
        type: 'BUY',
        size: 1.0
      });
      
      // Updates UI based on response
      showSuccess('Trade executed');
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleTrade} disabled={loading}>
      {loading ? 'Processing...' : 'BUY'}
    </button>
  );
}
```

#### Layer 2: API Layer (Express)
**Purpose:** Gateway and validator

**Responsibilities:**
- Authenticate requests
- Validate input format
- Rate limiting
- Route to correct handler
- Format responses
- Handle errors

**NEVER:**
- Business logic
- Complex calculations
- Direct database access

**Example:**
```typescript
// backend/routes/orders.ts
router.post('/orders', 
  authenticate,           // Middleware: Check auth
  validateOrderInput,     // Middleware: Validate format
  rateLimiter,           // Middleware: Prevent spam
  async (req, res) => {
    try {
      // Delegate to engine
      const result = await tradingEngine.placeOrder(
        req.user.id,
        req.body
      );
      
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);
```

#### Layer 3: Trading Engine (Pure Logic)
**Purpose:** Business rules and calculations

**Responsibilities:**
- Calculate margin requirements
- Validate trading rules
- Check invariants
- Determine PnL
- Liquidation logic
- Risk management

**NEVER:**
- HTTP concerns
- Database operations
- Authentication
- User interface

**Example:**
```typescript
// backend/engine/TradingEngine.ts
class TradingEngine {
  // Pure function - no side effects
  calculateMargin(
    tradeSize: number,
    leverage: number
  ): number {
    return tradeSize / leverage;
  }
  
  // Pure function - testable
  canPlaceOrder(
    account: Account,
    order: Order
  ): { allowed: boolean; reason?: string } {
    const requiredMargin = this.calculateMargin(
      order.size,
      account.leverage
    );
    
    // Check invariants
    if (account.freeMargin < requiredMargin) {
      return {
        allowed: false,
        reason: 'Insufficient margin'
      };
    }
    
    if (account.positions.length >= account.maxPositions) {
      return {
        allowed: false,
        reason: 'Maximum positions reached'
      };
    }
    
    return { allowed: true };
  }
  
  // Orchestrates the flow
  async placeOrder(
    userId: string,
    order: OrderRequest
  ): Promise<Position> {
    // Get current state
    const account = await this.accountRepo.get(userId);
    
    // Validate (pure function)
    const validation = this.canPlaceOrder(account, order);
    if (!validation.allowed) {
      throw new Error(validation.reason);
    }
    
    // Calculate (pure function)
    const margin = this.calculateMargin(order.size, account.leverage);
    const currentPrice = await this.priceService.getPrice(order.symbol);
    
    // Create position (side effect - isolated)
    const position = await this.positionRepo.create({
      userId,
      symbol: order.symbol,
      type: order.type,
      size: order.size,
      entryPrice: currentPrice,
      margin
    });
    
    // Update account (side effect - isolated)
    await this.accountRepo.updateMargin(userId, margin);
    
    return position;
  }
}
```

#### Layer 4: Database (PostgreSQL)
**Purpose:** State persistence

**Responsibilities:**
- Store data
- Enforce constraints
- Maintain relationships
- Provide transactions
- Enable queries

**NEVER:**
- Business logic
- Complex calculations
- Decision making

**Example:**
```sql
-- Database constraints enforce invariants
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  balance DECIMAL(15,2) NOT NULL CHECK (balance >= 0), -- Invariant
  equity DECIMAL(15,2) NOT NULL,
  used_margin DECIMAL(15,2) NOT NULL CHECK (used_margin >= 0),
  leverage INTEGER NOT NULL CHECK (leverage > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Foreign keys maintain relationships
CREATE TABLE positions (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id),
  symbol VARCHAR(20) NOT NULL,
  type VARCHAR(4) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  size DECIMAL(15,5) NOT NULL CHECK (size > 0),
  entry_price DECIMAL(15,5) NOT NULL,
  margin_used DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Why This Architecture Matters

**Benefit 1: Testability**
Each layer can be tested independently.

```typescript
// Test engine without HTTP or database
describe('TradingEngine', () => {
  it('calculates margin correctly', () => {
    const engine = new TradingEngine();
    const margin = engine.calculateMargin(100000, 100);
    expect(margin).toBe(1000);
  });
});
```

**Benefit 2: Maintainability**
Clear boundaries = easy to find bugs.

**Benefit 3: Security**
Validation in backend = can't be bypassed.

**Benefit 4: Scalability**
Layers can be scaled independently.

### Red Flags (Architecture Violations)

❌ Frontend calculates if trade is allowed  
❌ API contains business logic  
❌ Engine makes HTTP requests  
❌ Database has calculated fields  
❌ Same calculation in multiple places  

### Learning Validation

**Test Your Understanding:**

For each scenario, identify which layer handles it:

1. User enters trade size → Frontend
2. Check if balance is sufficient → Engine
3. Store position in database → Database
4. Validate JWT token → API
5. Calculate unrealized PnL → Engine
6. Display current equity → Frontend
7. Enforce leverage limits → Engine
8. Rate limit API calls → API

**Red Flag:** If any answer is wrong → Re-read section 1.4

---

## 1.5 Learning Sequence Summary

### Required Understanding Before Coding

| Order | Topic | Checkpoint | Time Estimate |
|-------|-------|------------|---------------|
| 1 | Programming Concepts | Can explain pure functions | 2-3 hours |
| 2 | CFD Fundamentals | Can calculate margin manually | 3-4 hours |
| 3 | Web Architecture | Can draw the 3-layer model | 2 hours |
| 4 | System Design | Can trace a request flow | 2 hours |

### Self-Assessment Checklist

Before proceeding to Section 2, confirm:

- [ ] I can explain what a pure function is
- [ ] I can explain liquidation to a non-technical person
- [ ] I can calculate margin requirements manually
- [ ] I can draw the frontend/backend/database architecture
- [ ] I understand why frontend can't be trusted
- [ ] I can identify which layer owns each responsibility
- [ ] I know what an invariant is
- [ ] I can explain why testing pure functions is easier

**CRITICAL:**
If ANY box is unchecked, DO NOT PROCEED.

Re-read the relevant section until you can check the box confidently.

### Common Misunderstandings (Dangerous)

❌ "Liquidation happens when balance reaches zero"  
✅ "Liquidation happens at maintenance margin threshold"

❌ "Frontend can calculate margin for speed"  
✅ "Backend is source of truth, frontend displays"

❌ "Pure functions are optional"  
✅ "Pure functions are mandatory for reliable trading logic"

❌ "I can skip understanding and let AI write code"  
✅ "I must understand to debug and maintain"

---

## Next Steps

Once ALL checkboxes in 1.5 are checked:
→ Proceed to Section 2: Technical Planning Phase

**DO NOT SKIP TO CODE**

The next section designs the system architecture. Understanding must come first.

---

**End of Section 1**

Continue to [Section 2: Technical Planning Phase](#2-technical-planning-phase) →
