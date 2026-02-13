# Daily Execution Checklist - Phase 2

**Start Date:** February 13, 2026  
**Target Launch:** February 27, 2026  
**Print & Post This Document**

---

## 📅 WEEK 1: LEGAL + FRONTEND POLISH

### ✅ BEFORE STARTING WEEK 1
- [ ] Team read `PHASE_2_IMPLEMENTATION_GUIDE.md`
- [ ] Create GitHub milestones for Week 1 and Week 2
- [ ] Set up branch protection rules (`main` requires PR review)
- [ ] Assign tasks: Frontend person, Backend lead, QA

---

## 📆 MONDAY - Legal Integration

**Goal:** Legal documents integrated into signup, disclaimers on all pages

**Morning (2 hours)**
- [ ] Create `frontend/components/LegalDocuments/` directory
- [ ] Create `RiskDisclosureModal.tsx` component
- [ ] Create `TermsOfServiceModal.tsx` component  
- [ ] Create `PrivacyPolicyModal.tsx` component
- [ ] Create `DisclaimerBanner.tsx` component
- [ ] Read `/docs/legal/DISCLAIMERS.md` for required warnings

**Afternoon (2 hours)**
- [ ] Integrate RiskDisclosure modal into signup flow
  - Must accept before account creation
  - Store acceptance timestamp in database
- [ ] Add disclaimer footer to all pages
- [ ] Add account-specific disclaimer on dashboard
- [ ] Add first-trade warning modal (shows once per account)

**Testing (1 hour)**
- [ ] Signup flow shows legal docs
- [ ] Can't proceed without accepting
- [ ] Disclaimers display on all pages
- [ ] Modals are mobile responsive

**Commit & PR**
```bash
git checkout -b feature/legal-integration
git commit -m "feat: add legal disclaimers and signatures"
git push origin feature/legal-integration
# Create PR, get reviewed, merge to main
```

**Done Checklist**
- [ ] All legal docs integrated
- [ ] Acceptance stored in database
- [ ] UI responsive on mobile
- [ ] No console errors
- [ ] PR merged to main

---

## 📆 TUESDAY - Frontend Components Setup

**Goal:** Create React component structure and wire to backend

**Morning (2 hours)**
- [ ] Create `frontend/src/components/Account/` directory
- [ ] Create `frontend/src/components/Trading/` directory
- [ ] Create `AccountSummary.tsx` component
  ```typescript
  interface Props {
    accountId: string;
  }
  
  const [stats, setStats] = useState(null);
  
  // Fetch from /api/v1/account/stats
  // Display: balance, equity, margin level, free margin
  // Update every 2 seconds
  ```
- [ ] Create `TradingChart.tsx` component
- [ ] Create `OrderTicket.tsx` component
- [ ] Create `PositionList.tsx` component

**Afternoon (2 hours)**
- [ ] Install dependencies
  ```bash
  npm install lightweight-charts
  npm install date-fns  # for formatting times
  npm install decimal.js  # for precise calculations
  ```
- [ ] Create API service layer
  ```typescript
  // src/services/api.ts
  export const api = {
    account: {
      stats: () => fetch("/api/v1/account/stats"),
      addFunds: (amount) => fetch("/api/v1/account/add-funds", ...)
    },
    trading: {
      openPosition: (params) => fetch("/api/v1/trade/open-position", ...),
      closePosition: (id) => fetch(`/api/v1/trade/positions/${id}/close`, ...),
      positions: () => fetch("/api/v1/trade/positions")
    }
  };
  ```
- [ ] Create TypeScript interfaces for all API responses

**Testing (30 min)**
- [ ] `npm run type-check` passes (no TypeScript errors)
- [ ] Components render without crashing
- [ ] API calls don't throw errors (even if backend unavailable)

**Commit & PR**
```bash
git checkout -b feature/component-structure
git commit -m "feat: create component structure and API layer"
```

**Done Checklist**
- [ ] All components created (empty or with placeholders)
- [ ] API service layer works
- [ ] No TypeScript errors
- [ ] Dependencies installed

---

## 📆 WEDNESDAY - Account Summary Component

**Goal:** Display real account data with 2-second auto-refresh

**Morning (3 hours)**
- [ ] Implement AccountSummary component
  ```typescript
  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch("/api/v1/account/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const stats = await response.json();
      setStats(stats);
    };
    
    fetchStats(); // Initial fetch
    const interval = setInterval(fetchStats, 2000); // Every 2 seconds
    return () => clearInterval(interval);
  }, []);
  ```

- [ ] Display values with formatting
  - Balance: $10,000.00
  - Equity: $9,850.50
  - Margin Used: $152.35
  - Free Margin: $9,698.15
  - Margin Level: 64.68%

- [ ] Add color coding
  - Margin Level > 50%: Green
  - Margin Level 20-50%: Yellow
  - Margin Level < 20%: Red + warning

- [ ] Make responsive (mobile-friendly)

**Afternoon (2 hours)**
- [ ] Add error handling
  - Show loading state while fetching
  - Show error message if fetch fails
  - Retry button on error
  
- [ ] Add visual alerts
  - Show liquidation warning if margin < 50%
  - Pulse animation when margin < 30%

- [ ] Add modal to add funds (optional, for testing)
  ```
  [Add Funds] button opens modal
  Input amount
  [Confirm] calls /api/v1/account/add-funds
  Shows new balance
  ```

**Testing (1 hour)**
- [ ] Starts with loading state
- [ ] Updates every 2 seconds
- [ ] Shows all required fields
- [ ] Colors change based on margin level
- [ ] Error handling works
- [ ] Mobile responsive (test on iPhone/Android)

**Live Testing Against Backend (if available)**
- [ ] Connect to real backend with test account
- [ ] Watch values update in real-time
- [ ] Verify calculations look correct

**Commit & PR**
```bash
git checkout -b feature/account-summary
git commit -m "feat: implement account summary with live updates"
```

**Done Checklist**
- [ ] Component displays real data
- [ ] Updates every 2 seconds
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Color coding implemented
- [ ] Liquidation warning shows

---

## 📆 THURSDAY - Order Ticket Component

**Goal:** Complete form for opening positions with validation

**Morning (3 hours)**
- [ ] Create form with fields
  ```
  Instrument: [Dropdown - EUR/USD, GBP/USD, etc.]
  Direction: [Radio] LONG / SHORT
  Size: [Input] with slider 0.01 to 100
  Leverage: [Slider] 1 to 500
  Entry Price: [Display only - current market]
  Stop Loss: [Optional input]
  Take Profit: [Optional input]
  ```

- [ ] Add real-time calculations
  ```
  When user changes Size or Leverage:
    MarginRequired = (Size × Price) / Leverage
    MaxPosition = FreeMargin × Leverage / Price
    
  When SL/TP changes:
    PotentialLoss = |SL - Entry| × Size
    PotentialGain = |TP - Entry| × Size
  ```

- [ ] Display calculations below form
  ```
  Margin Required: $16.28
  Max Position Size: 572.5 lots
  Risk/Reward: 1:2 (if SL/TP set)
  ```

**Afternoon (2 hours)**
- [ ] Add validation
  ```typescript
  const validateOrder = (order) => {
    if (order.size <= 0) throw new Error("Size must be > 0");
    if (order.leverage < 1 || order.leverage > 500) 
      throw new Error("Leverage must be 1-500");
    if (order.marginRequired > stats.freeMargin)
      throw new Error("Insufficient margin");
    
    // Check SL/TP placement
    if (order.direction === "LONG") {
      if (order.stopLoss && order.stopLoss > order.entryPrice)
        throw new Error("SL must be below entry for LONG");
    }
    // Similar for SHORT
  };
  ```

- [ ] Add confirmation modal
  ```
  Before sending order to backend, show:
  - Exact details of order
  - Risk/reward summary
  - Confirmation checkbox: "I understand the risks"
  - [Confirm] [Cancel] buttons
  ```

**Testing (1 hour)**
- [ ] Form validation shows errors
- [ ] Can't submit invalid orders
- [ ] Calculations update in real-time
- [ ] Confirmation modal shows
- [ ] Clicking Confirm sends to backend

**Commit & PR**
```bash
git checkout -b feature/order-ticket
git commit -m "feat: create order ticket with validation"
```

**Done Checklist**
- [ ] Form displays all fields
- [ ] Validation prevents bad input
- [ ] Calculations correct
- [ ] Confirmation required
- [ ] Error messages helpful

---

## 📆 FRIDAY - Position Management + Testing

**Morning (2 hours) - Position Management Component**
- [ ] Create component showing list of open positions
  ```
  For each position:
  - Instrument (EUR/USD) | Direction (LONG) | Size (1.5)
  - Entry: 1.0850 | Current: 1.0875 | Margin: $16.28
  - PnL: +$0.375 (+0.03%) | SL: 1.0820 | TP: 1.0900
  - [Edit SL/TP] [Close Position] [Details]
  ```

- [ ] Implement Edit SL/TP modal
  - Allow updating stops without closing
  - Validation (correct side of entry)
  - Call `/api/v1/trade/positions/{id}` with PUT

- [ ] Implement Close Position
  - Show confirmation dialog
  - Show what the realized PnL will be
  - Call endpoint

- [ ] Real-time updates
  - Subscribe to position changes
  - Update PnL based on price changes
  - Show closing alerts if triggered

**Afternoon (2 hours) - End-to-End Testing**
- [ ] Test complete flow manually
  1. Login → Account Summary shows balance
  2. Open Order Ticket
  3. Place first position (EUR/USD LONG)
  4. See position in Position List
  5. Update stop loss
  6. Change market price (via backend or test API)
  7. See PnL update in real-time
  8. Close position
  9. See it move to closed positions

- [ ] Test error scenarios
  - Try to open with insufficient margin → shows error
  - Try invalid SL placement → shows error
  - Network error while placing → shows retry
  - Position closed by liquidation → shows alert

- [ ] Test on mobile
  - All components responsive
  - Forms work on small screens
  - Charts readable on mobile

**Testing Against E2E Suite (1 hour)**
- [ ] Run the E2E tests: `npm run test:golden-paths`
- [ ] All tests should pass
- [ ] If any fail, debug with backend team

**End of Week Verification**
- [ ] Account Summary: ✅ Working
- [ ] Order Ticket: ✅ Working
- [ ] Position Management: ✅ Working
- [ ] Legal Documents: ✅ Integrated
- [ ] Error Handling: ✅ In place
- [ ] Mobile Responsive: ✅ Verified
- [ ] E2E Tests: ✅ Passing

**Commit & PR**
```bash
git checkout -b feature/position-management
git commit -m "feat: implement position management and complete trading UI"
git push origin feature/position-management
# Create final PR for week 1
```

---

## 🎯 WEEK 2: DOCUMENTATION + DEPLOYMENT

### ✅ BEFORE STARTING WEEK 2
- [ ] Create GitHub releases page
- [ ] Create deployment checklist
- [ ] Set up monitoring dashboard (if available)

---

## 📆 MONDAY - Deployment Infrastructure

**Goal:** Set up Git workflow, CI/CD pipeline basics

**Morning (2 hours)**
- [ ] Create GitHub branch protection rules
  ```
  main branch:
  - Require PR review before merge
  - Require status checks to pass
  - Require up-to-date PR
  ```

- [ ] Create CI/CD workflow file (`.github/workflows/test.yml`)
  ```yaml
  name: Test & Build
  on: [push, pull_request]
  
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - uses: actions/setup-node@v2
        - run: npm install
        - run: npm run type-check
        - run: npm run test
        - run: npm run build
  ```

- [ ] Test workflow
  - Make a commit
  - Create a PR
  - Watch workflow run
  - Tests pass before merge

**Afternoon (1 hour)**
- [ ] Set up deployment checklist
  - Backend: All tests passing
  - Frontend: All components done
  - Database: Snapshots latest
  - Documentation: Complete
  - Monitoring: Alerts configured

- [ ] Create README with setup instructions
- [ ] Document environment variables

**Done Checklist**
- [ ] Branch protection active
- [ ] CI/CD workflow working
- [ ] Tests run on every PR
- [ ] Deployment steps documented

---

## 📆 TUESDAY - Monitoring & Alerts

**Goal:** Set up system monitoring

**Morning (2 hours)**
- [ ] Set up database health checks
  ```sql
  -- Check balance non-negative
  SELECT COUNT(*) as violations
  FROM account_profiles
  WHERE balance < 0;
  
  -- Check invariant violations
  SELECT COUNT(*) as violations
  FROM account_profiles
  WHERE ABS(equity - (balance + bonus + unrealized_pnl)) > 0.01;
  ```

- [ ] Create monitoring dashboard
  - Account creation rate (per hour)
  - Active users count
  - Average margin level
  - Liquidation events
  - API response times
  - Error rate

- [ ] Set up alerts
  ```
  CRITICAL (page immediately):
  - Negative balance detected
  - Invariant violation
  - All tests failing
  
  HIGH (within 1 hour):
  - Error rate > 5%
  - Response time > 2 seconds
  - Liquidation spike
  
  MEDIUM (daily summary):
  - Performance metrics
  - Usage statistics
  ```

**Afternoon (1 hour)**
- [ ] Create runbook for common issues
- [ ] Document escalation procedure
- [ ] Set up on-call rotation (if multi-person team)

**Done Checklist**
- [ ] Health checks implemented
- [ ] Dashboard working
- [ ] Alerts configured
- [ ] Runbooks written

---

## 📆 WEDNESDAY - Final QA + Documentation

**Goal:** Run comprehensive QA, finalize docs

**Morning (2 hours) - QA Execution**
- [ ] Run full E2E test suite against production-like environment
- [ ] Manual regression testing
  - Create account → all components work
  - Add funds → balance updates
  - Open 3 positions → margin level correct
  - Close positions → liquidation doesn't trigger

- [ ] Performance testing
  - Page load time < 2 seconds
  - Chart updates smooth (60 FPS)
  - No memory leaks
  - Database queries < 100ms

- [ ] Security testing
  - User A can't see User B's positions
  - Can't bypass authentication
  - Can't inject SQL
  - Passwords properly hashed

**Afternoon (2 hours) - Documentation Finalization**
- [ ] Update README with:
  - How to set up locally
  - How to run tests
  - How to deploy
  - Common troubleshooting

- [ ] Create DEPLOYMENT.md with:
  - Step-by-step deployment process
  - Rollback procedure
  - Data backup procedure
  - Post-deployment verification

- [ ] Create TROUBLESHOOTING.md with:
  - Common errors and fixes
  - Performance issues
  - Data consistency issues
  - How to contact support

**Done Checklist**
- [ ] All QA tests pass
- [ ] Performance meets targets
- [ ] Security verified
- [ ] Documentation complete

---

## 📆 THURSDAY - Staging Test + Dry Run

**Goal:** Complete run-through of launch process

**Morning (2 hours)**
- [ ] Deploy to staging environment
  - Follow deployment checklist
  - Run post-deployment tests
  - Verify all components working
  - Check performance metrics

- [ ] Run through user scenarios
  1. New user signup
  2. Complete KYC (if applicable)
  3. Add funds to account
  4. Open position
  5. Check position details
  6. Modify stop loss
  7. Close position
  8. View closed positions
  9. Check account history

- [ ] Test on all supported browsers
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Mobile Safari (iOS)
  - Chrome Mobile (Android)

**Afternoon (1 hour)**
- [ ] Create launch day checklist
  - All systems check
  - Team member assignments
  - Communication plan
  - Rollback procedure
  - Customer support briefing

- [ ] Brief customer support team
  - How to create test accounts
  - Common issues and fixes
  - Escalation procedure
  - SLA targets

**Done Checklist**
- [ ] Staging fully tested
- [ ] All user scenarios work
- [ ] Browser compatibility verified
- [ ] Launch checklist finalized
- [ ] Team ready

---

## 📆 FRIDAY - Launch Day!

**Goal:** Deploy to production and monitor

**Pre-Launch (Before 9 AM)**
- [ ] All team members online
- [ ] Database backups done
- [ ] Monitoring dashboard open
- [ ] Customer support briefed
- [ ] Rollback plan reviewed
- [ ] Stakeholders notified

**Launch Process (Morning)**
- [ ] 9:00 AM: Final status check
  ```bash
  npm run test:coverage  # All tests pass
  npm run type-check     # No TypeScript errors
  npm run build          # Build succeeds
  ```

- [ ] 9:15 AM: Deploy to production
  - Merge final PRs to main
  - Run deployment script
  - Wait for deployment complete (< 5 min)
  - Monitoring shows green

- [ ] 9:30 AM: Post-deployment verification
  - Page loads
  - User can sign up
  - Can create account
  - Can open position
  - API endpoints respond
  - Database healthy

- [ ] 9:45 AM: Announce launch
  - Email team: "We're live!"
  - Social media post
  - Status page updated
  - Demo account set up

**Post-Launch (Day 1)**
- [ ] Monitor dashboard hourly
  - Error rate < 1%
  - Response times normal
  - No database errors
  - User growth visible

- [ ] Beta user access
  - Email link to first beta users (if not open)
  - Watch for support requests
  - Respond quickly to issues
  - Track user feedback

- [ ] On-call team
  - Available on Slack
  - Respond to issues < 15 min
  - Document any problems
  - Fix and redeploy if needed

**Post-Launch (Day 2-7)**
- [ ] Monitor system closely
- [ ] Fix any critical issues immediately
- [ ] Collect user feedback
- [ ] Plan improvements based on feedback
- [ ] Scale infrastructure if needed

**Launch Checklist**
- [ ] Deployed to production: ✅
- [ ] All systems green: ✅
- [ ] Users can sign up: ✅
- [ ] Users can trade: ✅
- [ ] Monitoring active: ✅
- [ ] Team on-call ready: ✅
- [ ] Customer support ready: ✅

---

## 📊 SUCCESS CRITERIA BY END OF PHASE 2

### Technical
- [ ] All 4 main components complete and working
- [ ] E2E tests passing against production
- [ ] No known critical bugs
- [ ] Performance meets targets
- [ ] Security verified
- [ ] Documentation complete

### Operations
- [ ] CI/CD pipeline running
- [ ] Monitoring and alerts configured
- [ ] Deployment procedure documented
- [ ] Team trained on procedures
- [ ] Runbooks created

### Quality
- [ ] All components responsive (mobile-friendly)
- [ ] Error messages helpful
- [ ] Calculations verified
- [ ] User scenarios tested
- [ ] Edge cases handled

### Launch Readiness
- [ ] Legal documents integrated
- [ ] Privacy policy accepted
- [ ] Risk disclosure accepted
- [ ] Age verification in place
- [ ] Support team briefed
- [ ] Marketing plan ready

---

## 🎊 LAUNCH CELEBRATION

After hitting "Deploy" on Friday and systems are stable:

- [x] Team standup: "We did it!"
- [ ] Document lessons learned
- [ ] Plan Phase 3 features
- [ ] Send thank you emails
- [ ] Schedule retro meeting
- [ ] Deploy to production party 🎉

---

## 📞 DAILY RITUAL

Each day 9:00 AM standup:
- What did we complete yesterday?
- What are we doing today?
- Any blockers?
- Any risks?
- How are we tracking vs. schedule?

Each day 5:00 PM:
- Review today's commits
- Check all tests passing
- Update tracking board
- Note blockers for next day

---

## 🚨 IF SOMETHING GOES WRONG

**Minor Issue (Feature not working)**
- Document in GitHub issue
- Create branch to fix
- PR review
- Merge and test
- Close issue

**Major Issue (System down)**
- Rollback to last known good
- Post-mortem after restart
- Fix root cause
- Re-deploy
- Monitor closely

**Critical Issue (Data loss)**
- Stop all operations
- Restore from backup
- Investigate root cause
- Implement fix
- Verify data integrity
- Resume operations

---

## 🎯 2-WEEK COUNTDOWN

```
Week 1 Complete
└─ Legal docs integrated
└─ 4 components built
└─ E2E tests written

Week 2 Complete
└─ Deployment automated
└─ Monitoring active
└─ Team trained
└─ Systems launched

🚀 MVP LIVE 🚀
```

---

**Print This Document**  
**Post in Team Chat/Slack**  
**Reference Daily**  
**Check Off Completed Items**  
**Celebrate Friday Deployment**

---

**Phase 2 Daily Execution Checklist**  
**CFD Trading Platform**  
**February 13 - February 27, 2026**
