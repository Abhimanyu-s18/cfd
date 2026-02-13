# Blueprint Integration Roadmap
## Applying MASTER_BLUEPRINT to Our CFD Platform

**Date Created:** February 12, 2026  
**Project Status:** MVP Core Built ✅  
**Next Phase:** Documentation, Legal, Scaling  
**Est. Integration Time:** 2-3 weeks  

---

## 📊 Current State vs. Blueprint Alignment

### ✅ What We've Already Built (Correctly)

| Component | Our Implementation | Blueprint Reference |
|-----------|-------------------|-------------------|
| **Layer Separation** | Frontend (React) / Backend (Edge Functions) / Database (PostgreSQL) | Section 2.1.3 |
| **Pure Functions** | Margin, PnL, liquidation calculations | Section 1.1.3 |
| **Invariants** | Balance ≥ 0, Used Margin ≤ Equity, enforced via constraints | Section 1.1.6 |
| **Database Schema** | 11 tables with relationships & triggers | Section 2.3 |
| **Authentication** | JWT via Supabase Auth | Section 2.4 |
| **API Design** | REST Edge Functions with validation | Section 2.7 |

### ⚠️ What We're Missing (From Roadmap)

| Item | Blueprint Section | Priority | Est. Hours |
|------|-------------------|----------|-----------|
| **Legal Documents** | Part 3, Section 3 | CRITICAL | 4-6 |
| **Architecture Documentation** | Part 3, Section 5 (ADR template) | HIGH | 3-4 |
| **Project Management Setup** | Part 3, Section 4 | HIGH | 2-3 |
| **UI Components** | Part 2, Section 2.6 | HIGH | 12-16 |
| **Data Validation Layer** | Part 2, Section 2.4 | MEDIUM | 2-3 |
| **Storybook Setup** | SETUP_GUIDE.md | MEDIUM | 2-3 |
| **Risk Documentation** | Part 3, Section 6 | MEDIUM | 1-2 |
| **Testing Framework** | Part 3, Section 4 | LOW | 3-4 |

---

## 🎯 Phase 1: Knowledge Verification (Today - 4 Hours)

### 1.1 Read & Comprehend (90 minutes)

**Task:** Read these sections completely

- [ ] **Part 1, Section 1.5: Learning Validation** 
  - Location: MASTER_BLUEPRINT_PART1.md, line ~430
  - What to do: Read completely, understand concepts
  - Expected time: 30 min

- [ ] **Part 2, Section 2.5: Business Logic Documentation**
  - Location: MASTER_BLUEPRINT_PART2.md
  - What to do: Read all 7 core calculations
  - Expected time: 30 min

- [ ] **Part 3, Section 6: Risk Mitigation Strategies**
  - Location: MASTER_BLUEPRINT_PART3.md
  - What to do: Read, understand "no restart" framework
  - Expected time: 30 min

### 1.2 Complete Understanding Checklist (30 minutes)

**Answer these questions - if you can't, re-read that section:**

```markdown
## Understanding Verification

**Pure Functions & Side Effects:**
- [ ] Can explain why order execution MUST be pure?
- [ ] Why is calculateMargin() pure but placeOrder() isn't?
- [ ] What are the side effects in our API layer?

**Trading Mechanics:**
- [ ] What's the difference between balance and equity?
- [ ] Why does liquidation trigger at maintenance margin, not zero?
- [ ] How does leverage affect margin requirement?

**Architecture Decisions:**
- [ ] Why is business logic in Edge Functions, not frontend?
- [ ] Why does database enforce margin constraints?
- [ ] Why can't frontend validate liquidation logic?

**Risk Understanding:**
- [ ] What invariants MUST never be violated in our system?
- [ ] How do we prevent restart cycles?
- [ ] What quality gates should we use before shipping features?

**System Design:**
- [ ] Can you draw the complete data flow for "place order"?
- [ ] Identify each layer (frontend/backend/database) in the flow?
- [ ] What validation happens at each layer?
```

**If you can't answer all → Go back and re-read**

### 1.3 Verify Our Calculations (60 minutes)

**Task:** Compare our formulas against blueprint

**Margin Calculation (Section 1.2.3-1.2.4):**
```
Blueprint Formula:
  Initial Margin = Trade Size ÷ Leverage
  Maintenance Margin = Initial Margin × 0.5

Our Implementation:
  Location: engine/calculations/margin.ts OR Edge Functions
  Check: Does our code match formula?
  Test: Trade $10,000 at 1:100 leverage
    Expected: Initial = $100, Maintenance = $50
    Actual: ?
```

- [ ] Found our margin calculation code
- [ ] Verified formula matches blueprint
- [ ] Tested with known values
- [ ] Results match expected output

**PnL Calculation (Section 1.2.6):**
```
Blueprint Formula:
  Unrealized PnL = (Current Price - Entry Price) × Position Size

Our Implementation:
  Check: Where is this calculated?
  Test: Entry $1.0850, Current $1.0875, Size 1.5 lots
    Expected: +$375
    Actual: ?
```

- [ ] Found our PnL calculation code
- [ ] Verified formula matches blueprint
- [ ] Tested with known values
- [ ] Results match expected output

**Equity Calculation (Section 1.2.5):**
```
Blueprint Formula:
  Equity = Balance + Unrealized PnL

Our Implementation:
  Check: Is this a trigger or a calculated field?
  Test: Balance $10,000, PnL +$500
    Expected: Equity $10,500
    Actual: ?
```

- [ ] Verified where equity is calculated
- [ ] Formula matches blueprint
- [ ] Tested calculation
- [ ] Results correct

**Liquidation Trigger (Section 1.2.7):**
```
Blueprint Rule:
  IF Equity < Maintenance Margin → LIQUIDATE
  NOT when Balance = 0

Our Implementation:
  Check: Where is liquidation logic?
  Test: Equity $45, Maintenance Margin $50
    Expected: Should trigger liquidation
    Actual: ?
```

- [ ] Found liquidation trigger code
- [ ] Verified it checks equity vs maintenance (not balance vs zero)
- [ ] Tested trigger logic
- [ ] Behaves correctly

---

## 📋 Phase 2: Documentation & Legal (Days 2-3, ~8 Hours)

### 2.1 Create Legal Documents (4-6 hours)

**Location to add:** Create `/frontend/src/docs/legal/`

```bash
# Create folder structure
mkdir -p frontend/src/docs/legal
```

**Files to create:**

1. **Terms of Service**
   - [ ] Copy template from Part 3, Section 3.2.2
   - [ ] Customize: Replace [Platform Name] → "CFD Trading Platform"
   - [ ] Customize: Replace [Company Name] → Your company
   - [ ] Add legal review checkbox
   - [ ] File: `TERMS_OF_SERVICE.md`

2. **Privacy Policy (GDPR)**
   - [ ] Copy template from Part 3, Section 3.2.3
   - [ ] Customize company/platform names
   - [ ] Update data retention periods if needed
   - [ ] Add DPA (Data Processing Addendum) if EU users
   - [ ] File: `PRIVACY_POLICY.md`

3. **Risk Disclosure**
   - [ ] Copy template from Part 3, Section 3.2.1
   - [ ] Expand with our specific risks:
     - Leverage on CFDs
     - Market gaps over weekends
     - Technical failures
   - [ ] Add acknowledgment modal
   - [ ] File: `RISK_DISCLOSURE.md`

4. **Disclaimers Component**
   - [ ] Create React component: `frontend/src/components/Disclaimers.tsx`
   - [ ] Add footer disclaimer
   - [ ] Add dashboard disclaimer
   - [ ] Add pre-trade disclaimer modal

**Tracking:**
- [ ] All templates copied and customized
- [ ] Legal review completed (or scheduled)
- [ ] Files stored in documentation folder
- [ ] Components created for display

### 2.2 Document Architecture Decisions (2-3 hours)

**Create Architecture Decision Records (ADRs)**

**Location:** `/docs/architecture-decisions/`

```bash
mkdir -p docs/architecture-decisions
```

**ADR Template** (from Part 3, Section 5):

```markdown
# ADR-001: Layer Separation (Frontend/Backend/Database)

## Status
✅ ACCEPTED (Implemented)

## Context
We needed to ensure proper separation of concerns to prevent bugs in financial calculations.

## Decision
- Frontend: UI only, state management via Zustand, NO business logic
- Backend: Edge Functions for order execution, calculations, validation
- Database: PostgreSQL with constraints, triggers, audit logs

## Consequences
✅ Business logic testable and isolated
✅ Frontend can't crash trading system
✅ Database enforces invariants
⚠️ More code initially
⚠️ Requires careful API design

## Alternatives Considered
❌ All logic in frontend (too risky for financial app)
❌ All logic in backend (slower, harder to scale)

## Reference
Part 2, Section 2.1 - System Architecture Design
```

**Create these ADRs:**

- [ ] ADR-001: Layer Separation
- [ ] ADR-002: Pure Functions for Calculations
- [ ] ADR-003: Invariant Enforcement
- [ ] ADR-004: Database Schema Design
- [ ] ADR-005: Authentication (JWT)

**Tracking:**
- [ ] All ADRs created and numbered
- [ ] Each references blueprint section
- [ ] Team reviews design decisions
- [ ] Documents stored in /docs/architecture-decisions/

### 2.3 Create Risk Mitigation Document (1-2 hours)

**Location:** `/docs/RISK_MANAGEMENT.md`

**Sections to include:**

```markdown
# Risk Management Framework

Based on MASTER_BLUEPRINT Part 3, Section 6

## Why We Built This Way

From Section 6: "Why previous attempts failed"
- ✅ We planned architecture BEFORE coding (avoided restart #1)
- ✅ We separated concerns properly (avoided restart #2)
- ✅ We defined calculations clearly (avoided restart #3)

## Quality Gates (STOP Points)

Before adding each feature, you MUST:
1. [ ] Document the requirement in English
2. [ ] Write the formula/logic on paper
3. [ ] Write tests first (TDD)
4. [ ] Implement
5. [ ] Verify against blueprint
6. [ ] Code review with 2+ people
7. [ ] Only then → Deploy

## No-Restart Framework

If something feels wrong:
1. Don't restart → Refactor
2. Reference the blueprint
3. Find the quality gate that failed
4. Fix the gate, not the codebase

## Scaling Rules

✅ **CAN do:** Add new asset classes, new UI, new analytics  
❌ **CANNOT do:** Change margin calculation without approval  
❌ **CANNOT do:** Change liquidation logic without tests  
❌ **CANNOT do:** Add features in frontend  

## Reference
Part 3, Section 6 - Risk Mitigation Strategies
```

**Tracking:**
- [ ] Document created
- [ ] Team reviews and accepts
- [ ] Bookmarked for team reference

---

## 🛠️ Phase 3: Code Validation (Days 4-5, ~6 Hours)

### 3.1 Edge Functions Validation (3 hours)

**Task:** Verify each Edge Function matches blueprint

**Checklist:**

- [ ] **Order placement**
  - [ ] Input validation (Section 2.4)
  - [ ] Margin check before accepting
  - [ ] Position limits enforced
  - [ ] No frontend logic involved

- [ ] **Position PnL updates**
  - [ ] Formula matches Section 1.2.6
  - [ ] Equity calculated correctly
  - [ ] Margin level computed
  - [ ] Liquidation triggered if needed

- [ ] **Liquidation logic**
  - [ ] Checks Equity vs Maintenance Margin
  - [ ] NOT balance vs zero
  - [ ] Actually closes positions
  - [ ] Updates account correctly

- [ ] **Account operations**
  - [ ] Balance never negative
  - [ ] Bonus tracked separately from actual
  - [ ] All changes logged

### 3.2 Database Validation (2 hours)

**Task:** Verify constraints enforce invariants

```bash
# Connect to database and check
# psql postgresql://...

# Check each constraint
\d accounts              # See constraints
\d positions             # See constraints
SELECT * FROM pg_constraint WHERE conrelid = 'accounts'::regclass;
```

**Checklist:**

- [ ] **Balance constraint:** `balance >= 0`
- [ ] **Leverage constraint:** `leverage <= max_leverage`
- [ ] **Position size constraint:** `position_size <= max_allowed`
- [ ] **Margin constraint:** `used_margin <= equity`
- [ ] **Audit trigger:** Records all changes

### 3.3 Frontend Validation (1 hour)

**Task:** Verify frontend respects layer separation

**Checklist:**

- [ ] **No business logic in components**
  - [ ] Margin calculations in utils, not React
  - [ ] PnL in API response, not calculated in React
  - [ ] Liquidation rules NEVER in frontend

- [ ] **API calls properly structured**
  - [ ] All data from backend
  - [ ] Frontend only displays
  - [ ] No pre-trading validation replicating backend

---

## 🎨 Phase 4: Missing UI Components (Days 6-10, ~16 Hours)

**Based on Section 2.6: Frontend UI/UX Specifications**

### 4.1 Core Trading Components

- [ ] **AccountSummary** (4 hours)
  - Real-time balance/equity
  - Margin level indicator
  - Account statistics
  - Reference: Section 2.6 "Account Dashboard"

- [ ] **MarketWatch** (3 hours)
  - Price ticker for multiple assets
  - Color-coded change indicators
  - One-click trade buttons
  - Reference: Section 2.6 "Market Data View"

- [ ] **QuickTrade Modal** (4 hours)
  - Quantity input
  - Leverage selector
  - Stop loss / Take profit
  - Pre-trade checks
  - Reference: Section 2.6 "Order Entry"

- [ ] **PositionsList** (2 hours)
  - All open positions
  - Real-time PnL
  - Close position button
  - Modify SL/TP
  - Reference: Section 2.6 "Position Management"

- [ ] **OrderHistory** (2 hours)
  - Closed trades
  - Filters (date, asset, type)
  - Sorting
  - Reference: Section 2.6 "Trade History"

### 4.2 Authentication Pages

- [ ] **Login Page** (2 hours)
- [ ] **Register Page** (2 hours)
- [ ] **Password Reset** (1 hour)

### 4.3 Admin Panel

- [ ] **User Management** (3 hours)
  - List users
  - Adjust balances
  - Disable accounts

- [ ] **System Monitoring** (2 hours)
  - Active trades count
  - Total equity
  - System health

---

## 📦 Phase 5: Project Management Setup (Days 11-12, ~5 Hours)

### 5.1 Git Strategy (1 hour)

```markdown
# Git Workflow

## Branching
- main: Always production-ready
- develop: Integration branch
- feature/COMPONENT-NAME: Feature branches

## Commit Message Format
[TYPE] Description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- refactor: Code cleanup
- test: Testing

Example:
- feat: Add AccountSummary component
- fix: Correct margin calculation
- docs: Add ADR-001
```

### 5.2 Backup Strategy (1 hour)

```bash
# Daily backup
0 2 * * * pg_dump db_name > backups/daily-$(date +%Y%m%d).sql

# Weekly backup (Sundays)
0 3 * * 0 pg_dump db_name > backups/weekly-$(date +%Y%m%d).sql

# Store in cloud (AWS S3 / Google Cloud)
aws s3 cp backups/daily-*.sql s3://your-bucket/backups/
```

### 5.3 Sprint Planning Template (2 hours)

```markdown
# Sprint 1 Planning

**Duration:** Feb 12 - Feb 19, 2026 (1 week)

## Goal
Add legal documents and complete UI components

## Backlog
- [ ] Phase 1: Knowledge Verification (4h) - Completed ✅
- [ ] Phase 2: Legal Documents (8h) - In Progress
- [ ] Phase 3: Code Validation (6h) - Not Started
- [ ] Phase 4: UI Components (16h) - Not Started

## Metrics
- Unit tests passing: ??%
- E2E tests passing: ??%
- Code coverage: ??%

## Blockers
- None currently
```

### 5.4 Testing Strategy (1 hour)

```markdown
# Testing Framework

## Unit Tests
- Location: `tests/unit/`
- Framework: Vitest
- Coverage: All calculations, 80%+

## Integration Tests
- Location: `tests/integration/`
- Framework: Vitest
- Coverage: API responses, 70%+

## E2E Tests
- Location: `tests/e2e/`
- Framework: Playwright
- Coverage: Complete user flows

## Quality Gate
- All tests passing before deployment
- Code coverage > 70%
- No console errors
```

---

## ✅ Completion Checklist

### Knowledge Phase ✓
- [ ] Read all required sections
- [ ] Completed understanding checklist
- [ ] Verified calculations match
- [ ] All questions answered correctly

### Documentation Phase ✓
- [ ] Legal documents created
- [ ] ADRs documented
- [ ] Risk management framework added
- [ ] Components documented

### Code Phase ✓
- [ ] Edge Functions validated
- [ ] Database constraints verified
- [ ] Frontend layer separation confirmed
- [ ] All calculations tested

### Feature Phase ✓
- [ ] All UI components built
- [ ] Authentication complete
- [ ] Admin panel functional
- [ ] All tests passing

### Deployment Phase ✓
- [ ] Git workflow established
- [ ] Backup strategy active
- [ ] Sprint planning template used
- [ ] Ready for production

---

## 📊 Integration Status Tracker

Create this as `/docs/INTEGRATION_STATUS.md` and update weekly:

```markdown
# Integration Status - Week of Feb 12

| Phase | Task | Status | % Complete | Hours Used | Est. Remaining |
|-------|------|--------|-----------|-----------|-----------------|
| 1 | Knowledge Verification | 🔄 IN PROGRESS | 25% | 1 | 3 |
| 2 | Legal Documents | ⏳ NOT STARTED | 0% | 0 | 6 |
| 2 | Architecture ADRs | ⏳ NOT STARTED | 0% | 0 | 3 |
| 3 | Code Validation | ⏳ NOT STARTED | 0% | 0 | 6 |
| 4 | UI Components | ⏳ NOT STARTED | 0% | 0 | 16 |
| 5 | PM Setup | ⏳ NOT STARTED | 0% | 0 | 5 |

**Total Progress:** 2% (1/50 hours)  
**Est. Completion:** Feb 26, 2026  
**Blockers:** None
```

---

## 🎯 What's Next

**Right Now (Next 30 Min):**
1. [ ] Open Part 1, Section 1.5 in MASTER_BLUEPRINT_PART1.md
2. [ ] Start reading "Learning Validation"
3. [ ] Take notes

**Today (Next 4 Hours):**
1. [ ] Complete Phase 1 entirely
2. [ ] Answer all understanding checkpoints
3. [ ] Verify our calculations

**This Week:**
1. [ ] Complete Phases 2-3 (legal + code validation)
2. [ ] Start Phase 4 (UI components)

---

## 📚 Document References

| Section | File | Purpose |
|---------|------|---------|
| Learning Validation | MASTER_BLUEPRINT_PART1.md | Verify understanding |
| Business Logic | MASTER_BLUEPRINT_PART2.md | Compare formulas |
| Risk Mitigation | MASTER_BLUEPRINT_PART3.md | Quality gates |
| Legal Templates | MASTER_BLUEPRINT_PART3.md | Terms, Privacy, Risk |
| Component Library | SETUP_GUIDE.md | Storybook patterns |

---

**Created:** February 12, 2026  
**Status:** Ready to Execute  
**Owner:** Development Team  
**Next Review:** February 19, 2026
