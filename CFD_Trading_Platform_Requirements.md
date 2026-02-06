# CFD Trading Platform - MVP Requirements Document
**Version:** 1.0  
**Date:** February 4, 2026  
**Project Type:** Paper Trading Platform (Demo/Simulated Trading)  
**Target Market:** Asia  
**Budget:** Zero-cost MVP with free-tier services

---

## 1. EXECUTIVE SUMMARY

### 1.1 Project Overview
A web-based CFD (Contract for Difference) trading platform offering paper trading across 5 asset classes with 70 total instruments. Users trade with virtual funds managed by administrators through a dedicated admin panel. The platform simulates real trading conditions using real-time market data.

### 1.2 Core Value Proposition
- Risk-free trading environment for skill development
- Real-time market data across multiple asset classes
- Admin-controlled fund management
- Full KYC compliance workflow
- Multi-language support

### 1.3 MVP Scope
**In Scope:**
- User registration with multi-step onboarding
- KYC document upload and admin verification
- Paper trading with virtual funds
- Real-time price feeds (AlphaVantage + yFinance scraping)
- Admin panel for user and trade management
- Social authentication (Google, Apple)

**Out of Scope (Post-MVP):**
- Real money deposits/withdrawals
- Payment gateway integration
- Live chat support
- Mobile native apps (web-responsive only)
- Automated trading/bots
- Social trading features

---

## 2. ASSET CLASSES & INSTRUMENTS

### 2.1 Supported Instruments (Total: 70)

#### 2.1.1 Forex Pairs (15 pairs)
**Major Pairs:**
1. EUR/USD (Euro/US Dollar)
2. GBP/USD (British Pound/US Dollar)
3. USD/JPY (US Dollar/Japanese Yen)
4. USD/CHF (US Dollar/Swiss Franc)
5. AUD/USD (Australian Dollar/US Dollar)
6. USD/CAD (US Dollar/Canadian Dollar)
7. NZD/USD (New Zealand Dollar/US Dollar)

**Cross Pairs:**
8. EUR/GBP (Euro/British Pound)
9. EUR/JPY (Euro/Japanese Yen)
10. GBP/JPY (British Pound/Japanese Yen)
11. AUD/JPY (Australian Dollar/Japanese Yen)
12. EUR/AUD (Euro/Australian Dollar)
13. GBP/AUD (British Pound/Australian Dollar)
14. CHF/JPY (Swiss Franc/Japanese Yen)
15. EUR/CHF (Euro/Swiss Franc)

**Leverage:** Up to 1:500

#### 2.1.2 Commodities (10 instruments)
1. Gold (XAU/USD)
2. Silver (XAG/USD)
3. Crude Oil (WTI)
4. Brent Oil
5. Natural Gas
6. Copper
7. Platinum
8. Palladium
9. Corn
10. Wheat

**Leverage:** Up to 1:100 (varies by commodity)

#### 2.1.3 Indices (5 instruments)
1. S&P 500 (US500)
2. NASDAQ 100 (NAS100)
3. Dow Jones (US30)
4. FTSE 100 (UK100)
5. Nikkei 225 (JP225)

**Leverage:** Up to 1:200

#### 2.1.4 Cryptocurrencies (20 instruments)
1. BTC/USD (Bitcoin)
2. ETH/USD (Ethereum)
3. BNB/USD (Binance Coin)
4. XRP/USD (Ripple)
5. ADA/USD (Cardano)
6. SOL/USD (Solana)
7. DOGE/USD (Dogecoin)
8. DOT/USD (Polkadot)
9. MATIC/USD (Polygon)
10. LTC/USD (Litecoin)
11. AVAX/USD (Avalanche)
12. LINK/USD (Chainlink)
13. UNI/USD (Uniswap)
14. ATOM/USD (Cosmos)
15. XLM/USD (Stellar)
16. ALGO/USD (Algorand)
17. VET/USD (VeChain)
18. ICP/USD (Internet Computer)
19. FIL/USD (Filecoin)
20. SAND/USD (The Sandbox)

**Leverage:** Up to 1:50

#### 2.1.5 Stocks (20 instruments)
**US Tech Giants:**
1. AAPL (Apple Inc.)
2. MSFT (Microsoft)
3. GOOGL (Alphabet/Google)
4. AMZN (Amazon)
5. META (Meta/Facebook)
6. TSLA (Tesla)
7. NVDA (NVIDIA)
8. NFLX (Netflix)

**US Financial & Others:**
9. JPM (JPMorgan Chase)
10. BAC (Bank of America)
11. WMT (Walmart)
12. JNJ (Johnson & Johnson)
13. V (Visa)
14. PG (Procter & Gamble)
15. DIS (Disney)

**International:**
16. BABA (Alibaba)
17. TSM (Taiwan Semiconductor)
18. NVO (Novo Nordisk)
19. TM (Toyota)
20. ASML (ASML Holding)

**Leverage:** Up to 1:20

### 2.2 Leverage Structure by Asset Class

| Asset Class | Maximum Leverage | Notes |
|-------------|------------------|-------|
| Forex (Majors) | 1:500 | EUR/USD, GBP/USD, USD/JPY, etc. |
| Forex (Crosses) | 1:400 | EUR/GBP, GBP/JPY, etc. |
| Commodities (Metals) | 1:100 | Gold, Silver, Platinum, Palladium |
| Commodities (Energy) | 1:50 | Oil, Natural Gas |
| Commodities (Agricultural) | 1:50 | Corn, Wheat |
| Indices | 1:200 | All indices |
| Cryptocurrencies | 1:50 | All crypto pairs |
| Stocks | 1:20 | All stocks |

**Margin Requirements:**
- Margin Required = (Trade Size × Current Price) / Leverage
- Example: $10,000 trade on EUR/USD at 1:500 leverage = $20 margin required

---

## 3. TRADING MECHANICS

### 3.1 Order Types

#### 3.1.1 Market Order
- Executes immediately at current market price
- No price specification required
- Subject to slippage simulation (±0.1% for realism)

#### 3.1.2 Limit Order
- Buy Limit: Execute when price drops to specified level
- Sell Limit: Execute when price rises to specified level
- Remains pending until price reaches target or user cancels

#### 3.1.3 Stop Loss (SL)
- Automatically closes position when price moves against user
- Mandatory risk management tool
- Can be set as absolute price or points/pips from entry

#### 3.1.4 Take Profit (TP)
- Automatically closes position when target profit reached
- Can be set as absolute price or points/pips from entry
- Optional but recommended

### 3.2 Position Sizing

#### 3.2.1 Lot Sizes (Forex Standard)
- **Standard Lot:** 100,000 units of base currency
- **Mini Lot:** 10,000 units
- **Micro Lot:** 1,000 units
- **Nano Lot:** 100 units
- Minimum trade size: 0.01 lots (Micro lot)

#### 3.2.2 Asset-Specific Position Sizes

**Commodities:**
- Gold/Silver: Minimum 0.01 oz
- Oil: Minimum 0.1 barrels
- Others: Standard commodity contract sizes

**Indices:**
- Minimum: $1 per point
- Standard: $10 per point
- Maximum: $100 per point

**Cryptocurrencies:**
- Bitcoin: Minimum 0.001 BTC
- Ethereum: Minimum 0.01 ETH
- Altcoins: Minimum $10 equivalent

**Stocks:**
- Minimum: 0.1 shares (fractional)
- Standard: 1 share
- Maximum: Per position limit rules

### 3.3 Position Limits

#### 3.3.1 Maximum Position Sizes (Industry Standard)
Based on account balance and asset class:

**By Account Balance:**
- Balance < $1,000: Max 5 lots total exposure (Forex)
- Balance $1,000-$5,000: Max 20 lots
- Balance $5,000-$10,000: Max 50 lots
- Balance > $10,000: Max 100 lots

**By Asset Class (Maximum Single Position):**
- Forex: 50 standard lots per pair
- Commodities: $500,000 notional value
- Indices: $250,000 notional value
- Cryptocurrencies: $100,000 notional value
- Stocks: $200,000 notional value

**Maximum Open Positions:**
- Total open positions across all assets: 100 positions
- Per asset class: 30 positions

#### 3.3.2 Risk Management Rules
- Maximum margin utilization: 80% of account balance
- Margin call trigger: 50% margin level
- Stop out level: 20% margin level (auto-close positions)

### 3.4 Trading Hours

**Forex:** 24/5 (Monday 00:00 - Friday 23:59 UTC)  
**Commodities:** Varies by instrument (typically 23/5)  
**Indices:** Follows underlying exchange hours + extended hours  
**Cryptocurrencies:** 24/7  
**Stocks:** Follows respective exchange hours (e.g., NYSE 14:30-21:00 UTC)

**Note:** Display trading hours in user's local timezone with clear market open/close indicators.

---

## 4. MARKET DATA INTEGRATION

### 4.1 Data Sources

#### 4.1.1 Primary Source: AlphaVantage (Free Tier)
**Coverage:**
- Forex: Real-time quotes, 5 requests/minute limit
- Stocks: Real-time US stocks
- Cryptocurrencies: Real-time crypto prices

**Limitations:**
- 25 API calls per day (free tier)
- Rate limited to 5 requests/minute

**Implementation Strategy:**
- Cache prices for 1-2 seconds to reduce API calls
- Use websockets for price updates when available
- Fallback to yFinance if quota exceeded

#### 4.1.2 Secondary Source: yFinance (Web Scraping)
**Coverage:**
- All stocks
- Major forex pairs
- Commodities
- Indices
- Cryptocurrencies

**Implementation:**
- Python backend scraper
- Update frequency: Every 5 seconds for active trades
- Every 30 seconds for watchlist items
- Store historical data in database for charts

**Scraping Strategy:**
- Use rotating user agents to avoid detection
- Implement exponential backoff on failures
- Cache aggressively to minimize requests

### 4.2 Data Update Frequency

**Real-time Updates (WebSocket or Polling):**
- Active positions: 1-second updates
- Watchlist: 5-second updates
- Market overview: 10-second updates

**Historical Data:**
- 1-minute candles: Store last 24 hours
- 5-minute candles: Store last 7 days
- 1-hour candles: Store last 30 days
- Daily candles: Store last 365 days

### 4.3 Data Structure

```javascript
// Real-time Price Object
{
  "symbol": "EUR/USD",
  "assetClass": "forex",
  "bid": 1.08453,
  "ask": 1.08456,
  "spread": 0.00003,
  "timestamp": "2026-02-04T10:30:15Z",
  "change24h": 0.25,
  "changePercent24h": 0.23,
  "volume24h": 125000000,
  "high24h": 1.08520,
  "low24h": 1.08380
}
```

### 4.4 Fallback & Error Handling

**If Primary Source Fails:**
1. Switch to yFinance immediately
2. Display warning banner: "Using backup data source"
3. Log error for admin review

**If Both Sources Fail:**
1. Use last known price with timestamp
2. Display: "Prices delayed - Last updated: [time]"
3. Disable new trade execution
4. Allow closing existing positions at last known price

---

## 5. USER MANAGEMENT

### 5.1 Account Structure

#### 5.1.1 Single Account Type
- **Name:** Standard Paper Trading Account
- **Starting Balance:** $0 (admin must fund)
- **Currency:** USD (primary), multi-currency support for display
- **Account Components:**
  - **Balance:** Actual trading funds (withdrawable in real platform)
  - **Bonus:** Non-withdrawable promotional funds (can be used for trading)
  - **Equity:** Balance + Unrealized P&L
  - **Free Margin:** Available funds for new trades
  - **Margin Level:** (Equity / Margin Used) × 100%

#### 5.1.2 Account Limitations
- Maximum 1 account per email address
- Maximum 1 account per phone number
- Account must be KYC verified to trade

### 5.2 User Registration Flow

#### 5.2.1 Multi-Step Registration Process

**STEP 1: Personal Information**
```
Fields (All Required):
- First Name (2-50 characters, alphabets only)
- Last Name (2-50 characters, alphabets only)
- Email Address (valid format, unique)
- Contact Number (international format with country code)
- City (dropdown or autocomplete)
- Country (dropdown, pre-selected based on IP)
- Preferred Language (English, Chinese, Malay, Thai, Vietnamese, Indonesian, Japanese)

Validation:
- Email: Must be unique, valid format
- Phone: Must be unique, valid international format
- All fields mandatory

Button: "Next Step" (disabled until all valid)
```

**STEP 2: Trading Experience & Goals**

```
Question 1: "What is your trading experience level?"
Options (Radio buttons):
○ Beginner (Never traded before)
○ Intermediate (Less than 1 year experience)
○ Trader (1-3 years experience)
○ Experienced (3+ years experience)

--- Conditional Fields Based on Selection ---

IF "Beginner" selected:
  Question 2: "What is your primary goal?"
  Options (Checkboxes, multi-select):
  □ Learning to trade
  □ Testing strategies
  □ Understanding markets
  □ Exploring investment options
  
  Question 3: "How much time can you dedicate weekly?"
  Options (Dropdown):
  - Less than 5 hours
  - 5-10 hours
  - 10-20 hours
  - More than 20 hours
  
  Question 4: "What is your investment capacity?"
  Options (Radio):
  ○ Under $1,000
  ○ $1,000 - $5,000
  ○ $5,000 - $10,000
  ○ $10,000+
  ○ Prefer not to say

IF "Intermediate" selected:
  Question 2: "What is your primary goal?"
  Options (Checkboxes):
  □ Improving trading skills
  □ Testing new strategies
  □ Portfolio diversification
  □ Learning advanced techniques
  
  Question 3: "What is your typical trading frequency?"
  Options (Radio):
  ○ Daily
  ○ Weekly
  ○ Monthly
  ○ Occasionally
  
  Question 4: "How much time can you dedicate weekly?"
  [Same as Beginner]
  
  Question 5: "What is your investment capacity?"
  [Same as Beginner]

IF "Trader" selected:
  Question 2: "What is your primary goal?"
  Options (Checkboxes):
  □ Refining strategies
  □ Loss recovery
  □ Scaling up trading
  □ Testing new markets/assets
  
  Question 3: "Have you experienced losses in trading?"
  Options (Radio):
  ○ Yes
  ○ No
  
  [IF "Yes" selected, show additional field:]
  "Approximate loss amount (optional)"
  Input: Currency field (USD)
  
  Question 4: "What is your typical trading frequency?"
  [Same as Intermediate]
  
  Question 5: "How much time can you dedicate weekly?"
  [Same as Beginner]
  
  Question 6: "What is your investment capacity?"
  [Same as Beginner]

IF "Experienced" (bad experience) selected:
  Question 2: "What is your primary goal?"
  Options (Checkboxes):
  □ Loss recovery
  □ Strategy reassessment
  □ Risk management improvement
  □ Starting fresh
  □ Learning from mistakes
  
  Question 3: "Have you experienced significant losses?"
  Options (Radio):
  ○ Yes (Required for this selection)
  ○ No
  
  [IF "Yes":]
  "Approximate loss amount (optional)"
  Input: Currency field (USD)
  
  "What went wrong? (optional)"
  Textarea: Max 500 characters
  
  Question 4: "How much time can you dedicate weekly?"
  [Same as Beginner]
  
  Question 5: "What is your investment capacity?"
  [Same as Beginner]
  
  Question 6: "Are you interested in educational resources?"
  Options (Radio):
  ○ Yes, very interested
  ○ Maybe
  ○ No

Button: "Next Step"
```

**STEP 3: Account Security & Verification**

```
Fields:
- Date of Birth (Date picker, must be 18+ years old)
  Validation: User must be at least 18 years old

Checkboxes (All Required):
☑ I accept the Terms & Conditions (clickable link to T&C)
☑ I accept the Privacy Policy (clickable link to policy)
☑ I accept the Risk Disclosure Agreement (clickable link)
☑ I confirm I am at least 18 years old

Optional:
☐ I want to receive marketing emails and promotions

Button: "Create Account"
```

#### 5.2.2 Social Authentication

**Supported Providers:**
1. **Google OAuth 2.0**
   - Retrieve: Email, First Name, Last Name, Profile Picture
   - Auto-fill Step 1 fields
   - User completes Steps 2 & 3

2. **Apple Sign-In**
   - Retrieve: Email (may be private relay), First Name, Last Name
   - Auto-fill Step 1 fields
   - User completes Steps 2 & 3

**Implementation Notes:**
- Social login users still go through full multi-step registration
- Social auth only pre-fills personal info (Step 1)
- Email from social provider must be unique in system
- Link social account to user record for future logins

#### 5.2.3 Post-Registration Flow

```
1. Account Created Successfully
   ↓
2. Auto-login user
   ↓
3. Redirect to Dashboard
   ↓
4. Show Welcome Modal:
   ---------------------------------
   |  🎉 Welcome to [Platform Name]!  |
   |                                 |
   |  Your account has been created  |
   |  successfully.                  |
   |                                 |
   |  [Button: Get Started]          |
   ---------------------------------
   ↓
5. After closing modal, show KYC Banner
   (See Section 5.3)
```

### 5.3 KYC (Know Your Customer) Verification

#### 5.3.1 KYC Requirement
- **Mandatory:** Users CANNOT execute trades without KYC approval
- **Allowed without KYC:** View markets, access educational content, browse platform
- **Blocked without KYC:** Open positions, place orders, request withdrawals (future)

#### 5.3.2 KYC Banner Display

**Location:** Below header/navigation, above main dashboard content

**Design:**
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  One Last Step Before Trading                        │
│                                                         │
│ Complete your KYC verification to start trading        │
│                                                         │
│ [Upload KYC Documents] →                               │
└─────────────────────────────────────────────────────────┘
```

**Behavior:**
- Appears on every page until KYC submitted
- Dismissible but reappears on next login
- Changes to "KYC Under Review" after submission
- Disappears completely after approval

#### 5.3.3 KYC Document Upload Process

**STEP 1: Document Selection**
```
Required Documents (Both Mandatory):

1. Proof of Identity (Choose one):
   ○ National ID Card (Front & Back)
   ○ Passport (Photo page)
   ○ Driver's License (Front & Back)

2. Proof of Address (Choose one):
   ○ Utility Bill (Electricity, Water, Gas - Max 3 months old)
   ○ Bank Statement (Max 3 months old)
   ○ Government-issued document with address
   ○ Rental Agreement

Requirements:
- File formats: JPG, PNG, PDF
- Maximum file size: 5MB per document
- Documents must be clear and readable
- All four corners visible
- No black and white copies (color scans/photos only)

Upload Interface:
[Drag & Drop Zone]
or
[Browse Files]

Preview uploaded files before submission
Allow delete/replace uploaded files
```

**STEP 2: Document Verification Checklist (User Self-Check)**
```
Before submitting, confirm:
☑ Documents are clear and legible
☑ All text is readable
☑ Documents are valid (not expired)
☑ Address matches registration address
☑ Name matches registration name
☑ Documents are in color

[Submit for Verification]
```

**STEP 3: Submission Confirmation**
```
Documents Submitted Successfully! ✓

Your KYC documents have been sent for verification.

⏱️ Typical verification time: 24-48 hours

You will be notified via:
- Email
- Dashboard notification
- SMS (if enabled)

[Return to Dashboard]
```

#### 5.3.4 KYC Admin Review Panel

**Admin Panel Section: KYC Verification Queue**

**Queue View:**
```
┌─────────────────────────────────────────────────────────┐
│ KYC Verification Queue                    [Filters ▼]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Status: [All ▼] [Pending ▼] [Approved ▼] [Rejected ▼] │
│ Date Range: [Last 7 days ▼]                            │
│ Search: [___________________________] 🔍               │
│                                                         │
├────┬────────────────┬──────────────┬─────────┬─────────┤
│ ID │ Name           │ Submitted    │ Status  │ Action  │
├────┼────────────────┼──────────────┼─────────┼─────────┤
│ 1  │ John Doe       │ 2h ago       │ Pending │ [Review]│
│ 2  │ Jane Smith     │ 5h ago       │ Pending │ [Review]│
│ 3  │ Mike Johnson   │ 1d ago       │ Approved│ [View]  │
└────┴────────────────┴──────────────┴─────────┴─────────┘
```

**Individual Review Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ KYC Review: John Doe (ID: 001234)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Personal Information:                                   │
│ • Name: John Doe                                        │
│ • Email: john.doe@email.com                             │
│ • Phone: +65 9123 4567                                  │
│ • Address: 123 Main St, Singapore                       │
│ • Date of Birth: 1990-05-15 (35 years old)             │
│ • Registration Date: 2026-02-04                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Document 1: Proof of Identity                           │
│ Type: National ID Card                                  │
│                                                         │
│ [Front Image]          [Back Image]                     │
│ ┌────────────────┐    ┌────────────────┐              │
│ │                │    │                │              │
│ │  [ID Front]    │    │  [ID Back]     │              │
│ │                │    │                │              │
│ └────────────────┘    └────────────────┘              │
│                                                         │
│ [🔍 Zoom] [↻ Rotate] [⬇️ Download]                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Document 2: Proof of Address                            │
│ Type: Utility Bill                                      │
│                                                         │
│ [Document Image]                                        │
│ ┌─────────────────────────────┐                        │
│ │                             │                        │
│ │  [Utility Bill Image]       │                        │
│ │                             │                        │
│ └─────────────────────────────┘                        │
│                                                         │
│ [🔍 Zoom] [↻ Rotate] [⬇️ Download]                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Verification Checklist:                                 │
│ ☐ Name matches registration                             │
│ ☐ Address matches registration                          │
│ ☐ Documents are clear and readable                      │
│ ☐ Documents are valid (not expired)                     │
│ ☐ Documents are in color                                │
│ ☐ All corners visible                                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Admin Decision:                                         │
│                                                         │
│ ○ Approve KYC                                           │
│ ○ Reject KYC                                            │
│                                                         │
│ Comment/Reason (Required if rejecting):                 │
│ ┌───────────────────────────────────────────────────┐  │
│ │                                                   │  │
│ │ [Text area for admin comments]                    │  │
│ │                                                   │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ [Cancel]                      [Submit Decision]         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Admin Actions:**
1. **Approve:**
   - Mark KYC status as "Approved"
   - Enable trading for user
   - Send approval email/notification to user
   - Optional: Add congratulatory comment

2. **Reject:**
   - Mark KYC status as "Rejected"
   - MUST provide reason/comment (mandatory field)
   - Send rejection email with instructions
   - User can re-upload documents

**Rejection Comment Examples:**
- "ID document is blurry. Please upload a clearer image."
- "Proof of address is older than 3 months. Please provide a recent document."
- "Name on ID does not match registration name."
- "Address on utility bill does not match registration address."

#### 5.3.5 User-Side KYC Status Display

**Status States:**

**1. Not Submitted:**
```
Dashboard Banner:
⚠️ One Last Step Before Trading
Complete your KYC verification to start trading
[Upload KYC Documents] →
```

**2. Under Review:**
```
Dashboard Banner:
⏳ KYC Verification In Progress
Your documents are being reviewed. This typically takes 24-48 hours.
Submitted: 2 hours ago
```

**3. Approved:**
```
Dashboard Banner (shows for 7 days then auto-hides):
✅ KYC Approved - You can now start trading!
[Start Trading] →

No banner after 7 days (profile shows verified badge)
```

**4. Rejected:**
```
Dashboard Banner:
❌ KYC Verification Failed

Reason: ID document is blurry. Please upload a clearer image.

[Upload New Documents] →
```

**Real-Time Notifications:**
- **Email:** Sent immediately on approval/rejection
- **Dashboard Notification:** Bell icon with red dot
- **In-App Toast:** Popup notification if user is online when admin takes action

#### 5.3.6 KYC Data Storage & Security

**Database Schema:**
```javascript
KYC_Documents {
  id: UUID,
  user_id: UUID (foreign key),
  identity_document_type: ENUM('national_id', 'passport', 'drivers_license'),
  identity_front_url: STRING (encrypted S3/storage path),
  identity_back_url: STRING (encrypted S3/storage path),
  address_document_type: ENUM('utility_bill', 'bank_statement', 'govt_doc', 'rental_agreement'),
  address_document_url: STRING (encrypted S3/storage path),
  status: ENUM('pending', 'approved', 'rejected'),
  submitted_at: TIMESTAMP,
  reviewed_at: TIMESTAMP,
  reviewed_by: UUID (admin user ID),
  admin_comment: TEXT,
  rejection_reason: TEXT,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

**Security Requirements:**
- Store documents in encrypted cloud storage (AWS S3 with encryption or equivalent)
- Access logs for all document views (who accessed, when)
- Auto-delete rejected documents after 90 days
- Retention policy: Keep approved KYC docs for 7 years (regulatory requirement)
- Restrict document access to authorized admins only

---

## 6. ADMIN PANEL FEATURES

### 6.1 Admin Roles & Permissions

**Admin Levels:**
1. **Super Admin:** Full access to all features
2. **Admin:** Cannot delete users or modify other admins
3. **Support Agent:** Read-only + KYC review + user fund management

### 6.2 Fund Management

#### 6.2.1 Add/Remove Funds (Balance)

**Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ User Fund Management                                    │
├─────────────────────────────────────────────────────────┤
│ User: John Doe (ID: 001234)                             │
│ Email: john.doe@email.com                               │
│ Current Balance: $5,000.00                              │
│ Current Bonus: $500.00                                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Action:                                                 │
│ ○ Add Funds                                             │
│ ○ Remove Funds                                          │
│                                                         │
│ Amount: [____________] USD                              │
│                                                         │
│ Reason/Comment (Required):                              │
│ ┌───────────────────────────────────────────────────┐  │
│ │                                                   │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ [Cancel]              [Submit Transaction]              │
└─────────────────────────────────────────────────────────┘
```

**Validation Rules:**
- Amount must be > 0
- Cannot remove more funds than current balance
- Cannot remove funds if user has open positions (must close positions first or reduce to free margin amount)
- Reason/comment mandatory for audit trail

**Transaction Log:**
- Every fund addition/removal logged with:
  - Admin user ID
  - Timestamp
  - Amount
  - Reason
  - User's balance before/after

#### 6.2.2 Add/Remove Bonus

**What is Bonus?**
- **Non-withdrawable** promotional funds
- Can be used for trading (counts toward margin)
- Cannot be withdrawn in real platform
- Lost if user loses trades, but doesn't affect main balance withdrawal

**Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ Bonus Management                                        │
├─────────────────────────────────────────────────────────┤
│ User: John Doe (ID: 001234)                             │
│ Current Bonus: $500.00                                  │
│                                                         │
│ Action:                                                 │
│ ○ Add Bonus (e.g., Welcome Bonus, Loyalty Reward)      │
│ ○ Remove Bonus (e.g., Violation, Expiry)               │
│                                                         │
│ Amount: [____________] USD                              │
│                                                         │
│ Bonus Type (if adding):                                 │
│ [Dropdown: Welcome Bonus / Deposit Match / Loyalty /   │
│  Special Promotion / Other]                             │
│                                                         │
│ Reason/Comment (Required):                              │
│ ┌───────────────────────────────────────────────────┐  │
│ │                                                   │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ [Cancel]              [Submit Transaction]              │
└─────────────────────────────────────────────────────────┘
```

**Common Bonus Types:**
- **Welcome Bonus:** $50-$500 on account activation
- **Deposit Bonus:** 20-100% match on deposits (future when real money added)
- **Loyalty Bonus:** Rewards for active traders
- **Promotional Bonus:** Special campaigns

**Transaction Log:**
- Separate log for bonus transactions
- Same audit requirements as balance changes

### 6.3 Trade & Position Management

#### 6.3.1 View All User Trades

**Live Trades Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ Live Trades Monitor                    [Refresh: Auto ▼]│
├─────────────────────────────────────────────────────────┤
│ Filters:                                                │
│ User: [Search...] Asset: [All ▼] Type: [All ▼]         │
│ P&L: [All ▼] [Profit Only] [Loss Only]                 │
│                                                         │
├────┬─────────┬────────┬──────┬───────┬──────┬─────┬────┤
│ ID │ User    │ Symbol │ Type │ Size  │ Entry│ P&L │Act │
├────┼─────────┼────────┼──────┼───────┼──────┼─────┼────┤
│ 1  │ J.Doe   │EUR/USD │ Buy  │ 1.5   │1.0850│+$45 │[X] │
│ 2  │ J.Smith │BTC/USD │ Sell │ 0.1   │51200 │-$120│[X] │
│ 3  │ M.Lee   │Gold    │ Buy  │ 2.0   │2045  │+$230│[X] │
└────┴─────────┴────────┴──────┴───────┴──────┴─────┴────┘

Total Open Positions: 247
Total Volume: $12,450,000
Total P&L: +$34,567
```

**[X] Action:** Manually close position (see next section)

#### 6.3.2 Manually Close User Positions

**Close Position Modal:**
```
┌─────────────────────────────────────────────────────────┐
│ Close Position #001234                                  │
├─────────────────────────────────────────────────────────┤
│ User: John Doe                                          │
│ Symbol: EUR/USD                                         │
│ Type: Buy                                               │
│ Size: 1.5 lots                                          │
│ Entry Price: 1.08500                                    │
│ Current Price: 1.08800                                  │
│ Current P&L: +$45.00                                    │
│                                                         │
│ Close At:                                               │
│ ○ Current Market Price (1.08800)                        │
│ ○ Specific Price: [_______]                             │
│                                                         │
│ Reason for Manual Close (Required):                     │
│ ┌───────────────────────────────────────────────────┐  │
│ │                                                   │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ⚠️ This action cannot be undone.                        │
│                                                         │
│ [Cancel]              [Confirm Close Position]          │
└─────────────────────────────────────────────────────────┘
```

**Use Cases for Manual Close:**
- User requests support to close position
- System error/bug requires intervention
- Risk management (preventing excessive losses)
- Suspicious trading activity

**Audit Log:**
- Record admin who closed position
- Reason provided
- Timestamp
- P&L at close
- Notification sent to user

#### 6.3.3 Trade History & Analytics

**Completed Trades View:**
```
Date Range: [Last 30 Days ▼]
Export: [CSV] [Excel] [PDF]

┌────┬─────────┬────────┬──────┬───────┬──────┬──────┬─────┬─────┐
│ ID │ User    │ Symbol │ Type │ Entry │ Exit │ Size │ P&L │ Date│
├────┼─────────┼────────┼──────┼───────┼──────┼──────┼─────┼─────┤
│ 1  │ J.Doe   │EUR/USD │ Buy  │1.0850 │1.0880│ 1.5  │+$45 │2/4  │
│ 2  │ J.Smith │BTC/USD │ Sell │51200  │51000 │ 0.1  │+$20 │2/4  │
└────┴─────────┴────────┴──────┴───────┴──────┴──────┴─────┴─────┘

Summary:
Total Trades: 1,234
Winning Trades: 678 (54.9%)
Losing Trades: 556 (45.1%)
Total Volume: $45,670,000
Total P&L: +$12,345
```

### 6.4 Leverage Management

#### 6.4.1 Adjust User Leverage Limits

**Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ Leverage Management                                     │
├─────────────────────────────────────────────────────────┤
│ User: John Doe (ID: 001234)                             │
│ Account Type: Standard                                  │
│                                                         │
│ Current Leverage Limits:                                │
│ • Forex: 1:500 (Platform Default)                       │
│ • Commodities: 1:100 (Platform Default)                 │
│ • Indices: 1:200 (Platform Default)                     │
│ • Cryptocurrencies: 1:50 (Platform Default)             │
│ • Stocks: 1:20 (Platform Default)                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Modify Leverage:                                        │
│                                                         │
│ Asset Class: [Forex ▼]                                  │
│                                                         │
│ New Leverage: [Dropdown]                                │
│ Options: 1:1, 1:5, 1:10, 1:20, 1:50, 1:100, 1:200,    │
│          1:300, 1:400, 1:500                            │
│                                                         │
│ Reason (Required):                                      │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Examples:                                         │  │
│ │ - Risk reduction request                          │  │
│ │ - Excessive loss prevention                       │  │
│ │ - User experience level                           │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ [Reset to Default]        [Apply Changes]               │
└─────────────────────────────────────────────────────────┘
```

**Impact of Leverage Change:**
- Affects new positions only
- Existing positions maintain original leverage
- User receives notification of change
- Change logged in audit trail

**Reasons for Leverage Adjustment:**
- **Reduce:** User requests, excessive losses, beginner trader
- **Increase:** Experienced trader request, VIP status

### 6.5 User Account Management

#### 6.5.1 Ban/Suspend Users

**User Action Panel:**
```
┌─────────────────────────────────────────────────────────┐
│ Account Actions: John Doe (ID: 001234)                  │
├─────────────────────────────────────────────────────────┤
│ Current Status: ✅ Active                               │
│                                                         │
│ Actions:                                                │
│ ○ Suspend Temporarily                                   │
│ ○ Ban Permanently                                       │
│ ○ Activate (if suspended/banned)                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ IF SUSPEND:                                             │
│ Duration:                                               │
│ ○ 7 days                                                │
│ ○ 30 days                                               │
│ ○ Custom: [__] days                                     │
│                                                         │
│ Reason (Required):                                      │
│ [Dropdown: Violation / Suspicious Activity / Abuse /   │
│  Payment Issue / Other]                                 │
│                                                         │
│ Details:                                                │
│ ┌───────────────────────────────────────────────────┐  │
│ │                                                   │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ☑ Close all open positions before suspension           │
│ ☑ Send notification email to user                      │
│                                                         │
│ [Cancel]              [Apply Action]                    │
└─────────────────────────────────────────────────────────┘
```

**Suspension Effects:**
- Cannot login
- All open positions auto-closed (if checkbox selected)
- Funds remain in account
- Can be reactivated by admin

**Ban Effects:**
- Permanent account deactivation
- Cannot login
- All positions closed
- Cannot create new account with same email/phone

**Notification to User:**
- Email with reason and duration (if suspension)
- Appeal process information

### 6.6 Reporting & Analytics

#### 6.6.1 Platform Analytics Dashboard

**Key Metrics:**
```
┌─────────────────────────────────────────────────────────┐
│ Platform Overview                  [Date Range: 30d ▼] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│ │ Total Users  │  │ Active Users │  │ New Users    │  │
│ │    1,234     │  │      456     │  │     89       │  │
│ │   (+12% ↑)   │  │   (+5% ↑)    │  │   (-2% ↓)    │  │
│ └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│ │ Open Trades  │  │ Total Volume │  │ Total P&L    │  │
│ │     247      │  │  $12.5M      │  │  +$34.5K     │  │
│ │   (+8% ↑)    │  │  (+15% ↑)    │  │  (+22% ↑)    │  │
│ └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Trading Activity (Last 30 Days)                         │
│ [Line Chart: Daily Trade Volume]                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Top Traded Assets                                       │
│ 1. EUR/USD - 23% of total volume                        │
│ 2. BTC/USD - 18%                                        │
│ 3. Gold - 12%                                           │
│ 4. S&P 500 - 9%                                         │
│ 5. ETH/USD - 7%                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 6.6.2 Custom Reports

**Report Generator:**
```
Report Type: [Dropdown]
- User Activity Report
- Trading Volume Report
- P&L Report
- KYC Status Report
- Fund Movement Report
- Asset Performance Report

Date Range: [From: ____] [To: ____]

Filters:
- User: [All / Specific User]
- Asset Class: [All / Forex / Commodities / etc.]
- Status: [All / Active / Suspended / Banned]

Format: [CSV] [Excel] [PDF]

[Generate Report]
```

**Automated Reports:**
- Daily summary email to admins
- Weekly performance report
- Monthly compliance report

---

## 7. TECHNICAL ARCHITECTURE (High-Level)

### 7.1 Technology Stack Recommendation (Zero Budget)

**Frontend:**
- React.js (Free)
- TailwindCSS (Free)
- Chart.js or TradingView Lightweight Charts (Free)

**Backend:**
- Node.js + Express.js (Free)
- PostgreSQL (Free tier: Supabase or Railway)
- Redis (Free tier: Upstash or Railway)

**Authentication:**
- Passport.js (Google OAuth, Apple Sign-In)
- JWT tokens

**File Storage (KYC Documents):**
- Supabase Storage (Free tier: 1GB)
- Or AWS S3 (Pay only for usage, <$1/month initially)

**Hosting:**
- Frontend: Vercel (Free tier)
- Backend: Railway.app (Free $5 credit/month) or Render (Free tier)
- Database: Supabase (Free tier) or Railway (Free tier)

**Market Data:**
- AlphaVantage (Free tier)
- yFinance (Free scraping)

### 7.2 Database Schema (Core Tables)

**Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255), -- NULL if social login
  city VARCHAR(100),
  country VARCHAR(100),
  preferred_language VARCHAR(10),
  trading_experience ENUM('beginner', 'intermediate', 'trader', 'experienced'),
  primary_goal TEXT,
  time_commitment VARCHAR(50),
  investment_capacity VARCHAR(50),
  loss_amount DECIMAL(15,2),
  date_of_birth DATE,
  kyc_status ENUM('not_submitted', 'pending', 'approved', 'rejected'),
  account_status ENUM('active', 'suspended', 'banned'),
  suspension_until TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Accounts Table:**
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  balance DECIMAL(15,2) DEFAULT 0,
  bonus DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  leverage_forex INT DEFAULT 500,
  leverage_commodities INT DEFAULT 100,
  leverage_indices INT DEFAULT 200,
  leverage_crypto INT DEFAULT 50,
  leverage_stocks INT DEFAULT 20,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Positions Table:**
```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  symbol VARCHAR(20),
  asset_class ENUM('forex', 'commodity', 'index', 'crypto', 'stock'),
  type ENUM('buy', 'sell'),
  order_type ENUM('market', 'limit'),
  size DECIMAL(15,5),
  entry_price DECIMAL(15,5),
  current_price DECIMAL(15,5),
  stop_loss DECIMAL(15,5),
  take_profit DECIMAL(15,5),
  leverage INT,
  margin_used DECIMAL(15,2),
  unrealized_pnl DECIMAL(15,2),
  status ENUM('open', 'closed'),
  opened_at TIMESTAMP,
  closed_at TIMESTAMP,
  closed_price DECIMAL(15,5),
  realized_pnl DECIMAL(15,2),
  closed_by ENUM('user', 'admin', 'stop_loss', 'take_profit', 'margin_call'),
  admin_close_reason TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**KYC Documents Table:**
(See Section 5.3.6)

**Transactions Table:**
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type ENUM('balance_add', 'balance_remove', 'bonus_add', 'bonus_remove', 'trade_profit', 'trade_loss'),
  amount DECIMAL(15,2),
  balance_before DECIMAL(15,2),
  balance_after DECIMAL(15,2),
  admin_id UUID REFERENCES admins(id), -- NULL if system transaction
  reason TEXT,
  created_at TIMESTAMP
);
```

### 7.3 API Endpoints (Core)

**Authentication:**
- POST `/api/auth/register` - Multi-step registration
- POST `/api/auth/login` - Email/password login
- POST `/api/auth/google` - Google OAuth
- POST `/api/auth/apple` - Apple Sign-In
- POST `/api/auth/logout`
- GET `/api/auth/me` - Get current user

**Trading:**
- GET `/api/instruments` - List all tradable instruments
- GET `/api/prices/:symbol` - Get real-time price
- POST `/api/orders` - Place order
- GET `/api/positions` - Get user's open positions
- PUT `/api/positions/:id/close` - Close position
- PUT `/api/positions/:id/modify` - Modify SL/TP

**Account:**
- GET `/api/account` - Get account details
- GET `/api/account/balance` - Get balance & equity
- GET `/api/account/history` - Get trade history

**KYC:**
- POST `/api/kyc/upload` - Upload KYC documents
- GET `/api/kyc/status` - Get KYC status

**Admin (Requires Auth):**
- GET `/api/admin/users` - List all users
- PUT `/api/admin/users/:id/funds` - Add/remove funds
- PUT `/api/admin/users/:id/bonus` - Add/remove bonus
- PUT `/api/admin/users/:id/leverage` - Adjust leverage
- PUT `/api/admin/users/:id/status` - Ban/suspend user
- GET `/api/admin/kyc` - KYC verification queue
- PUT `/api/admin/kyc/:id` - Approve/reject KYC
- GET `/api/admin/positions` - View all positions
- PUT `/api/admin/positions/:id/close` - Manually close position
- GET `/api/admin/reports` - Generate reports

### 7.4 Real-Time Features

**WebSocket Connections:**
- Price updates (1-second intervals for open positions)
- Account balance updates (on trade close)
- Position P&L updates (real-time)
- Admin notifications (new KYC submissions, etc.)

**Implementation:**
- Socket.io (Node.js)
- Separate rooms for each user
- Admin room for system-wide updates

---

## 8. USER INTERFACE REQUIREMENTS

### 8.1 Dashboard Layout

**Header:**
- Logo
- Navigation: Dashboard, Markets, Positions, History, Profile
- Account balance display
- Notifications icon
- Language selector
- User avatar/dropdown

**Main Dashboard:**
- Market overview widget (top movers)
- Open positions table
- Account summary (balance, equity, margin, P&L)
- Quick trade panel
- Recent trades

### 8.2 Trading Interface

**Chart Requirements:**
- TradingView-style charting
- Timeframes: 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w
- Indicators: MA, EMA, RSI, MACD, Bollinger Bands
- Drawing tools: Trendlines, horizontal lines, Fibonacci

**Order Panel:**
- Symbol selector with search
- Order type selector (Market/Limit)
- Size/lot input
- Stop Loss input
- Take Profit input
- Leverage selector
- Risk calculator (shows margin required, potential P&L)
- Buy/Sell buttons (prominent)

### 8.3 Mobile Responsiveness

**Requirements:**
- Fully responsive design
- Mobile-optimized trading interface
- Touch-friendly buttons (minimum 44x44px)
- Swipe gestures for closing positions
- Bottom navigation on mobile

---

## 9. SECURITY & COMPLIANCE

### 9.1 Security Measures

**Authentication:**
- Password hashing (bcrypt, min 10 rounds)
- JWT tokens with expiry (15min access, 7d refresh)
- Rate limiting on login (5 attempts per 15 minutes)
- 2FA optional (future enhancement)

**Data Protection:**
- HTTPS only (SSL certificate)
- KYC documents encrypted at rest
- Sensitive data encrypted in database
- GDPR compliance (user data deletion on request)

**API Security:**
- CORS configuration
- Input validation & sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention
- CSRF tokens

### 9.2 Compliance Considerations

**Risk Warnings:**
- Display prominent risk warning on registration
- Risk disclosure before first trade
- Leverage risk explanations

**Regulatory Disclaimers:**
- "Paper trading platform - no real money"
- "Trading involves significant risk of loss"
- Age restriction enforcement (18+)

**Data Retention:**
- Trade records: 7 years
- KYC documents: 7 years
- User data: Until account deletion request

---

## 10. TESTING REQUIREMENTS

### 10.1 Testing Checklist

**Functional Testing:**
- User registration flow (all paths)
- Social login integration
- KYC upload and approval workflow
- Order placement (all order types)
- Position closing (user & admin)
- Fund management (add/remove)
- Leverage adjustment
- Account suspension/ban

**Performance Testing:**
- Load test: 100 concurrent users
- Price update latency < 2 seconds
- Order execution < 1 second
- Database query optimization

**Security Testing:**
- Penetration testing (basic)
- SQL injection attempts
- XSS vulnerability checks
- Authentication bypass attempts

**Browser Compatibility:**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest version)

**Mobile Testing:**
- iOS Safari
- Android Chrome
- Responsive breakpoints: 320px, 768px, 1024px, 1440px

---

## 11. MVP LAUNCH CHECKLIST

### 11.1 Pre-Launch Requirements

**Technical:**
- ✅ All core features implemented
- ✅ Database migrations stable
- ✅ Market data feeds operational
- ✅ Admin panel functional
- ✅ Security measures in place
- ✅ Backup & recovery tested

**Content:**
- ✅ Terms & Conditions finalized
- ✅ Privacy Policy finalized
- ✅ Risk Disclosure Agreement finalized
- ✅ Help/FAQ section
- ✅ Educational resources (optional but recommended)

**Legal:**
- ✅ Confirm paper trading legal status in target countries
- ✅ Ensure no real money handling (to avoid broker licensing)
- ✅ Age verification compliance

**Marketing:**
- ✅ Landing page ready
- ✅ Social media accounts created
- ✅ Launch announcement prepared

### 11.2 Post-Launch Monitoring

**Metrics to Track:**
- User registrations (daily)
- KYC submission rate
- KYC approval time
- Active traders (daily/weekly)
- Trade volume
- Average position size
- Most traded instruments
- User retention (D7, D30)
- Server uptime
- API error rates
- Page load times

**Support:**
- Email support system
- Admin dashboard for user issues
- Bug reporting mechanism

---

## 12. FUTURE ENHANCEMENTS (Post-MVP)

### 12.1 Phase 2 Features

**Real Money Integration:**
- Payment gateway (Stripe, PayPal)
- Bank wire transfers
- Cryptocurrency deposits
- Withdrawal system
- Broker licensing (massive undertaking)

**Advanced Trading:**
- Pending orders (Buy Stop, Sell Stop, Buy Limit, Sell Limit)
- Trailing Stop Loss
- OCO (One-Cancels-Other) orders
- Hedging support

**Social Features:**
- Copy trading
- Leaderboards
- Trading signals
- Community chat

**Mobile Apps:**
- iOS native app
- Android native app

**Education:**
- Video tutorials
- Interactive courses
- Trading academy
- Webinars

**Analytics:**
- Advanced portfolio analytics
- Risk assessment tools
- AI-powered trade suggestions (future AI integration)

---

## 13. GLOSSARY

**CFD (Contract for Difference):** A financial derivative allowing traders to speculate on price movements without owning the underlying asset.

**Leverage:** Borrowed capital to increase potential returns (and losses). 1:100 leverage means $1 can control $100 worth of assets.

**Margin:** Collateral required to open leveraged positions.

**Pip:** Smallest price move in forex (typically 0.0001 for most pairs).

**Spread:** Difference between bid and ask price.

**Stop Loss (SL):** Order to close position at specified loss level.

**Take Profit (TP):** Order to close position at specified profit level.

**Paper Trading:** Simulated trading with virtual money.

**KYC (Know Your Customer):** Identity verification process.

**Equity:** Account balance + unrealized P&L.

**Free Margin:** Funds available for new trades.

**Margin Level:** (Equity / Margin Used) × 100%.

**Margin Call:** Warning when margin level falls below threshold.

**Stop Out:** Automatic position closure when margin level critically low.

---

## 14. DOCUMENT CHANGE LOG

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-04 | Initial requirements document | Claude AI |

---

**END OF REQUIREMENTS DOCUMENT**

---

## NEXT STEPS FOR DEVELOPMENT

With this Requirements Document complete, you now need:

1. **Technical Architecture Document** - Detailed system design, database schemas, API specs
2. **UI/UX Wireframes** - Screen-by-screen mockups
3. **Database Schema Document** - Complete table structures with relationships
4. **API Specification Document** - All endpoints with request/response examples
5. **Development Roadmap** - Sprint planning, task breakdown

Would you like me to create the **Technical Architecture Document** next, or would you prefer to start with **UI/UX Wireframes**?

Let me know which document to build next, and I'll create it with the same level of detail.
