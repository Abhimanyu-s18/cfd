# CFD Trading Platform - UI/UX Design Document
**Version:** 1.0  
**Date:** February 4, 2026  
**Related Documents:** Requirements v1.0, Technical Architecture v1.0

---

## TABLE OF CONTENTS

1. [Design Philosophy](#1-design-philosophy)
2. [Design System](#2-design-system)
3. [User Flow Diagrams](#3-user-flow-diagrams)
4. [Screen Wireframes](#4-screen-wireframes)
5. [Visual Mockups](#5-visual-mockups)
6. [Component Specifications](#6-component-specifications)
7. [Responsive Design](#7-responsive-design)
8. [Accessibility](#8-accessibility)
9. [Interaction Patterns](#9-interaction-patterns)
10. [Animation Guidelines](#10-animation-guidelines)

---

## 1. DESIGN PHILOSOPHY

### 1.1 Core Design Principles

**Professional Trading Environment**
- Clean, distraction-free interface for focused trading
- Information density balanced with clarity
- Real-time data prominence
- Quick access to critical functions

**Trust & Security**
- Clear visual hierarchy emphasizing safety
- Transparent risk warnings
- Obvious security indicators
- Professional, credible aesthetic

**Asian Market Optimization**
- Multi-language support (EN, ZH, JA, KO, VI, TH)
- Culturally appropriate color psychology
- Dense information display preference
- Mobile-first for high mobile usage in Asia

**Progressive Disclosure**
- Beginner-friendly default views
- Advanced features accessible but not overwhelming
- Contextual help and tooltips
- Educational moments integrated naturally

### 1.2 Target Users

**Primary Persona: Li Wei (Beginner Trader)**
- Age: 28, Singapore
- Goal: Learn trading without risk
- Pain points: Overwhelmed by complexity, fears losing money
- Needs: Clear guidance, educational resources, safe environment

**Secondary Persona: Takeshi Yamamoto (Experienced Trader)**
- Age: 35, Japan
- Goal: Test strategies before live trading
- Pain points: Needs advanced tools, fast execution
- Needs: Advanced charts, multiple positions, quick order entry

**Admin Persona: Sarah Chen (Platform Administrator)**
- Age: 32, Hong Kong
- Goal: Manage users efficiently, prevent abuse
- Pain points: Manual processes, fraud detection
- Needs: Bulk operations, analytics dashboard, audit trails

---

## 2. DESIGN SYSTEM

### 2.1 Color Palette

#### Primary Colors
```css
--primary-900: #0A2351;      /* Dark navy - headers, primary actions */
--primary-700: #1E3A8A;      /* Royal blue - active states */
--primary-500: #3B82F6;      /* Bright blue - primary CTAs */
--primary-300: #93C5FD;      /* Light blue - hover states */
--primary-100: #DBEAFE;      /* Very light blue - backgrounds */
```

#### Semantic Colors
```css
/* Success (Green) */
--success-900: #14532D;
--success-700: #15803D;
--success-500: #22C55E;      /* Buy buttons, profits */
--success-300: #86EFAC;
--success-100: #DCFCE7;

/* Danger (Red) */
--danger-900: #7F1D1D;
--danger-700: #B91C1C;
--danger-500: #EF4444;       /* Sell buttons, losses */
--danger-300: #FCA5A5;
--danger-100: #FEE2E2;

/* Warning (Amber) */
--warning-900: #78350F;
--warning-700: #B45309;
--warning-500: #F59E0B;      /* Warnings, margin calls */
--warning-300: #FCD34D;
--warning-100: #FEF3C7;

/* Info (Cyan) */
--info-500: #06B6D4;
--info-100: #CFFAFE;
```

#### Neutral Scale
```css
--gray-950: #0F172A;         /* Dark mode background */
--gray-900: #1E293B;         /* Card backgrounds (dark) */
--gray-800: #334155;
--gray-700: #475569;
--gray-600: #64748B;         /* Secondary text */
--gray-500: #94A3B8;
--gray-400: #CBD5E1;
--gray-300: #E2E8F0;
--gray-200: #F1F5F9;
--gray-100: #F8FAFC;         /* Light mode background */
--white: #FFFFFF;
```

### 2.2 Typography

#### Font Families
```css
/* Display & Headers */
--font-display: 'Clash Display', 'Inter', sans-serif;
/* Modern, geometric sans-serif for headers */

/* Body Text */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
/* Clean, highly readable for data-heavy interfaces */

/* Monospace (Numbers/Data) */
--font-mono: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
/* For prices, account balances, trading data */
```

#### Type Scale
```css
/* Display */
--text-6xl: 3.75rem;  /* 60px - Hero headlines */
--text-5xl: 3rem;     /* 48px - Page titles */
--text-4xl: 2.25rem;  /* 36px - Section headers */

/* Headers */
--text-3xl: 1.875rem; /* 30px - Card titles */
--text-2xl: 1.5rem;   /* 24px - Subsections */
--text-xl: 1.25rem;   /* 20px - Small headers */

/* Body */
--text-lg: 1.125rem;  /* 18px - Large body */
--text-base: 1rem;    /* 16px - Default body */
--text-sm: 0.875rem;  /* 14px - Secondary text */
--text-xs: 0.75rem;   /* 12px - Labels, captions */
```

#### Font Weights
```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### 2.3 Spacing System

```css
/* Base unit: 4px */
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
```

### 2.4 Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Inputs, small buttons */
--radius-md: 0.5rem;    /* 8px - Cards, buttons */
--radius-lg: 0.75rem;   /* 12px - Large cards */
--radius-xl: 1rem;      /* 16px - Modals */
--radius-2xl: 1.5rem;   /* 24px - Feature cards */
--radius-full: 9999px;  /* Circles, pills */
```

### 2.5 Shadows

```css
/* Elevation levels */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Colored shadows for CTAs */
--shadow-primary: 0 10px 25px -5px rgb(59 130 246 / 0.3);
--shadow-success: 0 10px 25px -5px rgb(34 197 94 / 0.3);
--shadow-danger: 0 10px 25px -5px rgb(239 68 68 / 0.3);
```

### 2.6 Breakpoints

```css
/* Mobile-first approach */
--breakpoint-xs: 320px;   /* Small phones */
--breakpoint-sm: 640px;   /* Large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

---

## 3. USER FLOW DIAGRAMS

### 3.1 New User Onboarding Flow

```
START: Landing Page
│
├─→ Click "Get Started"
│   │
│   ├─→ Registration Form (Step 1/5)
│   │   ├─ Email
│   │   ├─ Password
│   │   ├─ Phone (optional)
│   │   └─ Social Login Options
│   │       ├─ Google OAuth
│   │       └─ Apple ID
│   │
│   ├─→ Personal Information (Step 2/5)
│   │   ├─ First Name
│   │   ├─ Last Name
│   │   ├─ Date of Birth
│   │   ├─ City
│   │   └─ Country
│   │
│   ├─→ Trading Experience (Step 3/5)
│   │   ├─ Experience Level
│   │   ├─ Primary Goal
│   │   ├─ Time Commitment
│   │   ├─ Investment Capacity
│   │   └─ Risk Tolerance
│   │
│   ├─→ Risk Disclosure (Step 4/5)
│   │   ├─ Trading Risks Warning
│   │   ├─ Leverage Explanation
│   │   ├─ Loss Scenarios
│   │   └─ Acknowledgment Checkbox
│   │
│   └─→ Terms & Privacy (Step 5/5)
│       ├─ Terms of Service
│       ├─ Privacy Policy
│       ├─ Accept Checkboxes
│       └─ Complete Registration
│
├─→ Email Verification
│   └─→ Click verification link
│
├─→ Dashboard (First Login)
│   ├─ Welcome Modal
│   ├─ Guided Tour Option
│   └─ KYC Upload Prompt
│
└─→ KYC Submission
    ├─→ Identity Document Upload
    │   ├─ Document Type Selection
    │   ├─ Front Photo
    │   └─ Back Photo (if applicable)
    │
    ├─→ Address Proof Upload
    │   ├─ Document Type Selection
    │   └─ Photo Upload
    │
    └─→ Submit for Review
        │
        ├─→ [PENDING] Wait for admin review
        │   └─→ [APPROVED] → Account Activated
        │       └─→ Admin adds initial funds
        │           └─→ START TRADING
        │
        └─→ [REJECTED] → Resubmit KYC
            └─→ View rejection reasons
                └─→ Upload new documents
```

### 3.2 Trading Flow (Market Order)

```
START: Dashboard
│
├─→ Navigate to "Markets" or "Trading"
│
├─→ Select Asset Class
│   ├─ Forex
│   ├─ Commodities
│   ├─ Indices
│   ├─ Crypto
│   └─ Stocks
│
├─→ Select Instrument
│   ├─ Search/Filter
│   ├─ View Chart
│   ├─ Check Current Price
│   └─ View Instrument Details
│
├─→ Click "Trade" or "New Position"
│   │
│   └─→ Order Entry Panel Opens
│       │
│       ├─→ Select Order Type
│       │   ├─ Market (immediate)
│       │   └─ Limit (pending)
│       │
│       ├─→ Choose Direction
│       │   ├─ BUY (going long)
│       │   └─ SELL (going short)
│       │
│       ├─→ Enter Position Size
│       │   ├─ Lot size input
│       │   ├─ View in base currency
│       │   └─ View contract value
│       │
│       ├─→ Set Leverage
│       │   ├─ Slider or dropdown
│       │   ├─ View max leverage for asset
│       │   └─ Calculate required margin
│       │
│       ├─→ Risk Management (Optional)
│       │   ├─ Stop Loss
│       │   │   ├─ Set by price
│       │   │   ├─ Set by pips/points
│       │   │   └─ View potential loss
│       │   │
│       │   └─ Take Profit
│       │       ├─ Set by price
│       │       ├─ Set by pips/points
│       │       └─ View potential profit
│       │
│       ├─→ Review Order Summary
│       │   ├─ Position size
│       │   ├─ Entry price (estimated)
│       │   ├─ Margin required
│       │   ├─ Available margin check
│       │   ├─ Stop loss/Take profit levels
│       │   └─ Fees (commission/swap)
│       │
│       └─→ Confirm Order
│           │
│           ├─→ [SUCCESS] Position Opened
│           │   ├─ Confirmation notification
│           │   ├─ Position appears in "Open Positions"
│           │   ├─ Balance updated (margin deducted)
│           │   └─ Real-time P&L tracking begins
│           │
│           └─→ [FAILED] Error Displayed
│               ├─ Insufficient margin
│               ├─ Market closed
│               ├─ Position limit reached
│               └─ Return to order panel
│
└─→ Monitor Position
    ├─ View real-time P&L
    ├─ Edit Stop Loss/Take Profit
    └─ Close Position (Manual)
        └─→ Position Closed
            ├─ Realized P&L calculated
            ├─ Margin released
            ├─ Balance updated
            └─ Trade recorded in history
```

### 3.3 Position Management Flow

```
Active Position Monitoring
│
├─→ Dashboard → Open Positions Table
│   │
│   ├─ View Real-time Data
│   │   ├─ Current Price
│   │   ├─ Entry Price
│   │   ├─ Unrealized P&L
│   │   ├─ Margin Used
│   │   └─ Running Time
│   │
│   ├─→ Click Position to Expand
│   │   ├─ View detailed chart
│   │   ├─ See order history
│   │   └─ View position stats
│   │
│   └─→ Position Actions
│       │
│       ├─→ Modify Position
│       │   ├─ Edit Stop Loss
│       │   │   └─→ Confirm change
│       │   │       └─ Position updated
│       │   │
│       │   ├─ Edit Take Profit
│       │   │   └─→ Confirm change
│       │   │       └─ Position updated
│       │   │
│       │   └─ Partial Close (advanced)
│       │       ├─ Enter close amount
│       │       └─→ Confirm
│       │           ├─ Partial P&L realized
│       │           └─ Position size reduced
│       │
│       └─→ Close Position
│           ├─ Click "Close" button
│           ├─ Confirm modal
│           │   ├─ Show current P&L
│           │   ├─ Show closing price
│           │   └─ Confirm/Cancel
│           │
│           └─→ Execute Close
│               ├─ Position closed at market
│               ├─ P&L realized
│               ├─ Margin released
│               ├─ Balance updated
│               ├─ Transaction recorded
│               └─ Move to History
│
├─→ Automated Position Closures
│   │
│   ├─→ Stop Loss Triggered
│   │   ├─ Price hits SL level
│   │   ├─ Auto-close executed
│   │   ├─ Loss realized
│   │   ├─ Notification sent
│   │   └─ Position moved to history
│   │
│   ├─→ Take Profit Triggered
│   │   ├─ Price hits TP level
│   │   ├─ Auto-close executed
│   │   ├─ Profit realized
│   │   ├─ Notification sent
│   │   └─ Position moved to history
│   │
│   └─→ Margin Call / Stop Out
│       ├─ Margin level falls below 50%
│       │   └─ MARGIN CALL warning sent
│       │
│       ├─ Margin level falls below 20%
│       │   ├─ STOP OUT triggered
│       │   ├─ Positions auto-closed (largest first)
│       │   ├─ Critical notification sent
│       │   └─ Positions moved to history
│       │
│       └─ Account recovery
│           ├─ Add more funds
│           └─ Risk awareness education
│
└─→ View Trading History
    ├─ Filter by date range
    ├─ Filter by asset class
    ├─ Filter by status (profit/loss)
    ├─ Export to CSV
    └─ View detailed trade stats
```

### 3.4 Admin KYC Verification Flow

```
Admin Dashboard
│
├─→ Navigate to "KYC Queue"
│   │
│   ├─ View Pending KYC Submissions
│   │   ├─ Sort by: Date, User, Document Type
│   │   ├─ Filter by status
│   │   └─ Search users
│   │
│   └─→ Select KYC Submission
│       │
│       ├─→ Review User Information
│       │   ├─ Full name
│       │   ├─ Date of birth
│       │   ├─ Email
│       │   ├─ Phone
│       │   ├─ Country
│       │   ├─ Registration date
│       │   └─ Account activity
│       │
│       ├─→ Review Uploaded Documents
│       │   │
│       │   ├─ Identity Document
│       │   │   ├─ View front image (full size)
│       │   │   ├─ View back image (if provided)
│       │   │   ├─ Zoom/Pan controls
│       │   │   └─ Download original
│       │   │
│       │   └─ Address Proof Document
│       │       ├─ View image (full size)
│       │       ├─ Zoom/Pan controls
│       │       └─ Download original
│       │
│       ├─→ Document Verification Checklist
│       │   ├─ ☐ Photo quality acceptable
│       │   ├─ ☐ All text clearly readable
│       │   ├─ ☐ Document not expired
│       │   ├─ ☐ Name matches user profile
│       │   ├─ ☐ Date of birth matches
│       │   ├─ ☐ Address document recent (<3 months)
│       │   ├─ ☐ Address clearly visible
│       │   └─ ☐ No signs of tampering
│       │
│       └─→ Decision Actions
│           │
│           ├─→ APPROVE
│           │   ├─ Click "Approve KYC"
│           │   ├─ Add approval comment (optional)
│           │   ├─ Set initial funds amount
│           │   │   ├─ Default: $10,000
│           │   │   └─ Custom amount
│           │   │
│           │   └─→ Confirm Approval
│           │       ├─ User status → APPROVED
│           │       ├─ Funds added to account
│           │       ├─ Email notification sent
│           │       ├─ User can now trade
│           │       └─ Admin action logged
│           │
│           └─→ REJECT
│               ├─ Click "Reject KYC"
│               ├─ Select rejection reason(s)
│               │   ├─ ☐ Poor photo quality
│               │   ├─ ☐ Document expired
│               │   ├─ ☐ Information mismatch
│               │   ├─ ☐ Underage (under 18)
│               │   ├─ ☐ Suspected fraud
│               │   └─ ☐ Other (specify)
│               │
│               ├─ Add detailed comment
│               │
│               └─→ Confirm Rejection
│                   ├─ User status → REJECTED
│                   ├─ Email notification sent
│                   ├─ User sees rejection reasons
│                   ├─ User can resubmit
│                   └─ Admin action logged
│
└─→ Bulk Operations
    ├─ Select multiple submissions
    ├─ Bulk approve (if verified)
    └─ Export KYC report
```

### 3.5 Admin Fund Management Flow

```
Admin Dashboard
│
├─→ Navigate to "User Management"
│   │
│   ├─→ Search/Filter Users
│   │   ├─ By email/name
│   │   ├─ By KYC status
│   │   ├─ By account balance
│   │   └─ By last active date
│   │
│   └─→ Select User Account
│       │
│       ├─→ View User Overview
│       │   ├─ Account balance
│       │   ├─ Bonus balance
│       │   ├─ Equity
│       │   ├─ Used margin
│       │   ├─ Free margin
│       │   ├─ Total P&L
│       │   ├─ Open positions (count)
│       │   ├─ Trade history
│       │   └─ Recent transactions
│       │
│       └─→ Fund Management Actions
│           │
│           ├─→ Add Balance
│           │   ├─ Click "Add Funds"
│           │   ├─ Enter amount
│           │   ├─ Select fund type
│           │   │   ├─ Regular balance
│           │   │   └─ Bonus (non-withdrawable)
│           │   │
│           │   ├─ Add admin comment/reason
│           │   │   ├─ Initial deposit
│           │   │   ├─ Promotional bonus
│           │   │   ├─ Compensation
│           │   │   └─ Other
│           │   │
│           │   └─→ Confirm Addition
│           │       ├─ Balance updated
│           │       ├─ Transaction recorded
│           │       ├─ User notification sent
│           │       └─ Admin action logged
│           │
│           ├─→ Remove Balance
│           │   ├─ Click "Remove Funds"
│           │   ├─ Enter amount
│           │   ├─ Check: No open positions affected
│           │   ├─ Add mandatory reason
│           │   │   ├─ Policy violation
│           │   │   ├─ Account error
│           │   │   ├─ Bonus expiration
│           │   │   └─ Other (required explanation)
│           │   │
│           │   └─→ Confirm Removal
│           │       ├─ Balance updated
│           │       ├─ Transaction recorded
│           │       ├─ User notification sent
│           │       └─ Admin action logged
│           │
│           ├─→ Adjust Leverage
│           │   ├─ View current leverage settings
│           │   │   ├─ Forex: 1:500
│           │   │   ├─ Commodities: 1:100
│           │   │   ├─ Indices: 1:200
│           │   │   ├─ Crypto: 1:50
│           │   │   └─ Stocks: 1:20
│           │   │
│           │   ├─ Modify leverage (per asset class)
│           │   ├─ Add reason for change
│           │   │
│           │   └─→ Confirm Leverage Update
│           │       ├─ Leverage updated
│           │       ├─ Affects future positions only
│           │       ├─ User notification sent
│           │       └─ Admin action logged
│           │
│           └─→ Account Actions
│               ├─→ Suspend Account
│               │   ├─ Select suspension duration
│               │   │   ├─ 7 days
│               │   │   ├─ 30 days
│               │   │   ├─ 90 days
│               │   │   └─ Custom date
│               │   │
│               │   ├─ Add suspension reason
│               │   │   ├─ Terms violation
│               │   │   ├─ Suspicious activity
│               │   │   ├─ User request
│               │   │   └─ Other
│               │   │
│               │   └─→ Confirm Suspension
│               │       ├─ Account suspended
│               │       ├─ User cannot trade
│               │       ├─ Open positions maintained
│               │       ├─ Email notification sent
│               │       └─ Admin action logged
│               │
│               └─→ Ban Account (Permanent)
│                   ├─ ⚠️ Warning confirmation
│                   ├─ Enter ban reason (required)
│                   ├─ Close all open positions?
│                   │   ├─ Yes → Force close all
│                   │   └─ No → Keep positions
│                   │
│                   └─→ Confirm Ban
│                       ├─ Account banned permanently
│                       ├─ All access revoked
│                       ├─ Email notification sent
│                       └─ Admin action logged
│
└─→ Audit Trail
    ├─ View all admin actions
    ├─ Filter by admin user
    ├─ Filter by action type
    └─ Export audit report
```

---

## 4. SCREEN WIREFRAMES

### 4.1 Landing Page (Public)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ ┌──────┐                          [Login] [Get Started] [EN▾]│
│ │ LOGO │                                                     │
│ └──────┘                                                     │
├─────────────────────────────────────────────────────────────┤
│                        HERO SECTION                          │
│                                                              │
│         Trade 70+ Instruments Risk-Free                      │
│      Practice with $10,000 Virtual Funds                     │
│                                                              │
│            [Get Started - It's Free]                         │
│                                                              │
│    ┌──────────────────────────────────────────────────┐    │
│    │                                                    │    │
│    │        [TRADING CHART PREVIEW ANIMATION]          │    │
│    │                                                    │    │
│    └──────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                     FEATURES SECTION                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ [ICON]   │  │ [ICON]   │  │ [ICON]   │  │ [ICON]   │   │
│  │ Real-time│  │ 70+      │  │ Risk-free│  │ Mobile   │   │
│  │ Data     │  │ Markets  │  │ Learning │  │ Trading  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   ASSET CLASSES SECTION                      │
│                                                              │
│  Available Markets:                                          │
│                                                              │
│  [Forex]  15 pairs  │ Up to 1:500 leverage                  │
│  [Commodities] 10   │ Gold, Oil, Silver...                  │
│  [Indices] 5        │ S&P 500, NASDAQ...                    │
│  [Crypto] 20        │ BTC, ETH, SOL...                      │
│  [Stocks] 20        │ Apple, Tesla, Google...               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    HOW IT WORKS SECTION                      │
│                                                              │
│  1. Sign Up → 2. Verify KYC → 3. Get Funds → 4. Start Trading│
│                                                              │
│            [Start Your Journey]                              │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
│ About │ FAQ │ Terms │ Privacy │ Contact                     │
│ © 2026 CFD Trading Platform                                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Registration Flow (Step 1 of 5)

```
┌─────────────────────────────────────────────────────────────┐
│                     Create Your Account                      │
│                        Step 1 of 5                           │
│                                                              │
│  Progress: [████░░░░░░░░░░░] 20%                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Email Address *                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ your@email.com                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Password *                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ••••••••••••                                    [👁] │   │
│  └──────────────────────────────────────────────────────┘   │
│  ☑ At least 8 characters                                    │
│  ☑ One uppercase letter                                     │
│  ☑ One number                                               │
│                                                              │
│  Phone Number (Optional)                                     │
│  ┌────┬────────────────────────────────────────────────┐   │
│  │+1▾│ (555) 123-4567                                  │   │
│  └────┴────────────────────────────────────────────────┘   │
│                                                              │
│  ━━━━━━━━━━━━━━ OR ━━━━━━━━━━━━━━                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [G] Continue with Google                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [] Continue with Apple                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  By continuing, you agree to our Terms of Service and        │
│  Privacy Policy.                                             │
│                                                              │
│                           [Next →]                           │
│                                                              │
│  Already have an account? [Log In]                           │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Registration Flow (Step 3 of 5 - Trading Experience)

```
┌─────────────────────────────────────────────────────────────┐
│                   Tell Us About Yourself                     │
│                        Step 3 of 5                           │
│                                                              │
│  Progress: [████████░░░░░░] 60%                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Trading Experience Level *                                  │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   BEGINNER       │  │  INTERMEDIATE    │                │
│  │ First time trader│  │ Some experience  │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │    TRADER        │  │   EXPERIENCED    │                │
│  │ Active trading   │  │  3+ years        │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
│  Primary Trading Goal                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ○ Learn trading basics                               │   │
│  │ ○ Test trading strategies                            │   │
│  │ ○ Practice risk management                           │   │
│  │ ○ Prepare for live trading                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Time Commitment                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ○ Less than 1 hour/week                              │   │
│  │ ○ 1-5 hours/week                                     │   │
│  │ ○ 5-10 hours/week                                    │   │
│  │ ○ More than 10 hours/week                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│                  [← Back]        [Next →]                    │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Dashboard (After Login - Desktop)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                    │
│ ┌──────┐  Dashboard  Markets  Positions  History  Profile              │
│ │ LOGO │                                                                │
│ └──────┘                                                                │
│                                                                          │
│  Balance: $10,245.50  [+245.50]  │  Margin: $1,245  │  [🔔] [@John] [EN▾]│
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ MAIN CONTENT AREA                                                         │
│                                                                           │
│ ┌────────────────────────────────────┐ ┌───────────────────────────────┐│
│ │ ACCOUNT SUMMARY                    │ │ QUICK ACTIONS                 ││
│ │                                    │ │                               ││
│ │ Total Balance    $10,245.50       │ │ [New Position]                ││
│ │ Equity           $10,450.00       │ │ [View Markets]                ││
│ │ Used Margin      $1,245.00        │ │ [Watchlist]                   ││
│ │ Free Margin      $9,205.50        │ │                               ││
│ │ Margin Level     838%              │ │                               ││
│ │                                    │ │                               ││
│ │ Today's P&L      +$245.50 (2.4%)  │ │                               ││
│ └────────────────────────────────────┘ └───────────────────────────────┘│
│                                                                           │
│ ┌────────────────────────────────────────────────────────────────────┐  │
│ │ OPEN POSITIONS (3)                                                  │  │
│ ├────────────────────────────────────────────────────────────────────┤  │
│ │ Symbol    │Type│ Size │Entry    │Current  │ SL/TP    │ P&L       │  │
│ ├────────────────────────────────────────────────────────────────────┤  │
│ │ EUR/USD   │BUY │ 1.5  │1.0850   │1.0875   │1.08/1.09 │+$375.00   │  │
│ │ Gold      │SELL│ 0.5  │2050     │2048     │2055/2045 │+$100.00   │  │
│ │ BTC/USD   │BUY │ 0.01 │45000    │44500    │44000/-   │-$500.00   │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│ ┌─────────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ TOP MOVERS                          │ │ RECENT ACTIVITY             │ │
│ ├─────────────────────────────────────┤ ├─────────────────────────────┤ │
│ │ BTC/USD   $45,245  +5.2%  [Chart] │ │ • Opened EUR/USD (2m ago)  │ │
│ │ Gold      $2,048   +1.8%  [Chart] │ │ • Closed AAPL +$50 (15m)   │ │
│ │ EUR/USD   1.0875   -0.3%  [Chart] │ │ • SL triggered GBP/USD     │ │
│ │ Tesla     $245.80  +2.1%  [Chart] │ │ • Fund added $1000 (today) │ │
│ └─────────────────────────────────────┘ └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.5 Trading Screen (Desktop - Full Layout)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ HEADER [Same as Dashboard]                                               │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ TRADING INTERFACE                                                         │
│                                                                           │
│ ┌─────────────────┐ ┌────────────────────────────────┐ ┌──────────────┐│
│ │ MARKET WATCH    │ │ CHART AREA                      │ │ORDER PANEL   ││
│ │                 │ │                                 │ │              ││
│ │ [Search...]     │ │  EUR/USD  1.0875  +0.0025(+0.2%)│ │EUR/USD       ││
│ │                 │ │                                 │ │1.0875        ││
│ │ ⭐FAVORITES     │ │  Timeframe: [1m][5m][15m][1h].. │ │              ││
│ │ EUR/USD  1.0875│ │                                 │ │Order Type:   ││
│ │ GBP/USD  1.2640│ │  ┌────────────────────────────┐ │ │○Market       ││
│ │ BTC/USD  45245 │ │  │                             │ │ │○Limit        ││
│ │                 │ │  │    [CANDLESTICK CHART]     │ │ │              ││
│ │ FOREX ▾         │ │  │    WITH INDICATORS         │ │ │Direction:    ││
│ │ EUR/USD  1.0875│ │  │    (MA, RSI, MACD)         │ │ │[  BUY   ]    ││
│ │ GBP/USD  1.2640│ │  │                             │ │ │[ SELL   ]    ││
│ │ USD/JPY  149.45│ │  │                             │ │ │              ││
│ │                 │ │  └────────────────────────────┘ │ │Size (lots):  ││
│ │ COMMODITIES ▾   │ │                                 │ │┌──────────┐  ││
│ │ Gold     2048  │ │  Tools: [Trendline][Support]   │ ││  1.0     │  ││
│ │ Silver   24.50 │ │        [Fibonacci][Indicators] │ │└──────────┘  ││
│ │                 │ │                                 │ │              ││
│ │ CRYPTO ▾        │ │                                 │ │Leverage:     ││
│ │ BTC/USD  45245 │ │                                 │ │[1:100 ▾]     ││
│ │ ETH/USD  2450  │ │                                 │ │              ││
│ └─────────────────┘ └────────────────────────────────┘ │Stop Loss:    ││
│                                                         │┌──────────┐  ││
│ ┌───────────────────────────────────────────────────┐  ││ 1.0850   │  ││
│ │ OPEN POSITIONS                                     │  │└──────────┘  ││
│ ├───────────────────────────────────────────────────┤  │              ││
│ │ EUR/USD │BUY│1.5│1.0850│1.0875│+$375│[Modify][Close]│ │Take Profit:  ││
│ │ Gold    │SELL│0.5│2050│2048│+$100│[Modify][Close] │  │┌──────────┐  ││
│ └───────────────────────────────────────────────────┘  ││ 1.0900   │  ││
│                                                         │└──────────┘  ││
│                                                         │              ││
│                                                         │Margin:       ││
│                                                         │Required:$217 ││
│                                                         │Available:    ││
│                                                         │$9,205        ││
│                                                         │              ││
│                                                         │[EXECUTE BUY] ││
│                                                         └──────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.6 Positions Management Screen

```
┌──────────────────────────────────────────────────────────────────────────┐
│ HEADER [Same as Dashboard]                                               │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ POSITIONS & HISTORY                                                       │
│                                                                           │
│ [Open Positions (3)] [Pending Orders (1)] [History]                      │
│                                                                           │
│ ╔═══════════════════════════════════════════════════════════════════╗   │
│ ║ OPEN POSITIONS                                                     ║   │
│ ╠═══════════════════════════════════════════════════════════════════╣   │
│ ║                                                                    ║   │
│ ║ ┌────────────────────────────────────────────────────────────────┐║   │
│ ║ │ EUR/USD │ BUY │ 1.5 lots │ Opened: 2h 15m ago              [×]│║   │
│ ║ ├────────────────────────────────────────────────────────────────┤║   │
│ ║ │ Entry Price:    1.0850                                         │║   │
│ ║ │ Current Price:  1.0875  [▲ +0.0025]                           │║   │
│ ║ │ Stop Loss:      1.0800  [Edit]                                 │║   │
│ ║ │ Take Profit:    1.0950  [Edit]                                 │║   │
│ ║ │                                                                 │║   │
│ ║ │ Margin Used:    $217.00                                        │║   │
│ ║ │ Swap/Fee:       -$2.50                                         │║   │
│ ║ │                                                                 │║   │
│ ║ │ Unrealized P&L: +$375.00 (+1.7%)                              │║   │
│ ║ │                                                                 │║   │
│ ║ │         [View Chart]  [Modify Position]  [Close Position]     │║   │
│ ║ └────────────────────────────────────────────────────────────────┘║   │
│ ║                                                                    ║   │
│ ║ ┌────────────────────────────────────────────────────────────────┐║   │
│ ║ │ GOLD (XAU/USD) │ SELL │ 0.5 oz │ Opened: 4h 32m ago      [×]│║   │
│ ║ ├────────────────────────────────────────────────────────────────┤║   │
│ ║ │ Entry Price:    $2,050.00                                      │║   │
│ ║ │ Current Price:  $2,048.00  [▼ -$2.00]                        │║   │
│ ║ │ Stop Loss:      $2,055.00  [Edit]                             │║   │
│ ║ │ Take Profit:    $2,045.00  [Edit]                             │║   │
│ ║ │                                                                 │║   │
│ ║ │ Margin Used:    $1,025.00                                      │║   │
│ ║ │ Swap/Fee:       -$5.00                                         │║   │
│ ║ │                                                                 │║   │
│ ║ │ Unrealized P&L: +$100.00 (+0.5%)                              │║   │
│ ║ │                                                                 │║   │
│ ║ │         [View Chart]  [Modify Position]  [Close Position]     │║   │
│ ║ └────────────────────────────────────────────────────────────────┘║   │
│ ║                                                                    ║   │
│ ║ ┌────────────────────────────────────────────────────────────────┐║   │
│ ║ │ BTC/USD │ BUY │ 0.01 BTC │ Opened: 12h 5m ago            [×]│║   │
│ ║ ├────────────────────────────────────────────────────────────────┤║   │
│ ║ │ Entry Price:    $45,000.00                                     │║   │
│ ║ │ Current Price:  $44,500.00  [▼ -$500.00]                     │║   │
│ ║ │ Stop Loss:      $44,000.00  [Edit]                            │║   │
│ ║ │ Take Profit:    Not Set  [Add]                                │║   │
│ ║ │                                                                 │║   │
│ ║ │ Margin Used:    $890.00                                        │║   │
│ ║ │ Swap/Fee:       -$10.00                                        │║   │
│ ║ │                                                                 │║   │
│ ║ │ Unrealized P&L: -$500.00 (-1.1%)  ⚠️                         │║   │
│ ║ │                                                                 │║   │
│ ║ │         [View Chart]  [Modify Position]  [Close Position]     │║   │
│ ║ └────────────────────────────────────────────────────────────────┘║   │
│ ╚═══════════════════════════════════════════════════════════════════╝   │
│                                                                           │
│ Summary: 3 positions │ Total Margin: $2,132 │ Total P&L: -$25.00       │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.7 Admin Dashboard

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ADMIN PANEL                                                               │
│ ┌──────┐  Dashboard  Users  KYC Queue  Positions  Reports               │
│ │ LOGO │                                                                 │
│ └──────┘                                         [Admin: Sarah] [Logout] │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ OVERVIEW METRICS                                                          │
│                                                                           │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│ │ Total Users  │ │ Active Today │ │ Pending KYC  │ │ Open Trades  │    │
│ │   1,247      │ │     342      │ │      23      │ │     856      │    │
│ │   +12 today  │ │   +15 (4.6%) │ │    -5 today  │ │  +34 (4.1%)  │    │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                                           │
│ ┌────────────────────────────────────┐ ┌───────────────────────────────┐│
│ │ RECENT REGISTRATIONS               │ │ SYSTEM ALERTS                 ││
│ ├────────────────────────────────────┤ ├───────────────────────────────┤│
│ │ John Doe (USA) - 5 min ago        │ │ ⚠️ 3 margin calls triggered   ││
│ │ [Add Funds] [View Profile]        │ │ ⚠️ 1 user exceeded position  ││
│ │                                    │ │    limit                      ││
│ │ Li Ming (China) - 12 min ago      │ │ ℹ️ API rate limit: 80% used   ││
│ │ [Add Funds] [View Profile]        │ │ ✓ Backup completed (2h ago)   ││
│ │                                    │ │                               ││
│ │ Sara Ahmed (UAE) - 23 min ago     │ │                               ││
│ │ [Add Funds] [View Profile]        │ │                               ││
│ └────────────────────────────────────┘ └───────────────────────────────┘│
│                                                                           │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ KYC VERIFICATION QUEUE (23 Pending)                                   │ │
│ ├──────────────────────────────────────────────────────────────────────┤ │
│ │ User          │ Country │ Submitted   │ Status    │ Action           │ │
│ ├──────────────────────────────────────────────────────────────────────┤ │
│ │ Alex Chen     │ 🇸🇬 SG  │ 2 hours ago │ PENDING   │ [Review] [Skip] │ │
│ │ Maria Garcia  │ 🇪🇸 ES  │ 5 hours ago │ PENDING   │ [Review] [Skip] │ │
│ │ Ahmed Hassan  │ 🇦🇪 AE  │ 1 day ago   │ PENDING   │ [Review] [Skip] │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ┌─────────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ TOP TRADERS (BY P&L)                │ │ PLATFORM STATISTICS         │ │
│ ├─────────────────────────────────────┤ ├─────────────────────────────┤ │
│ │ 1. TradeMaster  +$15,420 (154%)    │ │ Total Trades Today: 1,247   │ │
│ │ 2. CryptoKing   +$12,850 (128%)    │ │ Win Rate: 58.3%             │ │
│ │ 3. ForexPro99   +$9,240 (92%)      │ │ Avg Position Size: $5,420   │ │
│ │ 4. GoldBug_88   +$7,650 (76%)      │ │ Most Traded: EUR/USD (342)  │ │
│ │ 5. BTC_Holder   +$6,100 (61%)      │ │ Total Virtual Funds: $12.4M │ │
│ └─────────────────────────────────────┘ └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.8 Admin KYC Review Screen

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ADMIN PANEL - KYC REVIEW                                                  │
│                                                    [← Back to Queue]      │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ USER INFORMATION                                                          │
│                                                                           │
│ ┌───────────────────────────────┐  ┌───────────────────────────────────┐│
│ │ Full Name:  Alex Chen         │  │ Email: alex.chen@email.com        ││
│ │ DOB:        1995-03-15 (28y)  │  │ Phone: +65 9123 4567              ││
│ │ Country:    Singapore 🇸🇬      │  │ Registered: 2026-02-03 14:25 UTC ││
│ │ City:       Singapore          │  │ Last Login: 2h ago                ││
│ └───────────────────────────────┘  └───────────────────────────────────┘│
│                                                                           │
│ Trading Profile:                                                          │
│ • Experience: INTERMEDIATE                                                │
│ • Goal: Test trading strategies                                          │
│ • Time: 5-10 hours/week                                                  │
│                                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│ SUBMITTED DOCUMENTS                                                       │
│                                                                           │
│ Identity Document: PASSPORT                                               │
│ ┌─────────────────────────────┐  ┌─────────────────────────────┐        │
│ │                              │  │                              │        │
│ │   [PASSPORT FRONT IMAGE]    │  │   [PASSPORT BACK IMAGE]     │        │
│ │                              │  │                              │        │
│ │      (Click to enlarge)     │  │      (Click to enlarge)     │        │
│ │                              │  │                              │        │
│ │  [🔍 Zoom] [⬇️ Download]    │  │  [🔍 Zoom] [⬇️ Download]    │        │
│ └─────────────────────────────┘  └─────────────────────────────┘        │
│                                                                           │
│ Address Proof: UTILITY BILL                                               │
│ ┌─────────────────────────────┐                                          │
│ │                              │                                          │
│ │   [UTILITY BILL IMAGE]      │                                          │
│ │                              │                                          │
│ │      (Click to enlarge)     │                                          │
│ │                              │                                          │
│ │  [🔍 Zoom] [⬇️ Download]    │                                          │
│ └─────────────────────────────┘                                          │
│                                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│ VERIFICATION CHECKLIST                                                    │
│                                                                           │
│ ☐ Document quality is acceptable (clear, readable)                       │
│ ☐ All required information is visible                                    │
│ ☐ Documents are not expired                                              │
│ ☐ Name matches user profile                                              │
│ ☐ Date of birth matches (user is 18+)                                   │
│ ☐ Address document is recent (within 3 months)                           │
│ ☐ No signs of tampering or forgery                                       │
│                                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│ DECISION                                                                  │
│                                                                           │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ Admin Comments (Optional)                                             │ │
│ │ ┌──────────────────────────────────────────────────────────────────┐ │ │
│ │ │                                                                   │ │ │
│ │ │                                                                   │ │ │
│ │ └──────────────────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ Initial Funds to Add (if approving):                                      │
│ ┌────────────────┐                                                        │
│ │ $ 10,000       │ [Preset: $5K] [$10K] [$25K] [$50K]                    │
│ └────────────────┘                                                        │
│                                                                           │
│        [✓ APPROVE KYC]                    [✗ REJECT KYC]                │
│                                                                           │
│ Rejection Reasons (select if rejecting):                                  │
│ □ Poor photo quality / illegible                                         │
│ □ Document expired                                                       │
│ □ Information mismatch                                                   │
│ □ User under 18 years old                                                │
│ □ Suspected fraud / fake documents                                       │
│ □ Incomplete submission                                                  │
│ □ Other (specify in comments)                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.9 Mobile View - Dashboard (375px width)

```
┌─────────────────────────┐
│ ☰ LOGO      🔔 @John EN▾│
├─────────────────────────┤
│ Account Summary         │
│                         │
│ Balance:   $10,245.50   │
│ P&L:       +$245 (2.4%) │
│                         │
│ [━━━━━━━━━━━] 838%     │
│ Margin Level            │
├─────────────────────────┤
│ Quick Actions           │
│                         │
│ [  New Trade  ] [Market]│
├─────────────────────────┤
│ Open Positions (3)      │
│                         │
│ ┌─────────────────────┐ │
│ │ EUR/USD      +$375  │ │
│ │ BUY 1.5 lots        │ │
│ │ 1.0850→1.0875       │ │
│ │ [Close]             │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ GOLD         +$100  │ │
│ │ SELL 0.5 oz         │ │
│ │ $2050→$2048         │ │
│ │ [Close]             │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ BTC/USD      -$500  │ │
│ │ BUY 0.01 BTC        │ │
│ │ $45000→$44500 ⚠️    │ │
│ │ [Close]             │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ Markets                 │
│                         │
│ BTC/USD  $45245  +5.2% │
│ Gold     $2048   +1.8% │
│ EUR/USD  1.0875  -0.3% │
├─────────────────────────┤
│ BOTTOM NAVIGATION       │
│ [🏠] [📊] [📈] [⚙️]   │
└─────────────────────────┘
```

### 4.10 Mobile View - Trading Screen

```
┌─────────────────────────┐
│ ← EUR/USD          [⋮] │
├─────────────────────────┤
│ 1.0875    +0.0025(+0.2%)│
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │  [MINI CHART]       │ │
│ │  TradingView Lite   │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ [1m][5m][15m][1h][1d]  │
├─────────────────────────┤
│ Order Panel             │
│                         │
│ Type: ●Market ○Limit    │
│                         │
│ Size (lots)             │
│ ┌─────────────────────┐ │
│ │       1.0           │ │
│ │    [−]    [+]       │ │
│ └─────────────────────┘ │
│                         │
│ Leverage:  [1:100 ▾]    │
│                         │
│ Stop Loss (optional)    │
│ ┌─────────────────────┐ │
│ │     1.0850          │ │
│ └─────────────────────┘ │
│                         │
│ Take Profit (optional)  │
│ ┌─────────────────────┐ │
│ │     1.0900          │ │
│ └─────────────────────┘ │
│                         │
│ ───────────────────────│
│ Margin Required: $217   │
│ Available: $9,205       │
│ ───────────────────────│
│                         │
│ ┌──────────┐┌──────────┐│
│ │   BUY    ││   SELL   ││
│ │ 1.0875   ││ 1.0873   ││
│ └──────────┘└──────────┘│
├─────────────────────────┤
│ BOTTOM NAVIGATION       │
│ [🏠] [📊] [📈] [⚙️]   │
└─────────────────────────┘
```

---

## 5. VISUAL MOCKUPS

### 5.1 High-Fidelity Design Specifications

I'll create actual visual mockups in HTML/React artifacts showcasing the exact visual design with colors, typography, spacing, and interactive elements.

**Mockup 1: Landing Page Hero**
- Modern gradient background (navy to electric blue)
- Animated trading chart preview
- Clear CTA buttons with shadow effects
- Trust indicators (security badges, user count)

**Mockup 2: Dashboard - Light Mode**
- Clean card-based layout
- Prominent account balance display
- Color-coded P&L (green/red)
- Real-time updating positions table
- Subtle shadows and rounded corners

**Mockup 3: Trading Interface**
- TradingView-style charting
- Floating order panel with glassmorphism effect
- Bid/Ask spread visualization
- Quick order entry with haptic feedback simulation

**Mockup 4: Mobile Trading App**
- Bottom navigation
- Swipe gestures for position management
- Pull-to-refresh
- Thumb-friendly touch targets (44px minimum)

**Mockup 5: Admin Dashboard Dark Mode**
- Dark navy background (#0F172A)
- Accent colors for metrics
- Data visualization charts
- Quick action buttons

---

## 6. COMPONENT SPECIFICATIONS

### 6.1 Core Components

#### 6.1.1 Button Component

**Variants:**
```typescript
type ButtonVariant = 
  | 'primary'    // Solid blue background
  | 'secondary'  // Outlined
  | 'success'    // Solid green (Buy)
  | 'danger'     // Solid red (Sell)
  | 'ghost'      // Transparent
  | 'link'       // Text only

type ButtonSize = 
  | 'xs'   // 28px height
  | 'sm'   // 36px height
  | 'md'   // 44px height (default)
  | 'lg'   // 52px height
  | 'xl'   // 60px height
```

**Props:**
- variant: ButtonVariant
- size: ButtonSize
- disabled: boolean
- loading: boolean
- fullWidth: boolean
- leftIcon: ReactNode
- rightIcon: ReactNode
- onClick: () => void

**Visual States:**
- Default
- Hover (scale 1.02, shadow increase)
- Active (scale 0.98)
- Disabled (opacity 0.5, cursor not-allowed)
- Loading (spinner, pointer-events none)

**Accessibility:**
- Keyboard focus ring
- ARIA attributes
- Semantic HTML (button element)

#### 6.1.2 Input Component

**Types:**
- text
- number
- email
- password
- tel
- search

**Props:**
- label: string
- placeholder: string
- value: string | number
- onChange: (value) => void
- error: string
- helperText: string
- disabled: boolean
- required: boolean
- leftAddon: ReactNode (e.g., $ symbol)
- rightAddon: ReactNode (e.g., password visibility toggle)

**Visual Design:**
- Height: 44px (touch-friendly)
- Border: 1px solid gray-300
- Border radius: 8px
- Focus: 2px blue ring
- Error: Red border + error message below

#### 6.1.3 Card Component

**Variants:**
- default (white bg, shadow-md)
- elevated (shadow-lg)
- outlined (border, no shadow)
- interactive (hover effect)

**Props:**
- title: string
- subtitle: string
- headerAction: ReactNode
- children: ReactNode
- padding: 'none' | 'sm' | 'md' | 'lg'
- onClick: () => void (for interactive cards)

**Structure:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardAction>Action</CardAction>
  </CardHeader>
  <CardBody>
    Content
  </CardBody>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

#### 6.1.4 Table Component

**Features:**
- Sortable columns
- Pagination
- Row selection
- Expandable rows
- Responsive (horizontal scroll on mobile)
- Loading state (skeleton)
- Empty state

**Props:**
- columns: ColumnDef[]
- data: any[]
- loading: boolean
- pagination: PaginationConfig
- onRowClick: (row) => void
- selectable: boolean

**Column Definition:**
```typescript
type ColumnDef = {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value, row) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}
```

#### 6.1.5 Modal Component

**Sizes:**
- sm: 400px
- md: 600px
- lg: 800px
- xl: 1200px
- full: 95vw

**Props:**
- isOpen: boolean
- onClose: () => void
- title: string
- size: ModalSize
- closeOnOverlayClick: boolean
- closeOnEsc: boolean

**Features:**
- Backdrop overlay (dark, 50% opacity)
- Slide-in animation from bottom
- Focus trap
- Scroll lock on body
- ESC key to close

#### 6.1.6 Position Card Component

**Purpose:** Display open trading position

**Props:**
- position: Position
- onClose: () => void
- onModify: () => void

**Layout:**
```
┌────────────────────────────────┐
│ EUR/USD [×]                    │
│ BUY 1.5 lots                   │
├────────────────────────────────┤
│ Entry: 1.0850                  │
│ Current: 1.0875 [▲ +0.0025]   │
│ SL: 1.0800 [Edit]              │
│ TP: 1.0950 [Edit]              │
├────────────────────────────────┤
│ P&L: +$375.00 (+1.7%)          │
│ Margin: $217.00                │
├────────────────────────────────┤
│ [View Chart] [Close Position]  │
└────────────────────────────────┘
```

**Visual States:**
- Profit: Green accent border
- Loss: Red accent border
- Near stop loss: Orange warning indicator

#### 6.1.7 Price Ticker Component

**Purpose:** Real-time price display

**Props:**
- symbol: string
- currentPrice: number
- change: number
- changePercent: number
- bid: number
- ask: number
- updateInterval: number (default 1000ms)

**Layout:**
```
EUR/USD
1.0875
+0.0025 (+0.23%) [▲]

Bid: 1.0873 | Ask: 1.0875
```

**Animation:**
- Flash green on price increase
- Flash red on price decrease
- Smooth number transitions

#### 6.1.8 Chart Component

**Integration:** TradingView Lightweight Charts or Recharts

**Features:**
- Multiple timeframes (1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w)
- Chart types (candlestick, line, bar)
- Technical indicators (MA, EMA, RSI, MACD, Bollinger Bands)
- Drawing tools (trendlines, support/resistance, Fibonacci)
- Zoom and pan
- Crosshair cursor
- Responsive container

**Props:**
- symbol: string
- interval: string
- indicators: IndicatorConfig[]
- height: number
- theme: 'light' | 'dark'

#### 6.1.9 Notification Toast Component

**Types:**
- success (green)
- error (red)
- warning (amber)
- info (blue)

**Props:**
- type: NotificationType
- title: string
- message: string
- duration: number (ms, default 5000)
- action: { label: string, onClick: () => void }
- closeable: boolean

**Position:** Top-right corner
**Animation:** Slide in from right, slide out after duration

#### 6.1.10 Navbar Component

**Desktop Layout:**
- Logo (left)
- Navigation links (center)
- User menu + notifications + language (right)

**Mobile Layout:**
- Hamburger menu (left)
- Logo (center)
- User avatar (right)
- Drawer menu from left

**Props:**
- user: User
- balance: number
- notifications: Notification[]
- onLogout: () => void

---

## 7. RESPONSIVE DESIGN

### 7.1 Breakpoint Strategy

**Mobile First Approach:**
```scss
// Base styles (mobile)
.container {
  padding: 1rem;
}

// Tablet and up
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
  }
}

// Desktop and up
@media (min-width: 1024px) {
  .container {
    padding: 2rem;
    max-width: 1280px;
  }
}
```

### 7.2 Layout Transformations

**Dashboard:**
- Mobile: Single column, cards stack vertically
- Tablet: 2-column grid for some widgets
- Desktop: 3-column layout with sidebar

**Trading Screen:**
- Mobile: 
  - Chart full width
  - Order panel in bottom sheet (slide up)
  - Market watch in separate tab
- Tablet:
  - Chart 70%, order panel 30% side-by-side
  - Market watch in collapsible sidebar
- Desktop:
  - 3-column: Market watch (20%), Chart (60%), Order panel (20%)
  - All visible simultaneously

**Tables:**
- Mobile: Card view (each row becomes a card)
- Tablet: Horizontal scroll with sticky first column
- Desktop: Full table view

### 7.3 Touch Target Sizes

**Minimum sizes (mobile):**
- Buttons: 44×44px
- Icon buttons: 48×48px
- Form inputs: 44px height
- Checkboxes/Radio: 24×24px with 44×44px touch area
- Sliders: 44px touch area

### 7.4 Typography Scaling

```css
/* Mobile */
--text-display: 2.5rem;   /* 40px */
--text-h1: 2rem;          /* 32px */
--text-h2: 1.5rem;        /* 24px */
--text-body: 1rem;        /* 16px */

/* Desktop */
@media (min-width: 1024px) {
  --text-display: 3.75rem; /* 60px */
  --text-h1: 3rem;         /* 48px */
  --text-h2: 2.25rem;      /* 36px */
  --text-body: 1rem;       /* 16px stays same */
}
```

---

## 8. ACCESSIBILITY

### 8.1 WCAG 2.1 AA Compliance

**Color Contrast:**
- Text: Minimum 4.5:1 ratio
- Large text (18pt+): Minimum 3:1 ratio
- UI components: Minimum 3:1 ratio

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Visible focus indicators (2px outline)
- Logical tab order
- Skip links for main content

**Screen Reader Support:**
- Semantic HTML (nav, main, article, aside)
- ARIA labels on icons
- ARIA live regions for dynamic content (price updates)
- Form labels properly associated

**Examples:**
```html
<!-- Price ticker with ARIA live region -->
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
>
  EUR/USD: $1.0875 <span class="sr-only">increased by</span> +0.0025
</div>

<!-- Button with accessible label -->
<button 
  aria-label="Close position EUR/USD BUY 1.5 lots"
  onClick={closePosition}
>
  <XIcon />
</button>

<!-- Form input -->
<label htmlFor="lot-size">
  Position Size (lots)
  <span aria-label="required">*</span>
</label>
<input 
  id="lot-size"
  type="number"
  aria-describedby="lot-size-help"
  aria-invalid={error ? "true" : "false"}
/>
<span id="lot-size-help">Minimum 0.01 lots</span>
{error && <span role="alert">{error}</span>}
```

### 8.2 Internationalization (i18n)

**Supported Languages:**
- English (en)
- Chinese Simplified (zh-CN)
- Japanese (ja)
- Korean (ko)
- Vietnamese (vi)
- Thai (th)

**Implementation:**
- React-i18next library
- Language switcher in header
- Store preference in localStorage + user profile
- Number/date formatting per locale
- RTL support (future: Arabic)

**Translation Keys Structure:**
```json
{
  "common": {
    "login": "Log In",
    "signup": "Sign Up",
    "logout": "Log Out"
  },
  "trading": {
    "buy": "Buy",
    "sell": "Sell",
    "openPosition": "Open Position",
    "closePosition": "Close Position"
  },
  "validation": {
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email"
  }
}
```

---

## 9. INTERACTION PATTERNS

### 9.1 Micro-interactions

**Button Click:**
- Scale down to 0.98 on press
- Ripple effect from click point
- Haptic feedback (mobile)

**Form Input Focus:**
- Border color transition (gray → blue)
- Label slides up and shrinks
- Helper text fades in

**Price Update:**
- Flash green (price up) or red (price down)
- Number count-up animation for large changes
- Subtle pulse effect

**Position Open:**
- Success checkmark animation
- Confetti for profitable close
- Slide-in notification toast

**Drag & Drop (Order Panel):**
- Draggable price levels on chart
- Ghost element follows cursor
- Snap to grid/support levels

### 9.2 Loading States

**Skeleton Screens:**
```
Dashboard loading:
┌────────────────────────┐
│ ████░░░░░░░  ████░░░░ │ (animated shimmer)
│ ████████░░░░░░░░      │
│ ░░░░░░████████        │
└────────────────────────┘
```

**Spinners:**
- Default: Rotating circle (primary color)
- Button: Smaller spinner, replaces text
- Page load: Centered, with logo

**Progress Indicators:**
- Registration: Step indicator (1/5, 2/5, etc.)
- File upload: Linear progress bar
- Chart loading: Skeleton candlesticks

### 9.3 Empty States

**No Positions:**
```
┌────────────────────────┐
│      [Chart Icon]      │
│                        │
│  No Open Positions     │
│  Start trading now!    │
│                        │
│    [Open Position]     │
└────────────────────────┘
```

**No History:**
```
Your trading history will appear here
once you close your first position.
```

**No Notifications:**
```
[Bell Icon]
All caught up!
No new notifications.
```

### 9.4 Error States

**Form Validation:**
- Inline error messages below input
- Red border on invalid input
- Icon indicator (X or warning triangle)

**API Errors:**
```
┌────────────────────────┐
│ [Error Icon]           │
│ Something went wrong   │
│ Please try again       │
│                        │
│ [Retry]  [Contact Us]  │
└────────────────────────┘
```

**Network Offline:**
```
[Offline Icon]
You're offline
Please check your connection
[Try Again]
```

### 9.5 Success States

**Position Opened:**
```
✓ Position Opened Successfully
EUR/USD BUY 1.5 lots at 1.0875
[View Position] [×]
```

**KYC Approved:**
```
🎉 Account Verified!
Your account has been approved.
$10,000 has been added to your balance.
[Start Trading]
```

---

## 10. ANIMATION GUIDELINES

### 10.1 Animation Principles

**Duration:**
- Micro-interactions: 100-200ms
- Transitions: 200-300ms
- Page transitions: 300-500ms
- Complex animations: 500-800ms

**Easing Functions:**
```css
/* Smooth acceleration */
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* Smooth deceleration */
--ease-out: cubic-bezier(0, 0, 0.2, 1);

/* Smooth both */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Spring/bounce */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 10.2 Key Animations

**Page Transition:**
```css
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 300ms ease-out;
}
```

**Modal Entrance:**
```css
.modal-backdrop {
  animation: fadeIn 200ms ease-out;
}
.modal-content {
  animation: slideUp 300ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Price Flash:**
```css
@keyframes priceUp {
  0% { background-color: transparent; }
  50% { background-color: rgba(34, 197, 94, 0.2); }
  100% { background-color: transparent; }
}

@keyframes priceDown {
  0% { background-color: transparent; }
  50% { background-color: rgba(239, 68, 68, 0.2); }
  100% { background-color: transparent; }
}

.price-increase {
  animation: priceUp 600ms ease-out;
}

.price-decrease {
  animation: priceDown 600ms ease-out;
}
```

**Skeleton Shimmer:**
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}
```

---

## 11. IMPLEMENTATION NOTES

### 11.1 Tech Stack Recommendations

**Frontend:**
- React 18+ with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Framer Motion (animations)
- React Query (data fetching)
- Zustand (state management)
- React Hook Form (forms)
- Zod (validation)
- TradingView Lightweight Charts
- Socket.io-client (WebSocket)

**Component Library:**
- Build custom components (design system above)
- Consider shadcn/ui as base (Radix UI primitives)
- Or Ant Design for rapid prototyping

### 11.2 Performance Optimization

**Code Splitting:**
```typescript
// Route-based splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Trading = lazy(() => import('./pages/Trading'));
const Admin = lazy(() => import('./pages/Admin'));

// Component-based splitting
const HeavyChart = lazy(() => import('./components/Chart'));
```

**Image Optimization:**
- WebP format with PNG fallback
- Lazy loading (intersection observer)
- Responsive images (srcset)
- CDN delivery

**Memoization:**
```typescript
// Expensive calculations
const calculatedMargin = useMemo(
  () => calculateRequiredMargin(size, leverage, price),
  [size, leverage, price]
);

// Callbacks
const handleSubmit = useCallback((data) => {
  submitOrder(data);
}, []);
```

**Virtual Scrolling:**
- For large position lists (>100 items)
- Use react-virtual or react-window

### 11.3 Testing Strategy

**Unit Tests:**
- Component rendering
- User interactions (click, input)
- Business logic functions
- Tool: Vitest + Testing Library

**Integration Tests:**
- API integration
- WebSocket connection
- Form submissions
- Tool: Vitest + MSW (Mock Service Worker)

**E2E Tests:**
- Critical user flows
- Registration → KYC → Trading
- Tool: Playwright or Cypress

**Visual Regression:**
- Screenshot comparison
- Tool: Percy or Chromatic

---

## 12. HANDOFF TO DEVELOPMENT

### 12.1 Design Assets Export

**Figma/Sketch:**
- Export all mockups at 1x, 2x, 3x
- SVG icons
- Color palette swatches
- Typography scale

**Developer Resources:**
- Design tokens (JSON)
- Component specifications (Storybook)
- Animation specifications (Lottie files)

### 12.2 Design Review Process

**Milestones:**
1. Lo-fi wireframes review
2. Hi-fi mockups review
3. Interactive prototype review
4. Development QA (design verification)

**Sign-off Checklist:**
- ✅ All screens designed
- ✅ All states covered (loading, error, empty)
- ✅ Responsive layouts defined
- ✅ Accessibility requirements met
- ✅ Animation specs documented
- ✅ Design system complete

---

## APPENDIX

### A. Glossary of UI Terms

**Glassmorphism:** Frosted glass effect with blur and transparency
**Neumorphism:** Soft shadows creating 3D raised/pressed effects
**Skeleton Screen:** Placeholder UI during content loading
**Progressive Disclosure:** Revealing complex features gradually
**Affordance:** Visual clue indicating how to interact with element

### B. Design Tools

- Figma (UI Design)
- Framer (Prototyping)
- Principle (Animation)
- Zeplin (Handoff)
- Storybook (Component library)

### C. Inspiration Sources

- Dribbble (Trading platform designs)
- Behance (Financial dashboards)
- eToro, TradingView, Robinhood (Competitor analysis)
- Material Design, Apple HIG (Design systems)

---

**END OF UI/UX DESIGN DOCUMENT**

This document provides comprehensive wireframes, user flows, and specifications. Next steps:
1. Create interactive prototypes (Figma/Framer)
2. Build component library (React + Storybook)
3. Implement responsive layouts
4. Conduct usability testing

**Document Version:** 1.0  
**Last Updated:** February 4, 2026
