# MASTER BLUEPRINT - SECTION 2
## Technical Planning Phase (No Code)

> **CRITICAL:** This phase prevents architectural collapse. No code is written until this section is complete.

---

# 2. TECHNICAL PLANNING PHASE

## 2.1 System Architecture Design

### 2.1.1 Complete System Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         USER LAYER                              │
│  Web Browser (Chrome, Firefox, Safari, Edge)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      FRONTEND LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Application (TypeScript)                          │  │
│  │  • User Interface Components                             │  │
│  │  • State Management (React Query)                        │  │
│  │  • Routing (React Router)                                │  │
│  │  • Form Handling & Validation                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ REST API / WebSockets
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       API GATEWAY                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express/Fastify Server                                  │  │
│  │  • Authentication Middleware                             │  │
│  │  • Request Validation                                    │  │
│  │  • Rate Limiting                                         │  │
│  │  • Error Handling                                        │  │
│  │  • Logging                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Function Calls
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Trading Engine (Pure TypeScript)                        │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Core Calculations (Pure Functions)                │ │  │
│  │  │  • Margin calculation                              │ │  │
│  │  │  • PnL calculation                                 │ │  │
│  │  │  • Liquidation logic                               │ │  │
│  │  │  • Position validation                             │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Risk Management                                   │ │  │
│  │  │  • Margin call detection                           │ │  │
│  │  │  • Stop loss / Take profit triggers                │ │  │
│  │  │  • Position limits enforcement                     │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Services                                          │ │  │
│  │  │  • Account Service                                 │ │  │
│  │  │  • Position Service                                │ │  │
│  │  │  • Order Service                                   │ │  │
│  │  │  • Price Service                                   │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Repository Pattern
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      DATA ACCESS LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Repositories                                            │  │
│  │  • User Repository                                       │  │
│  │  • Account Repository                                    │  │
│  │  • Position Repository                                   │  │
│  │  • Transaction Repository                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ SQL Queries
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      DATABASE LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                     │  │
│  │  • User tables                                           │  │
│  │  • Account tables                                        │  │
│  │  • Position tables                                       │  │
│  │  • Transaction tables                                    │  │
│  │  • Price history tables                                  │  │
│  │  • Audit log tables                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
│  • Price Feed (AlphaVantage / yFinance)                         │
│  • Email Service (SendGrid / SMTP)                              │
│  • File Storage (Supabase / S3)                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1.2 Data Flow Example: Place Order

Let's trace a complete request through the system:

```
1. USER CLICKS "BUY EUR/USD"
   ↓
2. FRONTEND
   ├─ Collects form data
   ├─ Shows loading state
   └─ Sends POST /api/orders
      {
        symbol: "EURUSD",
        type: "BUY",
        size: 1.0,
        stopLoss: 1.0800,
        takeProfit: 1.0950
      }
   ↓
3. API GATEWAY
   ├─ Validates JWT token → extracts userId
   ├─ Validates request body → checks format
   ├─ Checks rate limit → allows if under limit
   └─ Routes to Order Service
   ↓
4. ORDER SERVICE
   ├─ Calls Account Repository → get current account
   ├─ Gets current price → from Price Service
   ├─ Calls Trading Engine → validateOrder()
   ├─ Trading Engine checks:
   │  ├─ Has sufficient margin?
   │  ├─ Within position limits?
   │  ├─ Valid stop loss / take profit?
   │  └─ Returns: { allowed: true }
   ├─ Trading Engine calculates:
   │  ├─ Required margin = size / leverage
   │  ├─ Position value = size × price
   │  └─ Returns calculation results
   ├─ Calls Position Repository → create position
   ├─ Calls Account Repository → update used margin
   ├─ Calls Transaction Repository → log transaction
   └─ Returns success response
   ↓
5. API GATEWAY
   └─ Formats response and sends to frontend
      {
        success: true,
        position: {
          id: "pos-123",
          symbol: "EURUSD",
          type: "BUY",
          size: 1.0,
          entryPrice: 1.0875,
          margin: 217.50
        }
      }
   ↓
6. FRONTEND
   ├─ Hides loading state
   ├─ Updates positions list
   ├─ Shows success notification
   └─ Refreshes account summary
```

### 2.1.3 Separation of Concerns

Each layer has ONE job:

| Layer | Single Responsibility | Examples |
|-------|----------------------|----------|
| Frontend | Present data, collect intent | Display balance, show forms |
| API | Validate, route, authenticate | Check JWT, validate input |
| Engine | Business rules, calculations | Calculate margin, check limits |
| Repository | Data access, queries | Save position, get account |
| Database | Store, retrieve, enforce constraints | Foreign keys, check constraints |

**Red Flag:** If a layer does another layer's job → architecture violation

---

## 2.2 Technology Stack (Minimal & Justified)

### 2.2.1 Complete Stack with Justification

| Layer | Technology | Why This Choice | Alternatives Rejected |
|-------|-----------|-----------------|----------------------|
| **Frontend** | React 18 | Industry standard, large ecosystem | Vue (smaller community), Angular (too heavy) |
| | TypeScript | Type safety prevents bugs | JavaScript (too error-prone) |
| | Tailwind CSS | Rapid UI development | Bootstrap (too opinionated), CSS-in-JS (performance) |
| | React Query | Server state management | Redux (overkill), Context (too manual) |
| | Vite | Fast development builds | CRA (slow), Webpack (complex) |
| **Backend** | Node.js 20 LTS | JavaScript everywhere | Python (different language), Go (harder for beginners) |
| | Fastify | Performance, type safety | Express (slower), Hapi (less popular) |
| | TypeScript | Same benefits as frontend | JavaScript (risky for financial app) |
| **Engine** | Pure TypeScript | Testable, no dependencies | In API layer (not testable), microservice (overkill) |
| **Database** | PostgreSQL 16 | ACID compliance, financial integrity | MongoDB (no transactions), MySQL (less features) |
| | Prisma ORM | Type-safe queries, migrations | TypeORM (bugs), Raw SQL (error-prone) |
| **Authentication** | JWT | Stateless, scalable | Sessions (stateful), OAuth (complex for MVP) |
| **Testing** | Vitest | Fast, TypeScript support | Jest (slower), Mocha (less features) |
| **Price Data** | AlphaVantage + yFinance | Free tier available | Paid APIs (too expensive), WebSocket feeds (complex) |
| **File Storage** | Supabase Storage | Free tier, simple API | AWS S3 (complex setup), Local storage (not scalable) |
| **Email** | SendGrid | Free tier, reliable | SMTP (complex), AWS SES (requires AWS) |

### 2.2.2 Cost Breakdown

| Service | Free Tier | Paid Tier | MVP Cost |
|---------|-----------|-----------|----------|
| Hosting (Frontend) | Vercel/Netlify | $0/month | $0 |
| Hosting (Backend) | Railway | $5/month credit | $0-5 |
| Database | Supabase | 500MB free | $0 |
| Redis Cache | Upstash | 10K commands/day | $0 |
| File Storage | Supabase | 1GB free | $0 |
| Email | SendGrid | 100 emails/day | $0 |
| Domain | Namecheap | - | $10/year |
| **TOTAL MVP** | | | **$0-20/month** |

### 2.2.3 Development Tools

| Purpose | Tool | Cost |
|---------|------|------|
| Code Editor | VS Code | Free |
| Database GUI | pgAdmin / DBeaver | Free |
| API Testing | Postman / Thunder Client | Free |
| Version Control | GitHub | Free |
| CI/CD | GitHub Actions | Free (limited) |
| Monitoring | Sentry | Free tier |

---

## 2.3 Database Schema (High-Level)

### 2.3.1 Core Tables Overview

```
users
├── User authentication and profile
├── KYC documents
└── Settings

accounts
├── Trading account per user
├── Balance and equity
└── Margin information

positions
├── Open and closed trades
├── Entry/exit prices
└── PnL calculations

orders
├── Pending orders
├── Market and limit orders
└── Stop loss / Take profit

transactions
├── Balance changes
├── Deposits/withdrawals
└── Profit/loss records

price_ticks
├── Historical prices
└── OHLC data

audit_logs
├── All state changes
├── Admin actions
└── Security events
```

### 2.3.2 Relationships

```
users (1) ─── (1) accounts
              ├─── (many) positions
              ├─── (many) orders
              └─── (many) transactions

positions (many) ─── (1) instruments
orders (many) ─── (1) instruments
price_ticks (many) ─── (1) instruments
```

### 2.3.3 Critical Constraints

**Invariants Enforced by Database:**

1. **Balance cannot be negative:**
   ```sql
   CHECK (balance >= 0)
   ```

2. **Used margin cannot exceed equity:**
   ```sql
   CHECK (used_margin <= equity)
   ```

3. **Position size must be positive:**
   ```sql
   CHECK (size > 0)
   ```

4. **Leverage must be within limits:**
   ```sql
   CHECK (leverage >= 1 AND leverage <= 500)
   ```

5. **Foreign key integrity:**
   ```sql
   FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
   ```

**Red Flag:** If invariant CAN be violated → schema is wrong

---

## 2.4 Security Framework (Financial-Grade Basics)

### 2.4.1 Authentication Flow

```
1. User Registration
   ├─ User submits email + password
   ├─ Backend validates format
   ├─ Backend hashes password (bcrypt, 10 rounds minimum)
   ├─ Backend stores hash (NEVER plain password)
   └─ Backend sends verification email

2. Email Verification
   ├─ User clicks verification link
   ├─ Backend validates token
   └─ Backend activates account

3. Login
   ├─ User submits email + password
   ├─ Backend retrieves user by email
   ├─ Backend compares hash (bcrypt.compare)
   ├─ If match:
   │  ├─ Generate JWT token
   │  ├─ Set expiry (15 minutes access, 7 days refresh)
   │  └─ Return token to frontend
   └─ If no match: Return error (NO HINTS!)

4. Protected Request
   ├─ Frontend sends request with JWT in header
   ├─ Backend validates JWT
   ├─ If valid: Process request
   └─ If invalid: Return 401 Unauthorized
```

### 2.4.2 Security Checklist (Mandatory)

- [ ] **Password Security**
  - Minimum 8 characters
  - Hashed with bcrypt (10+ rounds)
  - Never stored in plain text
  - Never logged
  - Never sent in email

- [ ] **Token Security**
  - JWT signed with secret
  - Short expiry (15 min access)
  - Refresh token for renewal
  - Validated on every request
  - Revocable (blacklist for critical events)

- [ ] **API Security**
  - HTTPS only (no HTTP)
  - CORS configured
  - Rate limiting (5 login attempts per 15 min)
  - Input validation (all fields)
  - SQL injection prevention (Prisma ORM)
  - XSS prevention (sanitize HTML)
  - CSRF protection (SameSite cookies)

- [ ] **Data Security**
  - KYC documents encrypted
  - Personal data encrypted at rest
  - Database backups encrypted
  - API keys in environment variables
  - Secrets never in code

- [ ] **Access Control**
  - Role-based (USER, ADMIN)
  - Resource ownership checks
  - Admin actions logged
  - Sensitive operations require re-authentication

### 2.4.3 Input Validation (Example)

**Never trust user input. Validate everything.**

```typescript
// Trading order validation schema
const orderSchema = z.object({
  symbol: z.string()
    .regex(/^[A-Z]{6}$/)
    .refine(symbol => validSymbols.includes(symbol)),
  type: z.enum(['BUY', 'SELL']),
  size: z.number()
    .positive()
    .min(0.01)
    .max(100),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional()
}).refine(data => {
  // Stop loss must be below entry for BUY
  if (data.type === 'BUY' && data.stopLoss) {
    return data.stopLoss < currentPrice;
  }
  return true;
});

// Use in API
app.post('/orders', async (req, res) => {
  try {
    const validatedData = orderSchema.parse(req.body);
    // Now safe to use validatedData
  } catch (error) {
    return res.status(400).json({ error: 'Invalid input' });
  }
});
```

### 2.4.4 Audit Logging (Financial Requirement)

**Every state change MUST be logged:**

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;          // 'ORDER_PLACED', 'POSITION_CLOSED', etc.
  entityType: string;      // 'Position', 'Account', 'User'
  entityId: string;
  changes: {
    before: any;
    after: any;
  };
  ip: string;
  userAgent: string;
}

// Example usage
await auditLog.create({
  action: 'POSITION_CLOSED',
  userId: user.id,
  entityType: 'Position',
  entityId: position.id,
  changes: {
    before: { status: 'OPEN', pnl: 0 },
    after: { status: 'CLOSED', pnl: 375.50 }
  },
  ip: req.ip,
  userAgent: req.headers['user-agent']
});
```

**Retention:**
- All audit logs: 7 years (financial regulation)
- Trade records: 7 years
- User data: Until deletion requested (GDPR)

---

## 2.5 Business Logic Documentation (Before Code)

### 2.5.1 Core Calculations (English First)

#### Calculation 1: Initial Margin
**English Definition:**
> "The initial margin is the amount of money required from the trader's account to open a position. It is calculated by dividing the position size by the leverage ratio."

**Formula:**
```
Initial Margin = Position Size ÷ Leverage
```

**Example:**
```
Position Size: $100,000 (1.0 lot EUR/USD)
Leverage: 1:100
Initial Margin = $100,000 ÷ 100 = $1,000
```

**TypeScript (Only After English Is Clear):**
```typescript
function calculateInitialMargin(
  positionSize: number,
  leverage: number
): number {
  if (leverage <= 0) {
    throw new Error('Leverage must be positive');
  }
  return positionSize / leverage;
}
```

**Test Cases:**
```typescript
expect(calculateInitialMargin(100000, 100)).toBe(1000);
expect(calculateInitialMargin(50000, 50)).toBe(1000);
expect(() => calculateInitialMargin(100000, 0)).toThrow();
```

#### Calculation 2: Maintenance Margin
**English Definition:**
> "The maintenance margin is the minimum equity required to keep positions open. If equity falls below this level, liquidation occurs. It is typically 50% of the initial margin."

**Formula:**
```
Maintenance Margin = Initial Margin × 0.5
```

**Example:**
```
Initial Margin: $1,000
Maintenance Margin = $1,000 × 0.5 = $500
```

**TypeScript:**
```typescript
function calculateMaintenanceMargin(
  initialMargin: number
): number {
  return initialMargin * 0.5;
}
```

#### Calculation 3: Equity
**English Definition:**
> "Equity is the current total value of the trading account, including both the balance and unrealized profit or loss from open positions."

**Formula:**
```
Equity = Balance + Unrealized PnL
```

**Example:**
```
Balance: $10,000
Open Position PnL: +$500
Equity = $10,000 + $500 = $10,500
```

**TypeScript:**
```typescript
function calculateEquity(
  balance: number,
  unrealizedPnL: number
): number {
  return balance + unrealizedPnL;
}
```

#### Calculation 4: Free Margin
**English Definition:**
> "Free margin is the amount of money available to open new positions. It is calculated by subtracting used margin from equity."

**Formula:**
```
Free Margin = Equity - Used Margin
```

**Example:**
```
Equity: $10,500
Used Margin: $2,000
Free Margin = $10,500 - $2,000 = $8,500
```

**TypeScript:**
```typescript
function calculateFreeMargin(
  equity: number,
  usedMargin: number
): number {
  return equity - usedMargin;
}
```

#### Calculation 5: Margin Level
**English Definition:**
> "Margin level is the ratio of equity to used margin, expressed as a percentage. It indicates account health. Below 100% means cannot open new positions. Below 50% triggers margin call. Below 20% triggers liquidation."

**Formula:**
```
Margin Level = (Equity ÷ Used Margin) × 100
```

**Example:**
```
Equity: $10,500
Used Margin: $2,000
Margin Level = ($10,500 ÷ $2,000) × 100 = 525%
```

**TypeScript:**
```typescript
function calculateMarginLevel(
  equity: number,
  usedMargin: number
): number {
  if (usedMargin === 0) return Infinity;
  return (equity / usedMargin) * 100;
}

function getMarginStatus(marginLevel: number): MarginStatus {
  if (marginLevel >= 100) return 'HEALTHY';
  if (marginLevel >= 50) return 'WARNING';
  if (marginLevel >= 20) return 'MARGIN_CALL';
  return 'LIQUIDATION';
}
```

#### Calculation 6: Unrealized PnL (Forex)
**English Definition:**
> "Unrealized profit or loss is the floating gain or loss from open positions. For forex, it is calculated as the difference between current price and entry price, multiplied by position size, adjusted for direction (buy/sell)."

**Formula:**
```
For BUY: PnL = (Current Price - Entry Price) × Position Size
For SELL: PnL = (Entry Price - Current Price) × Position Size
```

**Example:**
```
Entry Price: 1.0850
Current Price: 1.0875
Position Size: 100,000 (1.0 lot)
Type: BUY
PnL = (1.0875 - 1.0850) × 100,000 = 0.0025 × 100,000 = $250
```

**TypeScript:**
```typescript
function calculateForexPnL(
  entryPrice: number,
  currentPrice: number,
  size: number,
  type: 'BUY' | 'SELL'
): number {
  const priceDiff = type === 'BUY' 
    ? currentPrice - entryPrice 
    : entryPrice - currentPrice;
  
  return priceDiff * size;
}
```

#### Calculation 7: Liquidation Check
**English Definition:**
> "Liquidation occurs when equity falls below maintenance margin. When this happens, the system must automatically close positions to prevent negative balance."

**Logic:**
```
IF Equity < Maintenance Margin THEN
  Liquidate positions (highest risk first)
UNTIL
  Equity >= Maintenance Margin
  OR
  All positions closed
END
```

**TypeScript:**
```typescript
interface LiquidationCheck {
  shouldLiquidate: boolean;
  marginLevel: number;
  deficit: number;
}

function checkLiquidation(
  equity: number,
  maintenanceMargin: number,
  usedMargin: number
): LiquidationCheck {
  const shouldLiquidate = equity < maintenanceMargin;
  const marginLevel = calculateMarginLevel(equity, usedMargin);
  const deficit = maintenanceMargin - equity;
  
  return {
    shouldLiquidate,
    marginLevel,
    deficit: Math.max(0, deficit)
  };
}
```

### 2.5.2 Business Rules (English First)

#### Rule 1: Position Limits
**English:**
> "A user cannot open more than their account's maximum position limit. This prevents excessive risk exposure."

**Validation:**
```typescript
function canOpenPosition(
  currentPositions: number,
  maxPositions: number
): { allowed: boolean; reason?: string } {
  if (currentPositions >= maxPositions) {
    return {
      allowed: false,
      reason: `Maximum positions reached (${maxPositions})`
    };
  }
  return { allowed: true };
}
```

#### Rule 2: Minimum Position Size
**English:**
> "Each asset class has a minimum position size. Orders below this size are rejected."

**Minimums:**
- Forex: 0.01 lots (1,000 units)
- Commodities: Varies by instrument
- Indices: $1 per point
- Crypto: 0.001 BTC, 0.01 ETH, $10 altcoins
- Stocks: 0.1 shares

**Validation:**
```typescript
function validatePositionSize(
  size: number,
  assetClass: AssetClass
): { valid: boolean; reason?: string } {
  const minimums = {
    FOREX: 0.01,
    COMMODITY: 0.01,
    INDEX: 1,
    CRYPTO: 0.001,
    STOCK: 0.1
  };
  
  const minSize = minimums[assetClass];
  if (size < minSize) {
    return {
      valid: false,
      reason: `Minimum size for ${assetClass} is ${minSize}`
    };
  }
  
  return { valid: true };
}
```

#### Rule 3: Stop Loss Validation
**English:**
> "Stop loss must be set on the correct side of entry price. For BUY positions, stop loss must be below entry. For SELL positions, stop loss must be above entry."

**Validation:**
```typescript
function validateStopLoss(
  type: 'BUY' | 'SELL',
  entryPrice: number,
  stopLoss: number | undefined
): { valid: boolean; reason?: string } {
  if (!stopLoss) return { valid: true }; // Optional
  
  if (type === 'BUY' && stopLoss >= entryPrice) {
    return {
      valid: false,
      reason: 'Stop loss must be below entry price for BUY'
    };
  }
  
  if (type === 'SELL' && stopLoss <= entryPrice) {
    return {
      valid: false,
      reason: 'Stop loss must be above entry price for SELL'
    };
  }
  
  return { valid: true };
}
```

#### Rule 4: Sufficient Margin
**English:**
> "User must have sufficient free margin to open a position. Free margin must be at least equal to the required initial margin."

**Validation:**
```typescript
function hasSufficientMargin(
  freeMargin: number,
  requiredMargin: number
): { sufficient: boolean; reason?: string } {
  if (freeMargin < requiredMargin) {
    return {
      sufficient: false,
      reason: `Insufficient margin. Required: $${requiredMargin}, Available: $${freeMargin}`
    };
  }
  
  return { sufficient: true };
}
```

### 2.5.3 State Machines

#### Position State Machine
```
[PENDING] ──────────> [OPEN] ──────────> [CLOSED]
    │                    │
    │                    │
    └─── Rejected ───────┴─── Liquidated ───> [CLOSED]
```

**States:**
- PENDING: Order placed, waiting for execution
- OPEN: Position active, PnL updating
- CLOSED: Position closed, PnL realized

**Transitions:**
- PENDING → OPEN: Order executed
- PENDING → CLOSED: Order rejected or cancelled
- OPEN → CLOSED: User closes, SL/TP hit, or liquidated

**TypeScript:**
```typescript
type PositionStatus = 'PENDING' | 'OPEN' | 'CLOSED';

interface PositionTransition {
  from: PositionStatus;
  to: PositionStatus;
  trigger: string;
  validations: ((position: Position) => boolean)[];
}

const transitions: PositionTransition[] = [
  {
    from: 'PENDING',
    to: 'OPEN',
    trigger: 'EXECUTE',
    validations: [
      (p) => p.marginUsed <= account.freeMargin,
      (p) => account.positions.length < account.maxPositions
    ]
  },
  {
    from: 'OPEN',
    to: 'CLOSED',
    trigger: 'USER_CLOSE',
    validations: []
  },
  // ... more transitions
];
```

---

## 2.6 Frontend UI/UX Specifications

### 2.6.1 Required Pages

| Page | Purpose | Key Features |
|------|---------|--------------|
| Landing | Marketing, conversion | Hero, features, pricing, CTA |
| Register | User signup | Email, password, social login |
| KYC | Document upload | ID upload, address proof |
| Login | Authentication | Email/password, remember me |
| Dashboard | Overview | Balance, P&L, positions |
| Markets | Browse instruments | Search, filter, charts |
| Trade | Order entry | Size, SL/TP, margin calculator |
| Positions | Manage open trades | List, modify, close |
| History | Past trades | Filter, export, stats |
| Account | Settings | Profile, password, preferences |
| Admin | Platform management | Users, KYC, reports |

### 2.6.2 User Flows (Detailed)

#### Flow 1: Complete User Journey (New User to First Trade)

```
Step 1: Discovery
├─ User lands on homepage
├─ Views features and benefits
└─ Clicks "Get Started"

Step 2: Registration
├─ Enters email and password
├─ (Optional) Social login (Google/Apple)
├─ Submits registration form
└─ Receives verification email

Step 3: Email Verification
├─ Clicks link in email
├─ Account activated
└─ Redirected to onboarding

Step 4: Onboarding
├─ Fills out personal information
│  ├─ Full name
│  ├─ Date of birth
│  ├─ Country
│  └─ Phone number
├─ Provides trading experience info
│  ├─ Experience level
│  ├─ Trading goals
│  └─ Risk tolerance
├─ Reads and accepts risk disclosure
└─ Accepts terms and conditions

Step 5: KYC Submission
├─ Uploads identity document
│  ├─ Passport, driver's license, or ID card
│  └─ Both front and back photos
├─ Uploads address proof
│  ├─ Utility bill or bank statement
│  └─ Must be recent (< 3 months)
├─ Submits for review
└─ Waits for admin approval

Step 6: Approval & Fund Allocation
├─ Admin reviews KYC documents
├─ Admin approves account
├─ Admin allocates initial virtual funds ($10,000)
└─ User receives approval email

Step 7: First Login After Approval
├─ Sees welcome modal
├─ Optional guided tour
└─ Dashboard displays with initial balance

Step 8: First Trade
├─ Navigates to Markets page
├─ Selects EUR/USD
├─ Clicks "Trade"
├─ Trade panel opens
│  ├─ Selects BUY
│  ├─ Enters size: 1.0 lot
│  ├─ Sets stop loss: 1.0800
│  ├─ Sets take profit: 1.0950
│  └─ Reviews margin required: $217
├─ Clicks "Execute BUY"
├─ Confirmation modal appears
├─ Confirms trade
└─ Position opens successfully

Step 9: Monitoring Position
├─ Views position in "Open Positions" list
├─ Sees real-time P&L updates
├─ Can modify SL/TP
└─ Can close position anytime
```

### 2.6.3 Error States (Must Be Defined)

| Scenario | Error Displayed | User Action |
|----------|----------------|-------------|
| Insufficient margin | "Insufficient margin. Required: $217, Available: $150" | Add funds or reduce size |
| Invalid stop loss | "Stop loss must be below entry price for BUY positions" | Correct stop loss |
| Position limit reached | "Maximum 100 positions reached. Close positions to continue" | Close positions |
| Market closed | "EUR/USD market is closed. Opens Monday 00:00 UTC" | Wait or trade other markets |
| Network error | "Connection lost. Retrying..." | Auto-retry or refresh |
| Server error | "Something went wrong. Please try again" | Contact support if persists |
| Session expired | "Session expired. Please log in again" | Redirect to login |
| KYC rejected | "KYC rejected: Poor photo quality. Please resubmit" | Upload new documents |

### 2.6.4 Loading States

Every async action needs a loading state:

```typescript
// Bad: No feedback
<button onClick={handleTrade}>Trade</button>

// Good: Loading feedback
<button onClick={handleTrade} disabled={loading}>
  {loading ? 'Processing...' : 'Trade'}
</button>
```

**Required Loading Indicators:**
- Page loads: Full-screen spinner
- Button clicks: Button text changes + disabled
- Data fetching: Skeleton screens
- File uploads: Progress bar

### 2.6.5 Real-Time Data Requirements

| Data | Update Frequency | Method |
|------|-----------------|--------|
| Open position prices | 1 second | WebSocket |
| Account balance | On trade close | WebSocket |
| Unrealized P&L | 1 second | WebSocket |
| Market prices (watchlist) | 5 seconds | WebSocket |
| Market status | 1 minute | Polling |

**UI Rule:** If UI calculates instead of displaying backend data → architecture broken

---

## 2.7 API Design (Intent-Based)

### 2.7.1 RESTful API Principles

**Core Principles:**
1. Resources are nouns (positions, accounts, orders)
2. HTTP methods express actions (GET, POST, PUT, DELETE)
3. Status codes indicate outcomes (200, 400, 500)
4. Responses are consistent JSON
5. Errors include helpful messages

### 2.7.2 Complete API Specification

#### Authentication Endpoints

**POST /api/auth/register**
```typescript
Request:
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  dateOfBirth: string; // ISO 8601
}

Response (201):
{
  success: true;
  message: "Registration successful. Please verify your email."
  userId: string;
}

Errors:
400: Invalid input
409: Email already exists
```

**POST /api/auth/login**
```typescript
Request:
{
  email: string;
  password: string;
}

Response (200):
{
  success: true;
  accessToken: string; // JWT, expires in 15min
  refreshToken: string; // Expires in 7 days
  user: {
    id: string;
    email: string;
    firstName: string;
    kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  }
}

Errors:
400: Invalid input
401: Invalid credentials
403: Account suspended
```

**POST /api/auth/logout**
```typescript
Request:
Headers: { Authorization: "Bearer <token>" }

Response (200):
{
  success: true;
  message: "Logged out successfully"
}
```

#### Account Endpoints

**GET /api/account**
```typescript
Request:
Headers: { Authorization: "Bearer <token>" }

Response (200):
{
  success: true;
  data: {
    id: string;
    balance: number;
    equity: number;
    usedMargin: number;
    freeMargin: number;
    marginLevel: number;
    leverage: {
      forex: number;
      commodities: number;
      indices: number;
      crypto: number;
      stocks: number;
    };
    openPositions: number;
    todayPnL: number;
  }
}

Errors:
401: Unauthorized
404: Account not found
```

#### Position Endpoints

**GET /api/positions**
```typescript
Request:
Headers: { Authorization: "Bearer <token>" }
Query: { status?: 'OPEN' | 'CLOSED'; limit?: number; offset?: number }

Response (200):
{
  success: true;
  data: {
    positions: Position[];
    total: number;
    offset: number;
    limit: number;
  }
}
```

**POST /api/positions**
```typescript
Request:
Headers: { Authorization: "Bearer <token>" }
Body:
{
  symbol: string; // 'EURUSD'
  type: 'BUY' | 'SELL';
  size: number;
  stopLoss?: number;
  takeProfit?: number;
}

Response (201):
{
  success: true;
  data: {
    position: {
      id: string;
      symbol: string;
      type: 'BUY' | 'SELL';
      size: number;
      entryPrice: number;
      stopLoss: number | null;
      takeProfit: number | null;
      marginUsed: number;
      unrealizedPnL: number;
      openedAt: string;
    }
  }
}

Errors:
400: Invalid input
403: Insufficient margin / Position limit reached
422: Market closed
```

**PUT /api/positions/:id/close**
```typescript
Request:
Headers: { Authorization: "Bearer <token>" }
Params: { id: string }

Response (200):
{
  success: true;
  data: {
    position: {
      id: string;
      status: 'CLOSED';
      closedAt: string;
      closedPrice: number;
      realizedPnL: number;
    }
  }
}

Errors:
401: Unauthorized
404: Position not found
409: Position already closed
```

**PUT /api/positions/:id/modify**
```typescript
Request:
Headers: { Authorization: "Bearer <token>" }
Params: { id: string }
Body:
{
  stopLoss?: number;
  takeProfit?: number;
}

Response (200):
{
  success: true;
  data: {
    position: {
      id: string;
      stopLoss: number | null;
      takeProfit: number | null;
    }
  }
}

Errors:
400: Invalid stop loss / take profit
404: Position not found
```

#### Market Data Endpoints

**GET /api/markets**
```typescript
Request:
Query: { assetClass?: string; search?: string }

Response (200):
{
  success: true;
  data: {
    instruments: {
      symbol: string;
      name: string;
      assetClass: string;
      currentPrice: number;
      change24h: number;
      changePercent: number;
      bid: number;
      ask: number;
      spread: number;
      isOpen: boolean;
    }[]
  }
}
```

**GET /api/markets/:symbol/price**
```typescript
Request:
Params: { symbol: string }

Response (200):
{
  success: true;
  data: {
    symbol: string;
    bid: number;
    ask: number;
    mid: number;
    timestamp: string;
  }
}

Errors:
404: Symbol not found
```

#### KYC Endpoints

**POST /api/kyc**
```typescript
Request:
Headers: { Authorization: "Bearer <token>" }
Body: FormData
{
  identityDocType: 'PASSPORT' | 'DRIVERS_LICENSE' | 'ID_CARD';
  identityFront: File;
  identityBack: File;
  addressDocType: 'UTILITY_BILL' | 'BANK_STATEMENT';
  addressDoc: File;
}

Response (201):
{
  success: true;
  message: "KYC submitted for review"
  submissionId: string;
}

Errors:
400: Invalid file format / size
409: KYC already submitted
```

**GET /api/kyc/status**
```typescript
Request:
Headers: { Authorization: "Bearer <token>" }

Response (200):
{
  success: true;
  data: {
    status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
    submittedAt: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
  }
}
```

#### Admin Endpoints

**GET /api/admin/kyc**
```typescript
Request:
Headers: { Authorization: "Bearer <admin-token>" }
Query: { status?: string; limit?: number; offset?: number }

Response (200):
{
  success: true;
  data: {
    submissions: {
      id: string;
      userId: string;
      userEmail: string;
      userName: string;
      identityDocType: string;
      addressDocType: string;
      submittedAt: string;
      status: string;
    }[]
  }
}
```

**PUT /api/admin/kyc/:id/approve**
```typescript
Request:
Headers: { Authorization: "Bearer <admin-token>" }
Params: { id: string }
Body:
{
  initialFunds: number; // Amount to credit
  comment?: string;
}

Response (200):
{
  success: true;
  message: "KYC approved and funds credited"
}

Errors:
403: Not authorized (must be admin)
404: Submission not found
409: Already processed
```

**PUT /api/admin/kyc/:id/reject**
```typescript
Request:
Headers: { Authorization: "Bearer <admin-token>" }
Params: { id: string }
Body:
{
  reason: string;
  comment?: string;
}

Response (200):
{
  success: true;
  message: "KYC rejected"
}
```

### 2.7.3 WebSocket Events

**Connection:**
```typescript
ws://api.example.com/ws?token=<jwt>
```

**Client → Server Events:**
```typescript
// Subscribe to price updates
{
  type: 'SUBSCRIBE_PRICES',
  symbols: ['EURUSD', 'BTCUSD', 'GOLD']
}

// Unsubscribe
{
  type: 'UNSUBSCRIBE_PRICES',
  symbols: ['EURUSD']
}
```

**Server → Client Events:**
```typescript
// Price update
{
  type: 'PRICE_UPDATE',
  data: {
    symbol: 'EURUSD',
    bid: 1.0873,
    ask: 1.0875,
    timestamp: '2026-02-05T10:30:00Z'
  }
}

// Position update
{
  type: 'POSITION_UPDATE',
  data: {
    positionId: 'pos-123',
    unrealizedPnL: 375.50,
    currentPrice: 1.0875
  }
}

// Account update
{
  type: 'ACCOUNT_UPDATE',
  data: {
    balance: 10375.50,
    equity: 10750.50,
    usedMargin: 2000,
    freeMargin: 8750.50,
    marginLevel: 537.5
  }
}

// Position closed (by SL/TP)
{
  type: 'POSITION_CLOSED',
  data: {
    positionId: 'pos-123',
    closedPrice: 1.0900,
    realizedPnL: 500,
    reason: 'TAKE_PROFIT'
  }
}

// Margin call
{
  type: 'MARGIN_CALL',
  data: {
    marginLevel: 45,
    message: 'Your margin level is below 50%. Please add funds or close positions.'
  }
}

// Liquidation warning
{
  type: 'LIQUIDATION_WARNING',
  data: {
    marginLevel: 22,
    message: 'Critical: Liquidation imminent. Close positions immediately.'
  }
}
```

### 2.7.4 API Conventions

**Success Response Format:**
```typescript
{
  success: true,
  data: { ... },
  message?: string
}
```

**Error Response Format:**
```typescript
{
  success: false,
  error: {
    code: string;        // 'INSUFFICIENT_MARGIN'
    message: string;     // Human-readable
    details?: any;       // Additional context
  }
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad request (invalid input)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not allowed)
- 404: Not found
- 409: Conflict (duplicate, already exists)
- 422: Unprocessable (business rule violation)
- 429: Too many requests
- 500: Server error

---

## Section 2 Completion Checklist

Before proceeding to Section 3, verify:

- [ ] System architecture diagram understood
- [ ] Technology choices justified
- [ ] Database schema high-level clear
- [ ] Security requirements documented
- [ ] Business logic written in English first
- [ ] All calculations have formulas
- [ ] UI/UX pages defined
- [ ] User flows documented
- [ ] API endpoints specified
- [ ] Error states defined
- [ ] Real-time requirements clear

**Red Flag:** If any checkbox unchecked → Review that subsection

---

**End of Section 2**

Continue to Section 3: Legal and Compliance Preparation →
