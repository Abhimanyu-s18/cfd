# Blueprint-to-Codebase Cross-Reference Map
## Find Exactly Where Each Blueprint Concept is Implemented

**Purpose:** Quick lookup - where in your code does each blueprint section apply?  
**Updated:** February 12, 2026  

---

## 📚 MASTER_BLUEPRINT_PART1.md References

### Section 1.1: Essential Programming Concepts

| Concept | In Your Project | File/Location | Status |
|---------|-----------------|---------------|--------|
| **Variables** | Account state, position data | `types/domain.ts` | ✅ |
| **Functions** | Edge Functions, calculations | `supabase/functions/` | ✅ |
| **Pure Functions** | Margin/PnL calculations | `engine/calculations/` or Edge Func | ✅ |
| **State** | Account, positions, orders | Database tables: `accounts`, `positions` | ✅ |
| **Events** | Position opened, order placed, liquidated | Real-time subscriptions? | ⏳ |
| **Invariants** | Balance ≥ 0, margin rules | Database constraints | ✅ |
| **Side Effects** | Database writes, API calls | Edge Functions handle | ✅ |
| **Dependencies** | Database, Supabase Auth | `supabase/config.ts` | ✅ |

**Action:** Review [types/domain.ts](types/domain.ts) to verify variable naming is clear

---

### Section 1.2: CFD Trading Terminology

| Term | In Your Database | Table/Field | Calculation |
|------|-----------------|-------------|-------------|
| **CFD** | Conceptual (all trades are CFD) | positions.type | - |
| **Leverage** | accounts.leverage | schema.sql | ✅ |
| **Initial Margin** | Calculated | position.margin_required | Formula: size ÷ leverage |
| **Maintenance Margin** | Calculated | Derived in Edge Function | Formula: initial × 0.5 |
| **Equity** | accounts.equity | Trigger or calculated | Formula: balance + unrealized_pnl |
| **Unrealized PnL** | positions.unrealized_pnl | Trigger on price update | Formula: (cur - entry) × size |
| **Liquidation** | positions.status = 'closed' | Triggered by Edge Function | When equity < maint margin |
| **Mark Price** | Fetched from API | price_ticks table | Real-time feed? |
| **Margin Level** | Calculated | (equity / used_margin) × 100 | Check liquidation point |
| **Free Margin** | equity - used_margin | Available for new trades | Prevents over-leverage |

**Action:** Check [setup-supabase-complete.sql](scripts/setup-supabase-complete.sql) - do all fields exist?

**Question to Answer:** Where is **mark price** fetched from?
- [ ] AlphaVantage API?
- [ ] yFinance?
- [ ] Real-time feed?
- [ ] Location: ________________________

---

### Section 1.3-1.4: Web Architecture & Full-Stack Blueprint

| Layer | Your Technology | Location | Purpose |
|-------|-----------------|----------|---------|
| **Frontend** | React + TypeScript | `frontend/src/` | User interface, Zustand state |
| **API Gateway** | Supabase Edge Functions | `supabase/functions/` | Request routing, validation |
| **Business Logic** | Edge Functions + Database | `supabase/functions/` | Margin calc, liquidation, PnL |
| **Data Access** | Supabase client | `supabase/index.ts` | Query database |
| **Database** | PostgreSQL via Supabase | Schema: 11 tables | Enforce invariants, audit |
| **Authentication** | Supabase Auth (JWT) | `supabase/auth.ts` | User login, token validation |

**Data Flow Verification (Part 2, Section 2.1.2):**

```
Place Order Flow:
1. React component (frontend/src/components/TradeEntry/)
2. → Send to API (supabase/functions/create-position)
3. → Backend validates (Edge Function)
4. → Creates in database (positions table)
5. → Returns result to frontend
6. → Display to user (React re-renders)

[ ] Can you trace this in the actual code?
```

**Reference:** [MASTER_BLUEPRINT_PART2.md - Section 2.1](docs/architecture/MASTER_BLUEPRINT_PART2.md#211-complete-system-diagram)

---

## 📊 MASTER_BLUEPRINT_PART2.md References

### Section 2.2: Technology Stack

| Layer | Your Choice | File | Installed |
|-------|-------------|------|-----------|
| **Frontend** | React 18 + TS | `package.json` / `frontend/package.json` | ✅ |
| **State** | Zustand | `frontend/package.json` | ✅ |
| **Backend** | Supabase Edge Functions | `supabase/functions/` | ✅ |
| **Database** | PostgreSQL 16 | Supabase hosted | ✅ |
| **Auth** | JWT via Supabase | `supabase/auth.ts` | ✅ |
| **ORM** | Supabase client / Direct SQL | `supabase/` | ✅ |
| **Testing** | Jest/Vitest | `jest.config.js` | ✅ |
| **Build** | Vite (frontend) | Root `vite.config.ts` | ✅ |

- [ ] All stack matches Part 2, Section 2.2?
- [ ] Any missing/deviating choices?

---

### Section 2.3: Database Schema

**Expected Tables (from blueprint Section 2.3.1):**

| Table | Created | Functions | Constraints | Audit Log |
|-------|---------|-----------|-------------|-----------|
| **users** | ✅ / ⏳ / ❌ | Auth, KYC | Email unique | Yes / No |
| **accounts** | ✅ / ⏳ / ❌ | Trading core | Balance ≥ 0 | Yes / No |
| **positions** | ✅ / ⏳ / ❌ | Open trades | Leverage limits | Yes / No |
| **orders** | ✅ / ⏳ / ❌ | Pending orders | - | Yes / No |
| **transactions** | ✅ / ⏳ / ❌ | History | - | Yes / No |
| **price_ticks** | ✅ / ⏳ / ❌ | Price history | - | Optional |
| **audit_logs** | ✅ / ⏳ / ❌ | Compliance | - | N/A |

**Schema Location:** [scripts/setup-supabase-complete.sql](scripts/setup-supabase-complete.sql)

**Validation Tasks:**

```sql
-- Check schema status
[ ] \dt -- List all tables
[ ] \d accounts -- Check structure
[ ] SELECT constraint_name FROM information_schema.table_constraints 
      WHERE table_name='accounts';

Key constraints to verify:
[ ] Balance non-negative
[ ] Leverage limits
[ ] Margin requirements
[ ] Foreign keys
[ ] Unique constraints
```

**What's Missing (if anything):**
1. ________________________
2. ________________________

---

### Section 2.4: Security Framework

**Authentication (Part 2, Section 2.4.1):**

| Component | Your Implementation | Location | Status |
|-----------|-------------------|----------|--------|
| Registration | Supabase Auth | `supabase/auth.ts` + Edge Function | ✅ |
| Login | JWT tokens | `supabase/auth.ts` | ✅ |
| Session management | Client-side token storage | `frontend/hooks/useAuth.ts` | ✅ |
| Token refresh | Supabase session renewal | `supabase/` | ✅ |
| Logout | Token invalidation | Frontend cleanup | ✅ |

**Input Validation (Part 2, Section 2.4.2):**

| Validation Type | Implemented | Location | Examples |
|-----------------|-------------|----------|----------|
| Type validation | TypeScript | `types/` | ✅ |
| Range checking | Edge Functions | `supabase/functions/` | Position size, leverage |
| Format validation | TypeScript + Edge Func | - | Email, dates |
| Business rules | Database constraints | schema.sql | Balance ≥ 0 |

**Questions to Answer:**

```
[ ] Where is form input validated? ________________________
[ ] Where is Edge Function input validated? ________________________
[ ] Where is database-level validation? ________________________
[ ] What happens if validation fails? ________________________
```

**Audit Logging (Part 2, Section 2.4.3):**

| Event | Logged? | Location | Details |
|-------|---------|----------|---------|
| User login | ✅ / ⏳ | - | User ID, timestamp |
| Position opened | ✅ / ⏳ | - | All trade details |
| Position closed | ✅ / ⏳ | - | Entry, exit, PnL |
| Balance changed | ✅ / ⏳ | - | Amount, reason |
| Admin action | ✅ / ⏳ | - | What, who, when |

---

### Section 2.5: Business Logic Documentation

**7 Core Calculations - Where Are They?**

#### 1️⃣ Margin Calculation

**Blueprint Location:** Section 1.2.3, 1.2.4  
**Formula:**
```
Initial Margin = Position Size ÷ Leverage
Maintenance Margin = Initial Margin × 0.5
```

**In Your Code:**
- [ ] Function name: ________________________
- [ ] File location: ________________________
- [ ] Pure function? YES / NO
- [ ] Tested? YES / NO

---

#### 2️⃣ PnL Calculation

**Blueprint Location:** Section 1.2.6  
**Formula:**
```
For BUY: Unrealized PnL = (Current - Entry) × Size
For SELL: Unrealized PnL = (Entry - Current) × Size
```

**In Your Code:**
- [ ] Function name: ________________________
- [ ] File location: ________________________
- [ ] Handles both BUY/SELL? YES / NO
- [ ] Tested? YES / NO

---

#### 3️⃣ Equity Calculation

**Blueprint Location:** Section 1.2.5  
**Formula:**
```
Equity = Balance + Unrealized PnL
```

**In Your Code:**
- [ ] Calculated where? Database trigger / Edge Function / Frontend
- [ ] Real-time update? YES / NO
- [ ] Location: ________________________

---

#### 4️⃣ Margin Level

**Blueprint Location:** Implicit  
**Formula:**
```
Margin Level = (Equity ÷ Used Margin) × 100
```

**In Your Code:**
- [ ] Calculated? YES / NO
- [ ] Function location: ________________________
- [ ] Displayed to user? YES / NO

---

#### 5️⃣ Free Margin

**Blueprint Location:** Implicit  
**Formula:**
```
Free Margin = Equity - Used Margin
```

**In Your Code:**
- [ ] Calculated? YES / NO
- [ ] Function location: ________________________
- [ ] Used for position limits? YES / NO

---

#### 6️⃣ Liquidation Trigger

**Blueprint Location:** Section 1.2.7, Part 2 Section 2.5.6  
**Rule:**
```
IF Equity < Maintenance Margin → LIQUIDATE IMMEDIATELY
NOT when Balance = 0
```

**In Your Code:**
- [ ] Function/Trigger name: ________________________
- [ ] Trigger type: Edge Function / Database Trigger / Both
- [ ] Tests exist? YES / NO
- [ ] Can demonstrate? YES / NO

---

#### 7️⃣ Account Balance Updates

**Blueprint Location:** Section 1.2, Part 2 Section 2.5.7  
**Rules:**
```
When position closes: balance += realized_pnl
When deposit received: balance += amount
When withdrawal: balance -= amount
CONSTRAINT: balance >= 0 (always!)
```

**In Your Code:**
- [ ] Sources of change identified? YES / NO
- [ ] All handled? YES / NO
- [ ] Non-negativity enforced? YES / NO (how? ________________________)

---

### Section 2.6: Frontend UI/UX Specifications

**Required Pages (Part 2, Section 2.6):**

| Page | Status | Location | Features |
|------|--------|----------|----------|
| **Login** | ✅ / ⏳ / ❌ | `frontend/src/pages/` | - |
| **Register** | ✅ / ⏳ / ❌ | `frontend/src/pages/` | KYC? |
| **Dashboard** | ✅ / ⏳ / ❌ | `frontend/src/pages/` | Balance, equity, margin level |
| **Markets** | ✅ / ⏳ / ❌ | `frontend/src/pages/` | Price ticker, one-click trade |
| **Trade Entry** | ✅ / ⏳ / ❌ | `frontend/src/components/` | Size, SL, TP |
| **Positions** | ✅ / ⏳ / ❌ | `frontend/src/pages/` | Open trades, close buttons |
| **Order History** | ✅ / ⏳ / ❌ | `frontend/src/pages/` | Closed trades, filters |
| **Admin Panel** | ✅ / ⏳ / ❌ | `frontend/src/pages/admin/` | User mgmt, balance adjust |

**Missing Pages:**
1. ________________________
2. ________________________

---

### Section 2.7: API Design

**All Edge Functions (Part 2, Section 2.7):**

| Endpoint | Method | Purpose | Location | Implemented |
|----------|--------|---------|----------|-------------|
| `POST /auth/register` | POST | Create account | `supabase/functions/register` | ✅ / ⏳ |
| `POST /auth/login` | POST | Get JWT | Supabase Auth | ✅ |
| `GET /account` | GET | Get account state | `supabase/functions/...` | ✅ / ⏳ |
| `POST /positions` | POST | Open position | `supabase/functions/create-position` | ✅ / ⏳ |
| `GET /positions` | GET | List positions | `supabase/functions/...` | ✅ / ⏳ |
| `POST /positions/:id/close` | POST | Close position | `supabase/functions/...` | ✅ / ⏳ |
| `GET /prices/:symbol` | GET | Current prices | `supabase/functions/...` | ✅ / ⏳ |
| `POST /admin/users/:id/balance` | POST | Adjust balance | `supabase/functions/...` | ✅ / ⏳ |

**Missing Endpoints:**
1. ________________________
2. ________________________

**Request/Response Validation (Part 2, Section 2.7.3):**

```
[ ] All endpoints validate input?
[ ] All endpoints return consistent error format?
[ ] All endpoints check authentication?
[ ] All endpoints check authorization?
[ ] All endpoints return typed responses?

Example response format:
{
  "success": true/false,
  "data": {...},
  "error": "Human-readable message if failed"
}
```

---

## 📋 MASTER_BLUEPRINT_PART3.md References

### Section 3: Legal & Compliance

**Required Documents (Part 3, Section 3.2):**

| Document | Needed | Created | Location | Review Status |
|----------|--------|---------|----------|----------------|
| **Terms of Service** | ✅ | ✅ / ⏳ / ❌ | `docs/legal/` | - / Pending / Done |
| **Privacy Policy** | ✅ | ✅ / ⏳ / ❌ | `docs/legal/` | - / Pending / Done |
| **Risk Disclosure** | ✅ | ✅ / ⏳ / ❌ | `docs/legal/` | - / Pending / Done |
| **Cookie Policy** | ⏳ | ✅ / ⏳ / ❌ | `docs/legal/` | - / Optional |

**Frontend Display:**

```
[ ] Terms link in footer?
[ ] Privacy link in footer?
[ ] Risk disclosure shown on registration?
[ ] Acknowledgment checkbox before first trade?
[ ] Disclaimers on dashboard?
```

---

### Section 4: Project Management Setup

**Git Strategy (Part 3, Section 4.2):**

```
[ ] Main branch protected
[ ] Branch naming convention defined
[ ] Commit message format documented
[ ] Code review process established
[ ] Deployment checklist created
```

**Backup Strategy (Part 3, Section 4.3):**

```
[ ] Daily database backup?
[ ] Weekly backup?
[ ] Cloud storage for backups?
[ ] Restore tested?
[ ] Backup schedule documented?
```

**Testing Strategy (Part 3, Section 4.4):**

```
[ ] Unit tests setup?
[ ] Integration tests setup?
[ ] E2E tests setup?
[ ] Coverage targets (80%+)?
[ ] Before deploy gate?
```

---

### Section 5: Resource Preparation

**Documentation Templates (Part 3, Section 5.1):**

| Template | Needed | Created | Location |
|----------|--------|---------|----------|
| **ADR Template** | ✅ | ✅ / ⏳ | `docs/architecture-decisions/` |
| **API Spec Template** | ✅ | ✅ / ⏳ | `docs/api/` |
| **Invariants Doc** | ✅ | ✅ / ⏳ | `docs/invariants.md` |
| **Testing Guide** | ✅ | ✅ / ⏳ | `docs/TESTING.md` |

---

### Section 6: Risk Mitigation

**8-Week Roadmap (Part 3, Section 6.3):**

| Week | Goal | Status | Actual Hours |
|------|------|--------|--------------|
| **Week 1** | Core engine + tests | ⏳ | - |
| **Week 2** | Database + auth | ⏳ | - |
| **Week 3** | Basic API endpoints | ⏳ | - |
| **Week 4** | Risk management | ⏳ | - |
| **Week 5** | Frontend UI | ⏳ | - |
| **Week 6** | Real-time prices | ⏳ | - |
| **Week 7** | Admin panel | ⏳ | - |
| **Week 8** | Polish + deploy | ⏳ | - |

**Quality Gates (Part 3, Section 6.5):**

```
Before deployment MUST have:
[ ] All unit tests passing
[ ] All integration tests passing
[ ] Code review approval
[ ] Calculations verified against blueprint
[ ] No console errors
[ ] Documented decisions
```

---

## 🔗 SETUP_GUIDE.md References

**Component Library Patterns (SETUP_GUIDE.md):**

| Pattern | Your Project | Status |
|---------|--------------|--------|
| **Storybook** | Add to frontend? | ⏳ |
| **Component structure** | Aligns with ours? | ✅ / ⏳ |
| **Testing approach** | RT + Vitest? | ✅ / ⏳ |
| **Tailwind config** | Same structure? | ✅ / ⏳ |

---

## ✅ Cross-Reference Validation

**Complete This Section:**

```
1. Are all calculations implemented? YES / NO
   If NO: Which ones? ________________________

2. Do all database tables exist? YES / NO
   If NO: Which ones? ________________________

3. Are all Edge Functions created? YES / NO
   If NO: Which ones? ________________________

4. Are all UI pages built? YES / NO
   If NO: Which ones? ________________________

5. Is documentation complete? YES / NO
   If NO: Which pieces? ________________________

6. Are all constraints in place? YES / NO
   If NO: Which ones? ________________________

7. Can you trace "place order" end-to-end? YES / NO
   If NO: Where breaks? ________________________

8. Does system match blueprint architecture? YES / NO
   If NO: What differs? ________________________
```

---

## 📍 Quick Navigation

**To Find Information:**

| I Want To... | Look Here |
|-------------|-----------|
| Understand your architecture | Section 2.1 (this doc) |
| Verify calculations | Section 2.5 (this doc) |
| Check database design | Section 2.3 (this doc) |
| Find Edge Functions | `supabase/functions/` |
| Find React components | `frontend/src/components/` |
| Add legal docs | `docs/legal/` (copy from Part 3) |
| Write tests | `tests/` directory |
| Document decisions | `docs/architecture-decisions/` |

---

**Last Updated:** February 12, 2026  
**Next Review:** After Phase 1 completion  
**Owner:** Development Team
