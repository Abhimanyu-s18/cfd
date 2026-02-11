# CFD Trading Platform - Technical Architecture Document
**Version:** 1.0  
**Date:** February 4, 2026  
**Related Documents:** Requirements Document v1.0  

---

## EXECUTIVE SUMMARY

This document provides the complete technical blueprint for building the CFD trading platform. It covers technology stack, system architecture, database design, API specifications, authentication, market data integration, real-time communication, security, deployment, and development setup.

**Key Technologies:**
- **Frontend:** React.js + TypeScript + TailwindCSS + Vite
- **Backend:** Node.js + Express.js + TypeScript + Prisma ORM
- **Database:** PostgreSQL (Supabase free tier)
- **Cache:** Redis (Upstash free tier)
- **Storage:** Supabase Storage (KYC documents)
- **Real-time:** Socket.io
- **Deployment:** Vercel (frontend) + Railway (backend)

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### High-Level Architecture

\`\`\`
┌──────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  React App (Web) + Admin Panel + Future Mobile Apps     │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTPS/WSS
┌───────────────────────▼──────────────────────────────────┐
│              APPLICATION LAYER                           │
│  Node.js + Express.js API Server                         │
│  • REST API Endpoints                                    │
│  • WebSocket Server (Socket.io)                          │
│  • Business Logic Services                               │
│    - Trading Engine                                      │
│    - Risk Management                                     │
│    - KYC Service                                         │
│    - Market Data Service                                 │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│                  DATA LAYER                              │
│  PostgreSQL + Redis + Supabase Storage                   │
└──────────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│            EXTERNAL SERVICES                             │
│  AlphaVantage + yFinance + Google/Apple OAuth            │
└──────────────────────────────────────────────────────────┘
\`\`\`

### Request Flow Example

1. User clicks "Buy EUR/USD"
2. Frontend sends POST `/api/orders` with JWT token
3. Middleware validates JWT, extracts user_id
4. Trading Service validates: margin, KYC status, position limits
5. Get current price from Redis cache (or fetch from AlphaVantage)
6. Calculate required margin with leverage
7. Create position in PostgreSQL
8. Emit WebSocket event to user
9. Return success response

---

## 2. COMPLETE DATABASE SCHEMA

See the full Prisma schema below with all tables, relationships, and indexes:

### Core Tables:

**users** - User accounts and profile information
**accounts** - Trading account balances and leverage settings
**positions** - Open and closed trading positions
**transactions** - Fund movements and trade P&L
**kyc_documents** - KYC verification documents and status
**notifications** - In-app notifications
**admin_actions** - Audit log of admin operations
**login_history** - User login tracking
**instruments** - Tradable instruments (static data)
**price_data** - Historical price/OHLC data
**admin_users** - Admin account management

### Prisma Schema (schema.prisma):

\`\`\`prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  phone               String?   @unique
  passwordHash        String?
  
  firstName           String
  lastName            String
  city                String
  country             String
  preferredLanguage   String    @default("en")
  dateOfBirth         DateTime
  
  tradingExperience   TradingExperience
  primaryGoal         String?   @db.Text
  timeCommitment      String?
  investmentCapacity  String?
  lossAmount          Decimal?  @db.Decimal(15, 2)
  
  kycStatus           KycStatus @default(NOT_SUBMITTED)
  accountStatus       AccountStatus @default(ACTIVE)
  suspensionUntil     DateTime?
  suspensionReason    String?   @db.Text
  
  googleId            String?   @unique
  appleId             String?   @unique
  
  emailVerified       Boolean   @default(false)
  acceptedTerms       Boolean   @default(false)
  marketingOptIn      Boolean   @default(false)
  lastLoginAt         DateTime?
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  account             Account?
  positions           Position[]
  transactions        Transaction[]
  kycDocuments        KycDocument[]
  notifications       Notification[]
  loginHistory        LoginHistory[]
  adminActions        AdminAction[]
  
  @@index([email])
  @@index([kycStatus])
  @@index([accountStatus])
  @@map("users")
}

enum TradingExperience {
  BEGINNER
  INTERMEDIATE
  TRADER
  EXPERIENCED
}

enum KycStatus {
  NOT_SUBMITTED
  PENDING
  APPROVED
  REJECTED
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
  BANNED
}

model Account {
  id                  String    @id @default(uuid())
  userId              String    @unique
  
  balance             Decimal   @default(0) @db.Decimal(15, 2)
  bonus               Decimal   @default(0) @db.Decimal(15, 2)
  currency            String    @default("USD")
  
  equity              Decimal   @default(0) @db.Decimal(15, 2)
  usedMargin          Decimal   @default(0) @db.Decimal(15, 2)
  freeMargin          Decimal   @default(0) @db.Decimal(15, 2)
  marginLevel         Decimal   @default(0) @db.Decimal(10, 2)
  
  leverageForex       Int       @default(500)
  leverageCommodities Int       @default(100)
  leverageIndices     Int       @default(200)
  leverageCrypto      Int       @default(50)
  leverageStocks      Int       @default(20)
  
  maxPositions        Int       @default(100)
  maxLotSize          Decimal   @default(50) @db.Decimal(10, 2)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("accounts")
}

model Position {
  id                  String    @id @default(uuid())
  userId              String
  
  symbol              String
  assetClass          AssetClass
  type                PositionType
  orderType           OrderType
  size                Decimal   @db.Decimal(15, 5)
  leverage            Int
  
  entryPrice          Decimal   @db.Decimal(15, 5)
  currentPrice        Decimal?  @db.Decimal(15, 5)
  stopLoss            Decimal?  @db.Decimal(15, 5)
  takeProfit          Decimal?  @db.Decimal(15, 5)
  
  marginUsed          Decimal   @db.Decimal(15, 2)
  unrealizedPnL       Decimal   @default(0) @db.Decimal(15, 2)
  realizedPnL         Decimal?  @db.Decimal(15, 2)
  
  swapFee             Decimal   @default(0) @db.Decimal(15, 2)
  commissionFee       Decimal   @default(0) @db.Decimal(15, 2)
  
  status              PositionStatus @default(OPEN)
  
  closedAt            DateTime?
  closedPrice         Decimal?  @db.Decimal(15, 5)
  closedBy            ClosedBy?
  closeReason         String?   @db.Text
  adminCloseComment   String?   @db.Text
  adminUserId         String?
  
  openedAt            DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
  @@index([symbol])
  @@map("positions")
}

enum AssetClass {
  FOREX
  COMMODITY
  INDEX
  CRYPTO
  STOCK
}

enum PositionType {
  BUY
  SELL
}

enum OrderType {
  MARKET
  LIMIT
}

enum PositionStatus {
  PENDING
  OPEN
  CLOSED
}

enum ClosedBy {
  USER
  ADMIN
  STOP_LOSS
  TAKE_PROFIT
  MARGIN_CALL
}

model Transaction {
  id                  String    @id @default(uuid())
  userId              String
  type                TransactionType
  amount              Decimal   @db.Decimal(15, 2)
  balanceBefore       Decimal   @db.Decimal(15, 2)
  balanceAfter        Decimal   @db.Decimal(15, 2)
  bonusBefore         Decimal?  @db.Decimal(15, 2)
  bonusAfter          Decimal?  @db.Decimal(15, 2)
  positionId          String?
  adminUserId         String?
  reason              String?   @db.Text
  comment             String?   @db.Text
  createdAt           DateTime  @default(now())
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([type])
  @@index([createdAt])
  @@map("transactions")
}

enum TransactionType {
  BALANCE_ADD
  BALANCE_REMOVE
  BONUS_ADD
  BONUS_REMOVE
  TRADE_PROFIT
  TRADE_LOSS
  COMMISSION
  SWAP
}

model KycDocument {
  id                  String    @id @default(uuid())
  userId              String
  identityDocType     IdentityDocType
  identityFrontUrl    String
  identityBackUrl     String?
  addressDocType      AddressDocType
  addressDocUrl       String
  status              KycStatus @default(PENDING)
  reviewedBy          String?
  reviewedAt          DateTime?
  adminComment        String?   @db.Text
  rejectionReason     String?   @db.Text
  submittedAt         DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
  @@map("kyc_documents")
}

enum IdentityDocType {
  NATIONAL_ID
  PASSPORT
  DRIVERS_LICENSE
}

enum AddressDocType {
  UTILITY_BILL
  BANK_STATEMENT
  GOVT_DOCUMENT
  RENTAL_AGREEMENT
}

model Notification {
  id                  String    @id @default(uuid())
  userId              String
  type                NotificationType
  title               String
  message             String    @db.Text
  relatedId           String?
  isRead              Boolean   @default(false)
  createdAt           DateTime  @default(now())
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isRead])
  @@map("notifications")
}

enum NotificationType {
  KYC_APPROVED
  KYC_REJECTED
  POSITION_OPENED
  POSITION_CLOSED
  MARGIN_CALL
  STOP_LOSS_HIT
  TAKE_PROFIT_HIT
  FUND_ADDED
  FUND_REMOVED
  ACCOUNT_SUSPENDED
  SYSTEM_ALERT
}

model AdminAction {
  id                  String    @id @default(uuid())
  adminUserId         String
  targetUserId        String
  actionType          AdminActionType
  actionDetails       String    @db.Text
  reason              String?   @db.Text
  valueBefore         String?   @db.JsonB
  valueAfter          String?   @db.JsonB
  createdAt           DateTime  @default(now())
  targetUser          User      @relation(fields: [targetUserId], references: [id], onDelete: Cascade)
  
  @@index([adminUserId])
  @@index([targetUserId])
  @@map("admin_actions")
}

enum AdminActionType {
  ADD_FUNDS
  REMOVE_FUNDS
  ADD_BONUS
  REMOVE_BONUS
  APPROVE_KYC
  REJECT_KYC
  CLOSE_POSITION
  ADJUST_LEVERAGE
  SUSPEND_USER
  BAN_USER
}

model LoginHistory {
  id                  String    @id @default(uuid())
  userId              String
  ipAddress           String
  userAgent           String?   @db.Text
  location            String?
  success             Boolean
  failureReason       String?
  createdAt           DateTime  @default(now())
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("login_history")
}

model Instrument {
  id                  String    @id @default(uuid())
  symbol              String    @unique
  name                String
  assetClass          AssetClass
  minLotSize          Decimal   @db.Decimal(10, 5)
  maxLotSize          Decimal   @db.Decimal(10, 5)
  lotStep             Decimal   @db.Decimal(10, 5)
  pipValue            Decimal?  @db.Decimal(10, 5)
  defaultLeverage     Int
  maxLeverage         Int
  tradingHours        String    @db.JsonB
  isActive            Boolean   @default(true)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([symbol])
  @@map("instruments")
}

model PriceData {
  id                  String    @id @default(uuid())
  symbol              String
  timestamp           DateTime
  open                Decimal   @db.Decimal(15, 5)
  high                Decimal   @db.Decimal(15, 5)
  low                 Decimal   @db.Decimal(15, 5)
  close               Decimal   @db.Decimal(15, 5)
  volume              Decimal?  @db.Decimal(20, 2)
  interval            String
  
  @@unique([symbol, timestamp, interval])
  @@index([symbol, interval, timestamp])
  @@map("price_data")
}

model AdminUser {
  id                  String    @id @default(uuid())
  email               String    @unique
  passwordHash        String
  name                String
  role                AdminRole @default(SUPPORT)
  isActive            Boolean   @default(true)
  lastLoginAt         DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([email])
  @@map("admin_users")
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  SUPPORT
}
\`\`\`

---

## 3. COMPLETE API ENDPOINTS

### Authentication Endpoints

**POST `/api/v1/auth/register`** - Multi-step registration
**POST `/api/v1/auth/login`** - Email/password login
**POST `/api/v1/auth/google`** - Google OAuth
**POST `/api/v1/auth/apple`** - Apple Sign-In
**POST `/api/v1/auth/refresh`** - Refresh access token
**POST `/api/v1/auth/logout`** - Logout

### Trading Endpoints

**GET `/api/v1/instruments`** - Get tradable instruments
**GET `/api/v1/prices/:symbol`** - Get real-time price
**POST `/api/v1/orders`** - Place order (market/limit)
**GET `/api/v1/positions`** - Get user positions
**PUT `/api/v1/positions/:id/close`** - Close position
**PUT `/api/v1/positions/:id/modify`** - Modify SL/TP

### Account Endpoints

**GET `/api/v1/account`** - Get account details
**GET `/api/v1/account/history`** - Get trade history
**GET `/api/v1/account/transactions`** - Get fund movements

### KYC Endpoints

**POST `/api/v1/kyc/upload`** - Upload KYC documents
**GET `/api/v1/kyc/status`** - Get KYC status

### Admin Endpoints

**GET `/api/v1/admin/users`** - List all users
**PUT `/api/v1/admin/users/:id/funds`** - Add/remove funds
**PUT `/api/v1/admin/users/:id/bonus`** - Add/remove bonus
**PUT `/api/v1/admin/users/:id/leverage`** - Adjust leverage
**PUT `/api/v1/admin/users/:id/status`** - Ban/suspend user
**GET `/api/v1/admin/kyc/queue`** - KYC review queue
**PUT `/api/v1/admin/kyc/:id`** - Approve/reject KYC
**GET `/api/v1/admin/positions`** - View all positions
**PUT `/api/v1/admin/positions/:id/close`** - Close position (admin)
**GET `/api/v1/admin/reports`** - Generate reports

### API Response Format

\`\`\`json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_MARGIN",
    "message": "Not enough margin",
    "details": { ... }
  }
}
\`\`\`

---

## 4. BACKEND DIRECTORY STRUCTURE

\`\`\`
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── passport.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── trading.types.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   └── errorHandler.middleware.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── trading.controller.ts
│   │   ├── account.controller.ts
│   │   ├── kyc.controller.ts
│   │   └── admin.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── trading.service.ts
│   │   ├── riskManagement.service.ts
│   │   ├── marketData.service.ts
│   │   ├── kyc.service.ts
│   │   ├── admin.service.ts
│   │   ├── notification.service.ts
│   │   └── reporting.service.ts
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── account.repository.ts
│   │   └── position.repository.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── trading.routes.ts
│   │   ├── account.routes.ts
│   │   ├── kyc.routes.ts
│   │   ├── admin.routes.ts
│   │   └── index.ts
│   ├── jobs/
│   │   ├── priceUpdater.job.ts
│   │   ├── marginChecker.job.ts
│   │   └── reportGenerator.job.ts
│   ├── websocket/
│   │   ├── server.ts
│   │   └── handlers/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── app.ts
│   └── server.ts
├── tests/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
\`\`\`

---

## 5. FRONTEND DIRECTORY STRUCTURE

\`\`\`
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── trading/
│   │   │   ├── TradingChart.tsx
│   │   │   ├── OrderPanel.tsx
│   │   │   └── PositionTable.tsx
│   │   └── admin/
│   │       ├── UserManagement.tsx
│   │       └── KYCReview.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Trading.tsx
│   │   └── admin/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWebSocket.ts
│   │   └── useTradingData.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── tradingStore.ts
│   │   └── marketStore.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── websocket.ts
│   │   └── endpoints/
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── calculations.ts
│   ├── types/
│   │   └── *.types.ts
│   ├── constants/
│   │   ├── instruments.ts
│   │   └── config.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
\`\`\`

---

## 6. AUTHENTICATION FLOW

### JWT Token Structure

\`\`\`json
// Access Token (15 min)
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1706876400,
  "exp": 1706877300
}

// Refresh Token (7 days)
{
  "sub": "user_uuid",
  "type": "refresh",
  "iat": 1706876400,
  "exp": 1707481200
}
\`\`\`

### Authentication Middleware

\`\`\`typescript
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.substring(7);
  if (!token) return res.status(401).json({ error: 'No token' });
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = { id: decoded.sub, email: decoded.email };
  next();
};
\`\`\`

---

## 7. MARKET DATA INTEGRATION

### AlphaVantage Service

\`\`\`typescript
async getPrice(symbol: string): Promise<PriceData> {
  // 1. Check Redis cache (TTL: 2 seconds)
  const cached = await redis.get(\`price:\${symbol}\`);
  if (cached) return JSON.parse(cached);
  
  // 2. Check rate limit (5 req/min)
  if (this.requestCount >= 5) {
    return this.getPriceFromYFinance(symbol);
  }
  
  // 3. Fetch from AlphaVantage
  const price = await this.fetchFromAlphaVantage(symbol);
  
  // 4. Cache result
  await redis.setex(\`price:\${symbol}\`, 2, JSON.stringify(price));
  
  return price;
}
\`\`\`

### yFinance Fallback Scraper

\`\`\`typescript
async getPrice(symbol: string): Promise<PriceData> {
  const url = \`https://finance.yahoo.com/quote/\${symbol}\`;
  const response = await axios.get(url, {
    headers: { 'User-Agent': this.getRandomUserAgent() }
  });
  
  const $ = cheerio.load(response.data);
  const price = parseFloat($('fin-streamer').first().text());
  
  return {
    symbol,
    bid: price - spread/2,
    ask: price + spread/2,
    timestamp: new Date().toISOString()
  };
}
\`\`\`

### Price Update Background Job

Runs every 5 seconds to update prices for instruments with open positions:

\`\`\`typescript
cron.schedule('*/5 * * * * *', async () => {
  const symbols = await getActiveSymbols();
  for (const symbol of symbols) {
    const price = await marketDataService.getPrice(symbol);
    io.to(\`price:\${symbol}\`).emit('price_update', price);
    await updatePositionPrices(symbol, price);
  }
});
\`\`\`

---

## 8. WEBSOCKET REAL-TIME COMMUNICATION

### Server Setup

\`\`\`typescript
import { Server } from 'socket.io';

export const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL }
});

// Auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.data.userId = decoded.sub;
  next();
});

io.on('connection', (socket) => {
  socket.join(\`user:\${socket.data.userId}\`);
  
  socket.on('subscribe_prices', (symbols) => {
    symbols.forEach(symbol => socket.join(\`price:\${symbol}\`));
  });
});
\`\`\`

### Client Usage

\`\`\`typescript
import { io } from 'socket.io-client';

const socket = io(API_URL, { auth: { token } });

socket.on('price_update', (data) => {
  // Update UI with new price
});

socket.on('position_update', (data) => {
  // Update position P&L
});

socket.emit('subscribe_prices', ['EURUSD', 'BTCUSD']);
\`\`\`

---

## 9. DEPLOYMENT CONFIGURATION

### Environment Variables

**Backend (.env):**
\`\`\`bash
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
REDIS_URL="redis://host:port"
JWT_SECRET="your-secret-min-32-chars"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="your-key"
ALPHA_VANTAGE_API_KEY="your-key"
GOOGLE_CLIENT_ID="your-id"
GOOGLE_CLIENT_SECRET="your-secret"
FRONTEND_URL="https://yourplatform.com"
\`\`\`

**Frontend (.env):**
\`\`\`bash
VITE_API_URL="https://api.yourplatform.com"
VITE_WS_URL="wss://api.yourplatform.com"
\`\`\`

### Hosting Setup

**Frontend (Vercel):**
- Auto-deploy from main branch
- Zero config for Vite projects
- Free SSL certificate
- Global CDN

**Backend (Railway):**
- Auto-deploy from main branch
- Free $5 credit/month
- PostgreSQL included
- Automatic health checks

**Database (Supabase):**
- 500MB free tier
- Automatic backups
- Built-in auth (optional)

**Redis (Upstash):**
- 10,000 commands/day free
- Global edge network
- REST API option

---

## 10. SECURITY IMPLEMENTATION

### Security Checklist

✅ HTTPS only (SSL certificates)
✅ JWT token expiry (15 min access, 7 day refresh)
✅ Rate limiting (5 auth attempts per 15 min)
✅ Input validation (Zod schemas)
✅ SQL injection prevention (Prisma ORM)
✅ XSS prevention (DOMPurify on frontend)
✅ CSRF protection (SameSite cookies)
✅ Helmet security headers
✅ Password hashing (bcrypt with 10 rounds)
✅ File upload restrictions (5MB, image/PDF only)
✅ KYC document encryption (Supabase Storage)

### Rate Limiting

\`\`\`typescript
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

export const tradingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Trading rate limit exceeded'
});
\`\`\`

---

## 11. LOCAL DEVELOPMENT SETUP

### Prerequisites
- Node.js 20.x LTS
- PostgreSQL 16+ or Supabase account
- Redis 7.x or Upstash account

### Setup Steps

\`\`\`bash
# 1. Clone repository
git clone https://github.com/yourorg/cfd-platform.git
cd cfd-platform

# 2. Install backend dependencies
cd backend
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Run database migrations
npx prisma migrate dev
npx prisma db seed

# 5. Install frontend dependencies
cd ../frontend
npm install
cp .env.example .env

# 6. Start development servers
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)
cd frontend
npm run dev
\`\`\`

### Access URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

---

## 12. TESTING STRATEGY

### Test Types

**Unit Tests (Vitest):**
\`\`\`typescript
describe('TradingService', () => {
  it('should calculate margin correctly', () => {
    const margin = calculateMargin(1.5, 500, 100000);
    expect(margin).toBe(300);
  });
});
\`\`\`

**Integration Tests (Supertest):**
\`\`\`typescript
describe('POST /api/orders', () => {
  it('should create position', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', \`Bearer \${token}\`)
      .send({ symbol: 'EURUSD', type: 'BUY', size: 1 });
    
    expect(res.status).toBe(201);
    expect(res.body.data.position).toBeDefined();
  });
});
\`\`\`

**E2E Tests (Playwright - Future):**
- User registration flow
- Place trade and close position
- Admin KYC approval

---

## 13. PERFORMANCE OPTIMIZATION

### Database Optimization

\`\`\`typescript
// ❌ N+1 Problem
const users = await prisma.user.findMany();
for (const user of users) {
  const account = await prisma.account.findUnique({ where: { userId: user.id } });
}

// ✅ Optimized with Include
const users = await prisma.user.findMany({
  include: { account: true }
});
\`\`\`

### Caching Strategy

\`\`\`typescript
async function getInstruments() {
  const cached = await redis.get('instruments:all');
  if (cached) return JSON.parse(cached);
  
  const instruments = await prisma.instrument.findMany();
  await redis.setex('instruments:all', 3600, JSON.stringify(instruments));
  return instruments;
}
\`\`\`

### Frontend Optimization

\`\`\`typescript
// Code splitting
const AdminPanel = lazy(() => import('./pages/admin/Dashboard'));

// Debouncing
const updateChart = debounce((data) => {
  // Update chart
}, 500);
\`\`\`

---

## 14. BACKGROUND JOBS

### Price Updater (Every 5 seconds)
Updates prices for active instruments and checks SL/TP

### Margin Checker (Every 10 seconds)
Monitors margin levels, triggers margin calls, executes stop-outs

### Daily Report Generator (00:00 UTC)
Generates daily analytics reports for admins

### KYC Document Cleaner (Weekly)
Deletes rejected KYC documents older than 90 days

---

## 15. ERROR HANDLING

### Custom Error Classes

\`\`\`typescript
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export class InsufficientMarginError extends AppError {
  constructor(required: number, available: number) {
    super('INSUFFICIENT_MARGIN', 'Not enough margin', 400);
  }
}
\`\`\`

### Global Error Handler

\`\`\`typescript
app.use((err, req, res, next) => {
  logger.error({ error: err, url: req.url });
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code,
      message: err.message
    }
  });
});
\`\`\`

---

## APPENDIX

### Technology Comparison

| Category | Choice | Alternative | Reason |
|----------|--------|-------------|--------|
| Frontend | React | Vue.js | Larger ecosystem |
| Backend | Express | Fastify | More middleware |
| Database | PostgreSQL | MySQL | Better JSON support |
| ORM | Prisma | TypeORM | Type-safe |
| Cache | Redis | Memcached | Pub/sub support |

### Performance Targets

- API Response: < 200ms (p95)
- WebSocket Latency: < 50ms
- Database Query: < 100ms (p95)
- Page Load: < 3 seconds

### Next Steps

1. ✅ Requirements Document complete
2. ✅ Technical Architecture complete
3. ⏭️ UI/UX Wireframes (next)
4. ⏭️ Development Roadmap
5. ⏭️ Begin development

---

**END OF TECHNICAL ARCHITECTURE DOCUMENT**
