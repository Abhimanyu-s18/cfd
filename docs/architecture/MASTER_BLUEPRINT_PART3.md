# MASTER BLUEPRINT - SECTIONS 3-6
## Legal, Project Management, Resources & Risk Mitigation

---

# 3. LEGAL AND COMPLIANCE PREPARATION

> **CRITICAL:** Even simulators need disclaimers. Regulatory violations can shut you down.

## 3.1 Regulatory Checklist (By Region)

### 3.1.1 Key Questions

**Question 1: Is this a simulated platform?**
Answer: YES
- Using virtual money only
- No real deposits or withdrawals
- Educational/demonstration purpose

**Question 2: Are real money transactions involved?**
Answer: NO (for MVP)
- No payment gateway
- No bank integration
- No cryptocurrency deposits
- Admin manually allocates virtual funds

**Question 3: Are prices real or simulated?**
Answer: REAL prices from market data
- AlphaVantage API
- yFinance data
- Prices reflect actual markets
- But trades are paper trading only

**Question 4: Are returns guaranteed?**
Answer: ABSOLUTELY NOT
- Trading involves risk
- Past performance doesn't guarantee future results
- Users can lose virtual funds
- No guaranteed profits ever claimed

### 3.1.2 Regulatory Classification

| Jurisdiction | Classification | Requirements |
|--------------|---------------|--------------|
| **United States** | Educational Platform | • Risk disclaimers<br>• No investment advice<br>• Clear "paper trading" labels |
| **European Union** | Demo Trading Platform | • GDPR compliance<br>• Cookie consent<br>• Data deletion rights |
| **United Kingdom** | Practice Platform | • FCA disclaimer<br>• "Not a regulated broker"<br>• Risk warnings |
| **Asia (General)** | Simulation Platform | • Local language disclaimers<br>• Age restrictions (18+)<br>• No real money claims |

### 3.1.3 What You DON'T Need (for MVP)

✅ Broker license (not handling real money)  
✅ Financial services registration (paper trading)  
✅ Payment processing license (no payments)  
✅ Banking relationships (no deposits)  
✅ AML/KYC compliance (no real money, but KYC for platform security)  

### 3.1.4 What You DO Need

✅ Terms of Service  
✅ Privacy Policy  
✅ Risk Disclosure Agreement  
✅ Cookie Policy  
✅ Disclaimers on every page  
✅ Age verification (18+ only)  
✅ Data protection measures  

---

## 3.2 Required Documents

### 3.2.1 Risk Disclosure Agreement

**Purpose:** Protect platform from liability, inform users of risks

**Required Content:**

```markdown
# RISK DISCLOSURE AGREEMENT

**Last Updated:** February 5, 2026

## IMPORTANT NOTICE

This is a PAPER TRADING platform using virtual funds. No real money is at risk.

However, this platform simulates real trading conditions, including:
- Real market prices
- Leverage (which magnifies both gains and losses)
- Market volatility
- Potential total loss of virtual capital

## UNDERSTANDING LEVERAGE

Leverage allows you to control positions larger than your account balance.

Example:
- Account: $10,000
- Leverage: 1:100
- You can control: $1,000,000 in positions
- A 1% market move = $10,000 gain or loss
- You could lose your entire virtual account in ONE trade

## KEY RISKS

1. **Total Loss**: You can lose all virtual funds in your account
2. **Leverage Risk**: High leverage amplifies losses
3. **Market Risk**: Prices can move rapidly against you
4. **Liquidation**: Positions automatically close if margin too low
5. **Gap Risk**: Markets can "gap" (jump in price) over weekends
6. **Technical Risk**: Platform outages, delays, errors

## PAST PERFORMANCE

Past performance is NOT indicative of future results.
Profitable demo trading does NOT guarantee real trading success.

## NO INVESTMENT ADVICE

This platform does NOT provide:
- Investment advice
- Financial recommendations
- Trading signals
- Guaranteed returns

## YOUR ACKNOWLEDGMENT

By using this platform, you acknowledge:
☐ I understand this is paper trading with virtual money
☐ I understand leverage risks
☐ I understand I can lose all virtual funds
☐ I will not hold the platform liable for any losses
☐ I am 18+ years old
☐ I will not use this for illegal purposes

[I Agree] [I Disagree]
```

**Where to Display:**
- During registration (must accept)
- Before first trade
- Link in footer of every page

### 3.2.2 Terms of Service

**Purpose:** Legal agreement between platform and user

**Key Sections:**

```markdown
# TERMS OF SERVICE

## 1. ACCEPTANCE OF TERMS

By accessing [Platform Name], you agree to these Terms.

## 2. DESCRIPTION OF SERVICE

[Platform Name] is a paper trading platform that allows users to:
- Practice trading with virtual funds
- View real market data
- Simulate trading across multiple asset classes

## 3. ACCOUNT REGISTRATION

3.1 Eligibility
- Must be 18+ years old
- Must provide accurate information
- Must comply with local laws

3.2 Account Security
- You are responsible for your password
- You must notify us of unauthorized access
- We are not liable for unauthorized account use

## 4. VIRTUAL FUNDS

4.1 Nature of Funds
- All funds are VIRTUAL and have NO real value
- Funds cannot be withdrawn or exchanged for real money
- Administrators may adjust virtual balances

4.2 Allocation
- Initial virtual funds allocated after KYC approval
- Additional funds at administrator discretion

## 5. USER CONDUCT

Users must NOT:
- Attempt to manipulate the platform
- Use bots or automated trading (unless approved)
- Share account credentials
- Violate any laws
- Harass other users or staff

## 6. INTELLECTUAL PROPERTY

6.1 Platform Ownership
- All platform code, design, and content owned by [Company Name]
- Users granted limited license to use the platform

6.2 User Data
- Users retain rights to their personal data
- Platform may use anonymized data for analytics

## 7. DISCLAIMERS

7.1 No Guarantees
- Platform provided "AS IS"
- No guarantee of uptime, accuracy, or performance
- Not responsible for data errors or delays

7.2 Not Investment Advice
- Platform does not provide financial advice
- Users trade at their own risk
- Platform not liable for trading decisions

## 8. LIMITATION OF LIABILITY

To maximum extent permitted by law:
- Platform not liable for any losses (virtual or real)
- Platform not liable for technical issues
- Maximum liability: $0 (virtual funds have no value)

## 9. INDEMNIFICATION

Users agree to indemnify platform against:
- User's violation of Terms
- User's trading activities
- User's use of platform

## 10. TERMINATION

10.1 User Termination
- Users may close account anytime

10.2 Platform Termination
- Platform may terminate accounts for:
  - Terms violations
  - Illegal activity
  - Abuse of platform
  - Any reason with notice

## 11. MODIFICATIONS

- Platform may modify Terms at any time
- Continued use = acceptance of new Terms
- Users notified of material changes

## 12. GOVERNING LAW

- Terms governed by [Jurisdiction] law
- Disputes resolved in [Jurisdiction] courts

## 13. CONTACT

Questions? Contact: legal@[platform].com

---

**Effective Date:** February 5, 2026
```

### 3.2.3 Privacy Policy

**Purpose:** GDPR compliance, transparency about data handling

**Key Sections:**

```markdown
# PRIVACY POLICY

## 1. INFORMATION WE COLLECT

1.1 Personal Information
- Name, email, phone
- Date of birth
- Country, city
- Trading experience information

1.2 KYC Documents
- Government-issued ID
- Proof of address
- Photographs

1.3 Automatic Information
- IP address
- Browser type and version
- Device information
- Usage data (pages visited, features used)
- Trading activity (virtual positions, PnL)

1.4 Cookies
- Authentication cookies
- Preference cookies
- Analytics cookies

## 2. HOW WE USE YOUR INFORMATION

2.1 Primary Uses
- Account creation and management
- Platform functionality
- KYC verification
- Customer support
- Security and fraud prevention

2.2 Analytics
- Improve platform performance
- Understand user behavior
- Develop new features

2.3 Communications
- Service updates
- Security alerts
- Marketing (with consent)

## 3. DATA SHARING

3.1 We Share Data With:
- Service providers (hosting, email, analytics)
- Legal authorities (if required by law)

3.2 We Do NOT:
- Sell your data to third parties
- Share trading activity publicly (unless anonymized)
- Use data for purposes not disclosed

## 4. DATA SECURITY

4.1 Security Measures
- Encryption in transit (HTTPS)
- Encryption at rest
- Access controls
- Regular security audits
- Password hashing (bcrypt)

4.2 Data Retention
- Account data: Until account deletion
- KYC documents: 7 years
- Trading records: 7 years
- Audit logs: 7 years

## 5. YOUR RIGHTS (GDPR)

5.1 Right to Access
- Request copy of your data

5.2 Right to Correction
- Update inaccurate data

5.3 Right to Deletion
- Request account and data deletion
- Except data required by law

5.4 Right to Portability
- Receive data in structured format

5.5 Right to Object
- Object to data processing

5.6 Right to Restrict
- Limit how we use data

## 6. COOKIES

6.1 Types of Cookies
- Essential: Required for platform function
- Functional: Remember your preferences
- Analytics: Understand usage patterns

6.2 Cookie Consent
- You can manage cookie preferences
- Disabling cookies may limit functionality

## 7. CHILDREN'S PRIVACY

- Platform not for users under 18
- We do not knowingly collect data from minors
- If minor data found, we delete it immediately

## 8. INTERNATIONAL TRANSFERS

- Data may be transferred outside your country
- We ensure adequate data protection

## 9. CHANGES TO PRIVACY POLICY

- We may update this policy
- Users notified of material changes
- Continued use = acceptance

## 10. CONTACT

Privacy questions: privacy@[platform].com
Data requests: gdpr@[platform].com

---

**Effective Date:** February 5, 2026
```

### 3.2.4 Required Disclaimers (Every Page)

**Footer Disclaimer:**
```
⚠️ RISK WARNING: Trading CFDs involves significant risk. This is a PAPER TRADING 
platform using virtual funds only. Past performance does not guarantee future 
results. [Platform Name] does not provide investment advice.
```

**Dashboard Disclaimer:**
```
💡 IMPORTANT: You are trading with virtual funds. Profits and losses have no 
real monetary value. This platform is for educational purposes only.
```

**Before First Trade:**
```
⚠️ FIRST TRADE WARNING:
• This is your first trade on our paper trading platform
• You are using virtual funds with NO real value
• Leverage can magnify both gains and losses
• You can lose your entire virtual account balance
• Read our Risk Disclosure before proceeding

☐ I understand and wish to continue

[Proceed to Trade] [Cancel]
```

---

## 3.3 Data Protection Implementation

### 3.3.1 GDPR Compliance Checklist

- [ ] **Lawful Basis for Processing**
  - Consent: User registration
  - Contract: Provide platform services
  - Legal obligation: KYC records

- [ ] **Data Minimization**
  - Collect only necessary data
  - No excessive personal information
  - Delete data when no longer needed

- [ ] **Purpose Limitation**
  - Use data only for stated purposes
  - Don't repurpose without consent

- [ ] **Storage Limitation**
  - Delete data when account closed (except legal requirements)
  - 7-year retention for financial records

- [ ] **User Rights**
  - Implement data access requests
  - Implement data deletion requests
  - Implement data portability
  - 30-day response time

- [ ] **Consent Management**
  - Clear consent checkboxes
  - Granular consent (marketing separate from service)
  - Easy to withdraw consent

- [ ] **Data Breach Procedures**
  - Detection procedures
  - Notification plan (72 hours)
  - User notification procedures

### 3.3.2 Data Encryption Requirements

**In Transit:**
```typescript
// All API calls must use HTTPS
const API_URL = 'https://api.platform.com'; // ✅
const API_URL = 'http://api.platform.com';  // ❌ NEVER
```

**At Rest:**
```typescript
// Sensitive fields encrypted in database
interface User {
  id: string;
  email: string;
  passwordHash: string; // Hashed with bcrypt
  kycDocuments: {
    identityFrontUrl: string; // Encrypted in storage
    addressProofUrl: string;  // Encrypted in storage
  }
}
```

**Password Hashing:**
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10; // Minimum

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(
  password: string, 
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

### 3.3.3 Data Deletion Implementation

**User-Initiated Deletion:**
```typescript
async function deleteUserAccount(userId: string): Promise<void> {
  // 1. Validate request
  const user = await userRepo.findById(userId);
  if (!user) throw new Error('User not found');
  
  // 2. Close all open positions
  await closeAllPositions(userId);
  
  // 3. Delete non-essential data
  await Promise.all([
    userRepo.delete(userId),
    sessionRepo.deleteAll(userId),
    preferencesRepo.delete(userId)
  ]);
  
  // 4. Anonymize essential data (legal requirements)
  await Promise.all([
    transactionRepo.anonymize(userId),
    auditLogRepo.anonymize(userId),
    kycRepo.anonymize(userId) // Keep for 7 years, but remove identifiers
  ]);
  
  // 5. Log deletion
  await auditLog.create({
    action: 'ACCOUNT_DELETED',
    userId: 'DELETED',
    timestamp: new Date()
  });
  
  // 6. Send confirmation email
  await sendEmail(user.email, 'Account Deleted', 
    'Your account has been permanently deleted.');
}
```

---

## 3.4 Record-Keeping Requirements

### 3.4.1 What Must Be Kept (7 Years)

**Trading Records:**
- All positions (open and closed)
- Entry and exit prices
- P&L calculations
- Timestamps

**Account Records:**
- Balance changes
- Margin calculations
- Liquidations
- Fund allocations (by admin)

**KYC Records:**
- Submitted documents
- Approval/rejection decisions
- Reviewer notes

**Audit Logs:**
- All significant actions
- Admin actions
- Security events
- System changes

### 3.4.2 Audit Log Implementation

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes: {
    before: any;
    after: any;
  };
  ip: string;
  userAgent: string;
  sessionId: string;
}

type AuditAction =
  | 'USER_REGISTERED'
  | 'USER_LOGGED_IN'
  | 'USER_LOGGED_OUT'
  | 'KYC_SUBMITTED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'POSITION_OPENED'
  | 'POSITION_CLOSED'
  | 'POSITION_LIQUIDATED'
  | 'BALANCE_CHANGED'
  | 'ADMIN_ACTION'
  | 'PASSWORD_CHANGED'
  | 'ACCOUNT_DELETED';

// Usage
await auditLog.create({
  userId: user.id,
  userEmail: user.email,
  action: 'POSITION_OPENED',
  entityType: 'Position',
  entityId: position.id,
  changes: {
    before: null,
    after: {
      symbol: 'EURUSD',
      type: 'BUY',
      size: 1.0,
      entryPrice: 1.0875
    }
  },
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  sessionId: req.session.id
});
```

---

# 4. PROJECT MANAGEMENT SETUP

> **CRITICAL:** Solo projects fail due to lack of structure, not lack of skill.

## 4.1 Solo-Friendly Agile Methodology

### 4.1.1 One-Week Sprint Structure

```
SPRINT (7 days)
├─ Day 1: Planning
│  ├─ Review previous sprint
│  ├─ Choose THIS sprint's goal
│  └─ Break into daily tasks
│
├─ Days 2-6: Development
│  ├─ Daily standup (with yourself)
│  │  ├─ What did I do yesterday?
│  │  ├─ What will I do today?
│  │  └─ Any blockers?
│  ├─ Code 4-6 hours
│  ├─ Test as you go
│  └─ Commit daily
│
└─ Day 7: Review & Rest
   ├─ Demo to yourself
   ├─ Update documentation
   ├─ Plan next sprint
   └─ REST (seriously)
```

### 4.1.2 Sprint Goals (Examples)

**Bad Sprint Goal:**
"Build the trading platform"
- Too vague
- No clear success criteria
- Overwhelming

**Good Sprint Goals:**
- "Implement and test margin calculation functions"
- "Build user registration and email verification"
- "Create position opening API endpoint with tests"
- "Implement real-time price updates with WebSocket"

**Sprint Goal Criteria:**
✅ Single, clear objective  
✅ Testable/demonstrable  
✅ Achievable in 5-6 days  
✅ Adds user value  

### 4.1.3 Task Breakdown

**Example: "Implement Position Opening"**

```
Sprint Goal: User can open a position via API

Day 1: Planning
├─ List all requirements
├─ Write acceptance criteria
└─ Design data flow

Day 2: Database
├─ Create positions table
├─ Add migrations
└─ Write repository tests

Day 3: Engine Logic
├─ Write margin calculation
├─ Write validation rules
├─ Unit tests (pure functions)

Day 4: API Endpoint
├─ Create POST /positions route
├─ Implement request validation
├─ Integration tests

Day 5: Error Handling
├─ Handle all error cases
├─ Add proper responses
├─ Test edge cases

Day 6: Documentation
├─ Update API docs
├─ Add code comments
└─ Write usage examples

Day 7: Review
├─ Manual testing
├─ Fix any bugs found
└─ Commit and push
```

### 4.1.4 Daily Standup Template (Solo)

**Morning (5 minutes):**
```
Yesterday:
- Completed margin calculation functions
- Wrote 15 unit tests
- All tests passing ✅

Today:
- Create positions table schema
- Write repository layer
- Start integration tests

Blockers:
- None

Notes:
- Margin calculation took longer than expected
- But logic is solid now
```

---

## 4.2 Version Control Strategy

### 4.2.1 Git Workflow (Simple)

**Branch Strategy:**
```
main (production-ready)
└─ develop (integration branch)
   ├─ feature/user-registration
   ├─ feature/position-opening
   └─ bugfix/margin-calculation
```

**Rules:**
1. `main` branch is always deployable
2. Work in feature branches
3. Merge to `develop` when complete
4. Merge `develop` to `main` at end of sprint

### 4.2.2 Commit Message Convention

**Format:**
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests added/modified
- `refactor`: Code restructuring
- `chore`: Maintenance

**Examples:**
```bash
git commit -m "feat(auth): add user registration endpoint"
git commit -m "fix(trading): correct margin calculation for crypto"
git commit -m "test(engine): add liquidation test cases"
git commit -m "docs(api): update position endpoints documentation"
```

**Bad Examples:**
```bash
git commit -m "updates"           # Too vague
git commit -m "fixed stuff"       # Not descriptive
git commit -m "asdfgh"            # Meaningless
```

### 4.2.3 When to Commit

**Commit After:**
✅ Feature complete and tests pass  
✅ Bug fixed and verified  
✅ End of work session  
✅ Before trying risky changes  
✅ Logical units of work  

**Don't Commit:**
❌ Broken code  
❌ Half-finished features  
❌ Uncommented experiments  
❌ Sensitive data (passwords, keys)  

### 4.2.4 .gitignore Template

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Database
*.sqlite
*.db

# Uploads (KYC documents)
uploads/
```

---

## 4.3 Backup Strategy

### 4.3.1 Daily Backups (Automated)

**Code Backup:**
- Git remote (GitHub/GitLab)
- Push daily minimum
- Private repository

**Database Backup:**
```bash
# PostgreSQL backup script
#!/bin/bash

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="cfd_trading"

# Create backup
pg_dump $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Keep last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

# Upload to cloud (optional)
# aws s3 cp "$BACKUP_DIR/backup_$DATE.sql" s3://my-backups/
```

**Cron Job:**
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-script.sh
```

### 4.3.2 Weekly Full Backup

**What to Backup:**
- Complete database dump
- All code (Git)
- Environment configuration (sanitized)
- Documentation
- Uploaded files (KYC documents)

**Storage:**
- Local: External hard drive
- Cloud: AWS S3 / Google Cloud Storage / Dropbox
- 3-2-1 Rule: 3 copies, 2 different media, 1 offsite

### 4.3.3 Disaster Recovery Plan

**If Development Machine Dies:**
1. Get new machine
2. Install Node.js, PostgreSQL, Git
3. Clone repository from GitHub
4. Restore database from latest backup
5. Install dependencies: `npm install`
6. Copy `.env` from backup
7. Continue working

**Test Recovery:**
- Test restore process monthly
- Document restore time
- Update procedures if needed

---

## 4.4 Testing Strategy

### 4.4.1 Testing Pyramid

```
          /\
         /  \
        / E2E \      ← Few tests (critical flows)
       /------\
      / Integration \  ← Medium tests (API + Engine)
     /--------------\
    /   Unit Tests   \ ← Many tests (pure functions)
   /------------------\
```

### 4.4.2 Unit Tests (Most Important)

**Purpose:** Test pure functions in isolation

**Example:**
```typescript
// src/engine/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateMargin, calculateEquity } from './calculations';

describe('Trading Calculations', () => {
  describe('calculateMargin', () => {
    it('calculates margin correctly for forex', () => {
      const result = calculateMargin(100000, 100);
      expect(result).toBe(1000);
    });
    
    it('throws error for zero leverage', () => {
      expect(() => calculateMargin(100000, 0))
        .toThrow('Leverage must be positive');
    });
    
    it('handles decimal leverage', () => {
      const result = calculateMargin(100000, 50);
      expect(result).toBe(2000);
    });
  });
  
  describe('calculateEquity', () => {
    it('calculates equity with profit', () => {
      const result = calculateEquity(10000, 500);
      expect(result).toBe(10500);
    });
    
    it('calculates equity with loss', () => {
      const result = calculateEquity(10000, -500);
      expect(result).toBe(9500);
    });
    
    it('handles zero PnL', () => {
      const result = calculateEquity(10000, 0);
      expect(result).toBe(10000);
    });
  });
});
```

**Coverage Target:** 80%+ for business logic

### 4.4.3 Integration Tests

**Purpose:** Test API + Engine + Database together

**Example:**
```typescript
// src/api/positions.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from './app';
import { createTestUser, cleanDatabase } from './test-utils';

describe('POST /api/positions', () => {
  let authToken: string;
  
  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser();
    authToken = user.token;
  });
  
  it('opens position successfully', async () => {
    const response = await request(app)
      .post('/api/positions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        symbol: 'EURUSD',
        type: 'BUY',
        size: 1.0,
        stopLoss: 1.0800,
        takeProfit: 1.0950
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.position).toMatchObject({
      symbol: 'EURUSD',
      type: 'BUY',
      size: 1.0
    });
  });
  
  it('rejects position with insufficient margin', async () => {
    // Create user with low balance
    const poorUser = await createTestUser({ balance: 100 });
    
    const response = await request(app)
      .post('/api/positions')
      .set('Authorization', `Bearer ${poorUser.token}`)
      .send({
        symbol: 'EURUSD',
        type: 'BUY',
        size: 10.0 // Requires more margin than available
      });
    
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('INSUFFICIENT_MARGIN');
  });
});
```

### 4.4.4 End-to-End Tests (Minimal)

**Purpose:** Test complete user flows

**Example Scenarios:**
1. New user registers → verifies email → submits KYC → gets approved → opens position
2. User opens position → price moves → hits take profit → position closes → balance updates

**Tool:** Playwright or Cypress (add later)

### 4.4.5 Test-Driven Development (TDD)

**Process:**
1. Write test (fails)
2. Write minimal code to pass
3. Refactor
4. Repeat

**Example:**
```typescript
// 1. Write test first
describe('isLiquidatable', () => {
  it('returns true when equity below maintenance margin', () => {
    expect(isLiquidatable(400, 500)).toBe(true);
  });
});

// Test fails (function doesn't exist)

// 2. Write minimal code
function isLiquidatable(
  equity: number,
  maintenanceMargin: number
): boolean {
  return equity < maintenanceMargin;
}

// Test passes

// 3. Add more tests
it('returns false when equity above maintenance margin', () => {
  expect(isLiquidatable(600, 500)).toBe(false);
});

// 4. Refactor if needed
```

---

## 4.5 Deployment Pipeline

### 4.5.1 Three Environments

```
Development (Local)
↓
Staging (Test Server)
↓
Production (Live)
```

**Development:**
- Your local machine
- Local database
- Fast iteration
- No real users

**Staging:**
- Deployed to test server
- Similar to production
- Test before release
- Demo to others

**Production:**
- Live platform
- Real users (once launched)
- Stable, tested code only
- Monitored 24/7

### 4.5.2 Deployment Checklist

**Before Deploying to Production:**
- [ ] All tests passing
- [ ] Code reviewed (self-review minimum)
- [ ] Database migrations tested
- [ ] Environment variables set
- [ ] Backup created
- [ ] Rollback plan ready
- [ ] Monitoring in place
- [ ] Documentation updated

### 4.5.3 Manual Deployment (MVP)

**Steps:**
```bash
# 1. Test locally
npm test

# 2. Build
npm run build

# 3. Deploy to staging
git push staging main

# 4. Test on staging
# - Manual testing
# - Run smoke tests

# 5. If tests pass, deploy to production
git push production main

# 6. Monitor
# - Check logs
# - Check error rates
# - Test critical flows
```

**Rollback Plan:**
```bash
# If issues found
git revert HEAD
git push production main
# Or restore from backup
```

---

# 5. RESOURCE PREPARATION

## 5.1 Documentation Templates

### 5.1.1 Architecture Decision Record (ADR)

**Template:**
```markdown
# ADR-001: Use PostgreSQL as Primary Database

## Status
Accepted

## Context
We need to choose a database for our CFD trading platform.
Requirements:
- ACID transactions (financial integrity)
- Complex queries (reports, analytics)
- Strong consistency
- Mature ecosystem

## Decision
Use PostgreSQL 16

## Consequences

### Positive
- ACID compliance protects financial data
- Rich feature set (JSON, full-text search)
- Excellent documentation
- Free and open-source

### Negative
- Slightly more complex than MongoDB
- Requires learning SQL

### Neutral
- Need Prisma ORM for type safety
```

**When to Create ADR:**
- Major technology decision
- Architecture change
- Significant tradeoff
- Deviation from plan

### 5.1.2 Invariants Documentation

**Template:**
```markdown
# System Invariants

## Core Invariants (MUST NEVER BE VIOLATED)

### INV-001: Non-Negative Balance
**Rule:** Account balance >= 0 at all times
**Enforcement:** Database constraint + application validation
**Test:** Unit tests in `src/engine/validation.test.ts`

### INV-002: Margin Relationship
**Rule:** Used Margin <= Account Equity
**Enforcement:** Calculated fields + validation
**Test:** Integration tests in `src/api/positions.test.ts`

### INV-003: Position Size Limits
**Rule:** Position size >= minimum for asset class
**Rule:** Position size <= maximum allowed
**Enforcement:** Pre-trade validation
**Test:** Unit tests in `src/engine/limits.test.ts`

## Testing Invariants

```typescript
// Every function that modifies state should check invariants
function closePosition(positionId: string) {
  // ... close position logic
  
  // Check invariants after
  assertInvariants(account);
}

function assertInvariants(account: Account) {
  if (account.balance < 0) {
    throw new InvariantViolation('Balance negative');
  }
  if (account.usedMargin > account.equity) {
    throw new InvariantViolation('Margin > Equity');
  }
}
```
```

### 5.1.3 API Specification Template

**See Section 2.7 for complete API spec**

### 5.1.4 Decision Log

**Template:**
```markdown
# Decision Log

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| 2026-02-05 | Use Fastify instead of Express | Better TypeScript support, faster | Slight learning curve |
| 2026-02-06 | Implement JWT auth | Stateless, scalable | Need token refresh mechanism |
| 2026-02-07 | Use React Query for state | Simplifies server state management | New dependency |
```

---

## 5.2 AI Tools Setup (Critical)

### 5.2.1 How to Use AI Effectively

**✅ Good Uses:**
- Generate boilerplate code
- Write unit tests
- Explain error messages
- Suggest improvements
- Code reviews

**❌ Bad Uses:**
- Architect the system (you must do this)
- Make business logic decisions
- Write code you don't understand
- Copy-paste without testing

### 5.2.2 AI Prompting Best Practices

**Bad Prompt:**
"Build me a trading platform"
- Too vague
- No context
- Produces unusable code

**Good Prompt:**
```
I'm building a CFD trading platform. I need a pure function that 
calculates initial margin.

Requirements:
- Function name: calculateInitialMargin
- Parameters: tradeSize (number), leverage (number)
- Returns: number (margin required)
- Formula: tradeSize / leverage
- Should throw error if leverage <= 0

Please write this function in TypeScript with:
1. Input validation
2. JSDoc comments
3. Unit tests using Vitest
```

**Result:** Usable, testable code

### 5.2.3 AI Code Review Checklist

When AI generates code, check:
- [ ] Do I understand every line?
- [ ] Are there tests?
- [ ] Does it follow our architecture?
- [ ] Are there edge cases handled?
- [ ] Is it actually what I asked for?
- [ ] Can I explain it to someone else?

**Red Flag:** If you can't explain the code → Don't use it

---

## 5.3 Learning Resources (Ranked)

### 5.3.1 CFD Trading Knowledge

1. **Investopedia** (Free)
   - Start here for basics
   - Clear explanations
   - Examples
   - https://www.investopedia.com/terms/c/contractfordifferences.asp

2. **BabyPips** (Free)
   - Forex school
   - Interactive lessons
   - https://www.babypips.com/learn/forex

3. **TradingView Education** (Free)
   - Technical analysis
   - Chart reading
   - https://www.tradingview.com/education/

### 5.3.2 Technical Books

1. **"Designing Data-Intensive Applications"** by Martin Kleppmann
   - System design
   - Database fundamentals
   - Essential reading

2. **"Clean Code"** by Robert C. Martin
   - Code quality
   - Best practices

3. **"The Pragmatic Programmer"**
   - Professional development
   - Problem-solving

### 5.3.3 Online Courses (Optional)

1. **TypeScript**: Official docs + TypeScript Deep Dive
2. **React**: Official docs + React.dev
3. **PostgreSQL**: Official docs + PostgreSQL Tutorial
4. **System Design**: System Design Primer (GitHub)

### 5.3.4 Documentation (Primary Resources)

| Tech | URL | Use When |
|------|-----|----------|
| TypeScript | https://www.typescriptlang.org/docs/ | Any TypeScript question |
| React | https://react.dev | React features, hooks |
| Node.js | https://nodejs.org/docs/ | Node APIs, modules |
| PostgreSQL | https://www.postgresql.org/docs/ | SQL, database features |
| Prisma | https://www.prisma.io/docs | ORM usage |
| Fastify | https://www.fastify.io/docs/ | API framework |
| Vitest | https://vitest.dev | Testing |

**Rule:** Always check official docs before StackOverflow

---

## 5.4 Development Environment Checklist

### 5.4.1 Required Software

- [ ] **Code Editor**: VS Code (or your preference)
- [ ] **Node.js**: 20.x LTS from nodejs.org
- [ ] **PostgreSQL**: 16.x from postgresql.org
- [ ] **Git**: Latest from git-scm.com
- [ ] **Postman**: For API testing

### 5.4.2 VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "rangav.vscode-thunder-client",
    "vitest.explorer"
  ]
}
```

### 5.4.3 Project Structure Setup

```bash
# Create project directory
mkdir cfd-trading-platform
cd cfd-trading-platform

# Initialize Git
git init

# Create README
echo "# CFD Trading Platform" > README.md

# Create .gitignore
curl -o .gitignore https://www.toptal.com/developers/gitignore/api/node

# Initial commit
git add .
git commit -m "chore: initial commit"

# Create remote repository on GitHub
# Then push
git remote add origin https://github.com/yourusername/cfd-trading.git
git push -u origin main
```

---

# 6. RISK MITIGATION STRATEGIES

## 6.1 Why Previous Attempts Failed (Diagnosis)

### Common Failure Patterns

| Pattern | Symptom | Root Cause | Solution |
|---------|---------|------------|----------|
| **Restart Cycle** | Start over every few weeks | No clear architecture | Complete Section 2 before coding |
| **Mounting Bugs** | More bugs than features | UI logic mixed with business logic | Separate concerns (Section 1.4) |
| **AI Overreach** | Code works but you don't know why | Letting AI architect | Use AI for generation, not design |
| **Test Paralysis** | Can't add features without breaking old ones | No tests | TDD from day 1 |
| **Scope Creep** | Feature list keeps growing | No MVP definition | Strict sprint goals |

### Why This Blueprint Succeeds

✅ **Understanding First**: Sections 1-3 before code  
✅ **Architecture Defined**: Section 2 = roadmap  
✅ **Clear Ownership**: Each layer has one job  
✅ **Tests Required**: No code without tests  
✅ **Incremental Progress**: Weekly sprints  

---

## 6.2 Incremental Development Roadmap

### Phase 1: Foundation (Weeks 1-3)

**Week 1: Core Engine**
- [ ] Pure calculation functions
- [ ] Unit tests (80%+ coverage)
- [ ] Invariant validation
- [ ] No database, no API

**Week 2: Database & Auth**
- [ ] PostgreSQL schema
- [ ] Prisma setup
- [ ] User registration
- [ ] JWT authentication

**Week 3: Basic Trading**
- [ ] Open position endpoint
- [ ] Close position endpoint
- [ ] Balance updates
- [ ] Integration tests

### Phase 2: Core Features (Weeks 4-6)

**Week 4: Risk Management**
- [ ] Stop loss / Take profit
- [ ] Margin calls
- [ ] Liquidation logic

**Week 5: Frontend**
- [ ] React setup
- [ ] Authentication pages
- [ ] Dashboard
- [ ] Position list

**Week 6: Real-Time Data**
- [ ] Price feed integration
- [ ] WebSocket setup
- [ ] Live P&L updates

### Phase 3: Polish (Weeks 7-8)

**Week 7: Admin Panel**
- [ ] KYC review
- [ ] User management
- [ ] Reports

**Week 8: Production Prep**
- [ ] Error handling
- [ ] Monitoring
- [ ] Documentation
- [ ] Deployment

---

## 6.3 Quality Gates (STOP POINTS)

### Gate 1: After Section 1
**DO NOT PROCEED IF:**
- [ ] Can't explain pure functions
- [ ] Don't understand liquidation
- [ ] Can't draw architecture diagram

**FIX:** Re-read Section 1, take notes, explain to rubber duck

### Gate 2: After Section 2
**DO NOT PROCEED IF:**
- [ ] Architecture diagram unclear
- [ ] Database schema undefined
- [ ] Business logic not in English first

**FIX:** Complete templates, write everything down

### Gate 3: Before First Code
**DO NOT PROCEED IF:**
- [ ] No tests planned
- [ ] No sprint goal defined
- [ ] Don't know what success looks like

**FIX:** Define acceptance criteria, plan tests

### Gate 4: Every Sprint End
**DO NOT PROCEED IF:**
- [ ] Tests not passing
- [ ] Can't demo the feature
- [ ] Don't understand the code

**FIX:** Fix tests, refactor, document

---

## 6.4 "No Restart" Decision Framework

### When to Refactor (Allowed)

✅ **Yes, refactor if:**
- Tests exist and pass
- Core logic unchanged
- Invariants still enforced
- Can explain why
- Have a plan

### When to Restart (Rarely)

**Only if:**
- Architecture fundamentally broken
- Invariants violated throughout
- No tests exist
- Code completely incomprehensible

**But first:**
- Try to salvage with tests
- Extract working parts
- Rebuild incrementally

**Rule:** Restart is failure. Avoid at all costs.

### Decision Tree

```
Is feature not working?
├─ Yes
│  ├─ Are there tests?
│  │  ├─ Yes → Debug with tests
│  │  └─ No → Add tests first, then debug
│  └─ Can't debug?
│     └─ Pair program (with AI or peer)
└─ No
   └─ Keep building
```

---

# FINAL READINESS ASSESSMENT

## Must Pass All Before Coding

### Knowledge Check
- [ ] I can explain what a pure function is and why it matters
- [ ] I can explain CFD liquidation to a non-technical person
- [ ] I can calculate margin requirements manually
- [ ] I can draw the three-layer architecture
- [ ] I understand why frontend can't be trusted

### Planning Check
- [ ] I have completed architecture diagram
- [ ] I have database schema design
- [ ] I have written business logic in English first
- [ ] I have API specification
- [ ] I have legal disclaimers drafted

### Process Check
- [ ] I have version control set up
- [ ] I know my sprint 1 goal
- [ ] I have testing strategy
- [ ] I have backup plan
- [ ] I know where AI can/can't help

### Mindset Check
- [ ] I understand this is a marathon, not sprint
- [ ] I commit to not restarting
- [ ] I will test everything
- [ ] I will document decisions
- [ ] I will take breaks

## Final Truth

> **Most people fail because they start coding too early.**
> **You are succeeding because you stopped and planned.**

---

**IF ALL CHECKBOXES ARE CHECKED:**
→ Proceed to Section 7: Implementation Roadmap

**IF ANY CHECKBOX IS UNCHECKED:**
→ Review the relevant section
→ Do not proceed until you can check it confidently

---

**END OF SECTIONS 3-6**

Ready for implementation? Continue to Section 7 →
