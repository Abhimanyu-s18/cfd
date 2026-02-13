# Quick Reference: Blueprint Validation Checklist
## Verify Our System Matches MASTER_BLUEPRINT Specifications

**Date:** February 12, 2026  
**Purpose:** Quickly validate that our implementation matches blueprint requirements  
**Time to Complete:** 2-3 hours  

---

## 🎯 Section 1: Understanding Verification

### Pure Functions & Architecture

**Question 1:** Why is our order placement logic in Edge Functions, not React?
```
✅ CORRECT ANSWER:
"Because order execution is a business operation (side effect).
Frontend can't be trusted with this. Backend must control truth."

Reference: Part 1, Section 1.1.7 (Side Effects)
```
- [ ] I can explain this clearly
- [ ] I know why this matters
- [ ] I can show 2 examples

**Question 2:** Why must margin calculations be pure functions?
```
✅ CORRECT ANSWER:
"So same inputs ALWAYS give same outputs. Makes them testable.
Prevents money bugs from hidden dependencies."

Reference: Part 1, Section 1.1.3 (Pure Functions)
```
- [ ] I can explain this
- [ ] I know the danger if they weren't pure
- [ ] I can show our pure margin calculation

**Question 3:** What's an invariant in our trading system?
```
✅ CORRECT ANSWER:
"A rule that MUST NEVER be violated. Examples:
- Balance can never go negative
- Used margin can never exceed equity
- Leverage can't exceed maximum"

Reference: Part 1, Section 1.1.6 (Invariants)
```
- [ ] I can name 5+ invariants
- [ ] I know how we enforce each one
- [ ] I can identify where enforcement happens

---

## 📊 Section 2: Calculation Verification

### Margin Calculation

**Test Case from Blueprint (Section 1.2.3):**

**Scenario:** 
- Trade size: $10,000 (EUR/USD)
- Leverage: 1:100

**Expected Results (from blueprint):**
- Initial margin: $100
- Maintenance margin: $50

**Our Implementation:**
```
WHERE IS IT?
[ ] Location: ________________________

TEST IT:
[ ] Ran with $10,000 and 1:100
[ ] Got: Initial margin = ________
[ ] Got: Maintenance margin = ________
[ ] MATCHES? YES / NO / PARTIAL

If NO → Debug needed
```

**Reference:** Part 1, Section 1.2.3-1.2.4

---

### PnL Calculation

**Test Case from Blueprint (Section 1.2.6):**

**Scenario:**
- Entry price: 1.0850 (EUR/USD)
- Current price: 1.0875
- Position size: 1.5 lots (150,000 units)

**Expected Result (from blueprint):**
- Unrealized PnL: +$375

**Why?**
```
Math: (1.0875 - 1.0850) × 1.5 × 10,000 = $375
(Each pip = $0.0001 × 10,000 = $1)
(0.0025 pips × 1.5 × 10,000 = $375)
```

**Our Implementation:**
```
WHERE IS IT?
[ ] Location: ________________________

TEST IT:
[ ] Ran with values above
[ ] Got: ________
[ ] MATCHES $375? YES / NO

If NO → Debug needed
```

**Reference:** Part 1, Section 1.2.6

---

### Equity Calculation

**Test Case from Blueprint (Section 1.2.5):**

**Scenario:**
- Balance: $10,000
- Unrealized PnL: +$500

**Expected Result:**
- Equity: $10,500

**Our Implementation:**
```
WHERE IS IT?
[ ] Is it in database trigger?
[ ] Is it calculated in Edge Function?
[ ] Is it calculated in frontend? (WRONG!)

TEST IT:
[ ] Ran scenario
[ ] Got: ________
[ ] MATCHES? YES / NO

If NO → Fix needed
```

**Reference:** Part 1, Section 1.2.5

---

### Liquidation Logic

**Test Case from Blueprint (Section 1.2.7):**

**Rule:**
```
IF Equity < Maintenance Margin → LIQUIDATE
NOT IF Balance = 0
```

**Scenario:**
- Balance: $10,000
- Unrealized PnL: -$9,950 (losing badly)
- Equity: $50
- Maintenance Margin: $50

**Expected Behavior:**
- Should liquidate immediately
- Positions closed
- Account losses limited

**Our Implementation:**
```
WHERE IS LIQUIDATION LOGIC?
[ ] Edge Function: ________________________
[ ] Database trigger: ________________________
[ ] Frontend: ________________________ (WRONG!)

TEST IT:
[ ] Did it trigger at equity = maintenance?
[ ] Did it actually close positions?
[ ] Did balance get updated?
[ ] DID NOT wait for balance = $0? YES / NO

If any NO → Fix needed
```

**Reference:** Part 1, Section 1.2.7, Part 2, Section 2.5.6

---

## 🏗️ Section 3: Architecture Verification

### Layer Separation

**Test:** Trace the complete "place order" flow

**Expected Flow (Section 2.1.2):**
```
1. USER CLICKS "BUY EUR/USD" (Frontend)
2. FRONTEND validates inputs (basic only)
3. FRONTEND sends to API
4. BACKEND receives request
5. BACKEND does ALL business logic:
   - Check balance sufficient?
   - Check leverage ok?
   - Check position limits?
   - Calculate initial margin?
6. BACKEND writes to database
7. DATABASE enforces constraints
8. Any violation → REJECT from backend
9. Response sent to frontend
10. FRONTEND displays result only
```

**Our Implementation:**
```
[ ] Trace a real trade through code
[ ] Mark each layer:
    [ ] Frontend
    [ ] API Gateway / Edge Function
    [ ] Database

[ ] Verify NO business logic in frontend
[ ] Verify ALL validation in backend
[ ] Verify database constraints exist

PROBLEMS FOUND:
- [ ] Business logic in React (FIX!)
- [ ] Frontend calculating margin (FIX!)
- [ ] Missing database constraint (FIX!)
- [ ] Edge Function not validating (FIX!)
```

**Reference:** Part 2, Section 2.1.1-2.1.3

---

### Database Invariants

**Check Each Constraint:**

```sql
-- Balance can never be negative
[ ] CONSTRAINT EXISTS: accounts.balance >= 0

-- Used margin <= equity
[ ] CHECK: used_margin <= equity

-- Leverage <= maximum
[ ] CHECK: leverage <= max_leverage_for_asset_class

-- Position size <= maximum
[ ] CHECK: position_size <= max_position_size

-- All tables have audit logs
[ ] TRIGGER EXISTS on accounts.updates
[ ] TRIGGER EXISTS on positions.updates
[ ] TRIGGER EXISTS on transactions.updates

-- Foreign keys prevent orphans
[ ] positions.account_id → accounts.id
[ ] orders.position_id → positions.id
[ ] transactions.account_id → accounts.id
```

**Status:**
```
All constraints present? YES / NO
All triggers working? YES / NO
All foreign keys set? YES / NO

Missing items:
1. ________________________
2. ________________________
3. ________________________
```

**Reference:** Part 2, Section 2.3, 2.4

---

## 🔐 Section 4: Security Validation

**Check Security Framework (Part 2, Section 2.4):**

```
AUTHENTICATION
[ ] JWT tokens issued on login
[ ] Tokens expire (how long? _______ )
[ ] Tokens validated on every request
[ ] Invalid tokens rejected

INPUT VALIDATION
[ ] All API inputs validated
[ ] Type checking (TypeScript)
[ ] Range checking (min/max)
[ ] Format validation (email, etc)
[ ] No SQL injection possible

AUDIT LOGGING
[ ] All trades logged
[ ] All account changes logged
[ ] All admin actions logged
[ ] Logs include timestamp, user, action

DATABASE SECURITY
[ ] Passwords hashed (bcrypt, Argon2?)
[ ] Database not accessible from frontend
[ ] Read replicas for backups
[ ] Regular backups encrypted

API SECURITY
[ ] HTTPS only / TLS
[ ] CORS configured properly
[ ] Rate limiting active
[ ] No sensitive data in logs
```

**Missing Security:**
1. ________________________
2. ________________________
3. ________________________

**Reference:** Part 2, Section 2.4

---

## 🧪 Section 5: Business Logic Verification

**7 Core Calculations from Blueprint (Part 2, Section 2.5):**

### 1. Margin Requirement

**Formula:**
```
Initial Margin = Position Size ÷ Leverage
Maintenance Margin = Initial Margin × 0.5
```

**Our Code:**
- [ ] Implemented in: _________________
- [ ] Formula matches: YES / NO
- [ ] All edge cases handled: YES / NO / PARTIAL

---

### 2. PnL Calculation

**Formula (Long):**
```
Unrealized PnL = (Current Price - Entry Price) × Position Size × Multiplier
```

**Formula (Short):**
```
Unrealized PnL = (Entry Price - Current Price) × Position Size × Multiplier
```

**Our Code:**
- [ ] Implemented in: _________________
- [ ] Both BUY and SELL handled: YES / NO
- [ ] Multiplier applied correctly: YES / NO

---

### 3. Equity

**Formula:**
```
Equity = Balance + Unrealized PnL
```

**Our Code:**
- [ ] Implemented in: _________________
- [ ] Updates real-time: YES / NO
- [ ] Database trigger: YES / NO

---

### 4. Margin Level

**Formula:**
```
Margin Level = (Equity ÷ Used Margin) × 100
```

**Our Code:**
- [ ] Implemented in: _________________
- [ ] Shown to user: YES / NO
- [ ] Used for liquidation trigger: YES / NO

---

### 5. Free Margin

**Formula:**
```
Free Margin = Equity - Used Margin
```

**Our Code:**
- [ ] Implemented in: _________________
- [ ] Used for position limits: YES / NO
- [ ] Prevents over-leveraging: YES / NO

---

### 6. Liquidation Trigger

**Rule:**
```
IF Margin Level < 100% (Equity ≤ Maintenance Margin)
  → Force close position(s)
  → Minimize loss
  → Update equity
  → Notify user
```

**Our Code:**
- [ ] Implemented in: _________________
- [ ] Triggers at right threshold: YES / NO
- [ ] Actually closes positions: YES / NO
- [ ] Updates balance: YES / NO
- [ ] Sends notification: YES / NO

---

### 7. Account Balance Update

**Rule:**
```
IF position closed:
  balance += realized_pnl
  
IF deposit received:
  balance += amount
  
IF withdrawal:
  balance -= amount
  
Balance MUST NEVER go negative
```

**Our Code:**
- [ ] Implemented in: _________________
- [ ] All sources of change handled: YES / NO
- [ ] Negative balance prevented: YES / NO
- [ ] Trigger on balance change: YES / NO

---

## ✅ Summary Status

### Calculation Verification
- [ ] Margin calculation: VERIFIED / FIX NEEDED / MISSING
- [ ] PnL calculation: VERIFIED / FIX NEEDED / MISSING
- [ ] Equity calculation: VERIFIED / FIX NEEDED / MISSING
- [ ] Liquidation logic: VERIFIED / FIX NEEDED / MISSING
- [ ] Other calculations: ALL CORRECT

### Architecture Verification
- [ ] Layer separation: CORRECT / NEEDS REVIEW
- [ ] Database constraints: COMPLETE / MISSING ITEMS
- [ ] API validation: PROPER / NEEDS WORK
- [ ] Business logic isolated: YES / NO

### Security Verification
- [ ] Authentication: IMPLEMENTED / NOT DONE
- [ ] Input validation: COMPLETE / NEEDS WORK
- [ ] Audit logging: ACTIVE / MISSING
- [ ] Database security: SECURED / NEEDS HARDENING

### Overall Status
```
READY FOR NEXT PHASE? YES / NO

If NO, blockers:
1. ________________________
2. ________________________
3. ________________________

ACTION ITEMS:
1. ________________________
2. ________________________
3. ________________________
```

---

## 🚀 Next Steps

**If all checkboxes ✅:**
Move to Phase 2: Documentation & Legal (see blueprints/BLUEPRINT_INTEGRATION_ROADMAP.md)

**If items ⏳ or ❌:**
1. Fix the identified issues
2. Re-run this checklist
3. Get to all ✅ before next phase

---

**Created:** February 12, 2026  
**Last Updated:** _______________  
**Completed By:** _______________
