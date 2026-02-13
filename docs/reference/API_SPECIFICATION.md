# API Specification - CFD Trading Platform

**Version:** 1.0.0  
**Date:** February 13, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Account Endpoints](#account-endpoints)
4. [Trading Endpoints](#trading-endpoints)
5. [Market Data Endpoints](#market-data-endpoints)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Overview

### Base URL
```
Production: https://api.cfdtrading.com
Development: http://localhost:3000/api
```

### API Version
- Current version: `v1`
- All endpoints include version in path: `/api/v1/*`

### Response Format
All responses returned as JSON with standard envelope:

```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null,
  "timestamp": "2026-02-13T10:30:00Z"
}
```

### Authentication
All endpoints except `/auth/register` and `/auth/login` require JWT token in Authorization header:

```
Authorization: Bearer {token}
```

---

## Authentication

### Register User

**Endpoint:** `POST /api/v1/auth/register`

**Description:** Create new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "user-123abc",
    "email": "user@example.com",
    "createdAt": "2026-02-13T10:30:00Z"
  }
}
```

**Errors:**
- `400` - Invalid email or password
- `409` - User already exists
- `422` - Validation error

---

### Login User

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Authenticate user and receive JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "userId": "user-123abc",
      "email": "user@example.com"
    }
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `404` - User not found

---

### Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Description:** Get new token (old token expires in 24 hours)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token",
    "expiresIn": 86400
  }
}
```

---

### Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Description:** Invalidate current token

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

---

## Account Endpoints

### Create Account

**Endpoint:** `POST /api/v1/account/create`

**Description:** Create trading account with initial virtual balance

**Request:** (No body required - uses user from token)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "accountId": "acc-456def",
    "userId": "user-123abc",
    "balance": 10000.00,
    "bonus": 0.00,
    "equity": 10000.00,
    "marginUsed": 0.00,
    "freeMargin": 10000.00,
    "marginLevel": 0.00,
    "createdAt": "2026-02-13T10:30:00Z"
  }
}
```

**Errors:**
- `401` - Unauthorized
- `409` - Account already exists

---

### Get Account Statistics

**Endpoint:** `GET /api/v1/account/stats`

**Description:** Get current account values and margin metrics

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accountId": "acc-456def",
    "balance": 10000.00,
    "bonus": 0.00,
    "equity": 9850.50,
    "marginUsed": 152.35,
    "freeMargin": 9698.15,
    "marginLevel": 64.68,
    "totalPnL": -149.50,
    "positions": {
      "open": 2,
      "total": 5
    },
    "lastUpdate": "2026-02-13T10:30:00Z"
  }
}
```

**Formulas:**
```
Equity = Balance + Bonus + UnrealizedPnL
FreeMargin = Equity - MarginUsed
MarginLevel = (Equity / MarginUsed) × 100
```

---

### Add Funds to Account

**Endpoint:** `POST /api/v1/account/add-funds`

**Description:** Add virtual funds to account (admin or demo allocation)

**Request:**
```json
{
  "amount": 5000.00
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accountId": "acc-456def",
    "previousBalance": 10000.00,
    "amountAdded": 5000.00,
    "newBalance": 15000.00,
    "newEquity": 15000.00,
    "timestamp": "2026-02-13T10:31:00Z"
  }
}
```

**Errors:**
- `400` - Invalid amount
- `401` - Unauthorized

---

### Add Bonus to Account

**Endpoint:** `POST /api/v1/account/add-bonus`

**Description:** Add bonus funds (separate from balance)

**Request:**
```json
{
  "amount": 1000.00,
  "reason": "Referral bonus"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accountId": "acc-456def",
    "previousBonus": 0.00,
    "bonusAdded": 1000.00,
    "newBonus": 1000.00,
    "newEquity": 11000.00,
    "timestamp": "2026-02-13T10:31:00Z"
  }
}
```

---

## Trading Endpoints

### Open Position

**Endpoint:** `POST /api/v1/trade/open-position`

**Description:** Open new trading position (LONG or SHORT)

**Request:**
```json
{
  "instrument": "EUR/USD",
  "direction": "LONG",
  "size": 1.5,
  "leverage": 100,
  "stopLoss": 1.0820,
  "takeProfit": 1.0900
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "positionId": "pos-789ghi",
    "accountId": "acc-456def",
    "instrument": "EUR/USD",
    "direction": "LONG",
    "size": 1.5,
    "entryPrice": 1.0850,
    "currentPrice": 1.0850,
    "marginRequired": 16.275,
    "stopLoss": 1.0820,
    "takeProfit": 1.0900,
    "unrealizedPnL": 0.00,
    "status": "OPEN",
    "openedAt": "2026-02-13T10:30:00Z"
  }
}
```

**Errors:**
- `400` - Invalid parameters
- `403` - Insufficient margin
- `422` - Validation error

**Validation:**
- Size must be > 0
- Leverage must be between 1 and 500
- SL and TP must be on correct side of entry price

---

### Get Open Positions

**Endpoint:** `GET /api/v1/trade/positions`

**Description:** Get all open positions for account

**Query Parameters:**
```
?status=OPEN        // Filter: OPEN, CLOSED, PENDING
?instrument=EUR/USD // Filter by instrument
?limit=50           // Max results (default: 50)
?offset=0           // Pagination offset
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "positions": [
      {
        "positionId": "pos-789ghi",
        "instrument": "EUR/USD",
        "direction": "LONG",
        "size": 1.5,
        "entryPrice": 1.0850,
        "currentPrice": 1.0875,
        "marginRequired": 16.275,
        "unrealizedPnL": 0.375,
        "status": "OPEN",
        "stopLoss": 1.0820,
        "takeProfit": 1.0900,
        "openedAt": "2026-02-13T10:30:00Z"
      }
    ],
    "total": 1,
    "openCount": 1,
    "closedCount": 0
  }
}
```

---

### Get Position Details

**Endpoint:** `GET /api/v1/trade/positions/{positionId}`

**Description:** Get specific position details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "positionId": "pos-789ghi",
    "accountId": "acc-456def",
    "instrument": "EUR/USD",
    "direction": "LONG",
    "size": 1.5,
    "entryPrice": 1.0850,
    "currentPrice": 1.0875,
    "marginRequired": 16.275,
    "unrealizedPnL": 0.375,
    "pnlPercent": 0.0345,
    "status": "OPEN",
    "stopLoss": 1.0820,
    "takeProfit": 1.0900,
    "openedAt": "2026-02-13T10:30:00Z",
    "closedAt": null,
    "closePrice": null,
    "realizedPnL": null
  }
}
```

**Errors:**
- `404` - Position not found

---

### Close Position

**Endpoint:** `POST /api/v1/trade/positions/{positionId}/close`

**Description:** Close open position at current market price

**Response (200):**
```json
{
  "success": true,
  "data": {
    "positionId": "pos-789ghi",
    "instrument": "EUR/USD",
    "size": 1.5,
    "entryPrice": 1.0850,
    "closePrice": 1.0875,
    "realizedPnL": 0.375,
    "closedAt": "2026-02-13T10:31:00Z",
    "accountId": "acc-456def",
    "newBalance": 10000.375,
    "newEquity": 10000.375
  }
}
```

**Errors:**
- `404` - Position not found
- `409` - Position already closed

---

### Modify Position (SL/TP)

**Endpoint:** `PUT /api/v1/trade/positions/{positionId}`

**Description:** Update stop loss and/or take profit

**Request:**
```json
{
  "stopLoss": 1.0830,
  "takeProfit": 1.0920
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "positionId": "pos-789ghi",
    "stopLoss": 1.0830,
    "takeProfit": 1.0920,
    "updatedAt": "2026-02-13T10:31:00Z"
  }
}
```

**Validation:**
- SL must be below entry price for LONG
- SL must be above entry price for SHORT
- Same validation for TP (opposite side)

---

### Partial Close Position

**Endpoint:** `POST /api/v1/trade/positions/{positionId}/partial-close`

**Description:** Close part of a position

**Request:**
```json
{
  "sizeToClose": 0.75
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "closedPositionId": "pos-closed-123",
    "remainingPositionId": "pos-789ghi",
    "closedSize": 0.75,
    "remainingSize": 0.75,
    "realizedPnL": 0.1875,
    "unrealizedPnL": 0.1875
  }
}
```

---

## Market Data Endpoints

### Get Current Price

**Endpoint:** `GET /api/v1/market/price/{instrument}`

**Description:** Get current market price for instrument

**Response (200):**
```json
{
  "success": true,
  "data": {
    "instrument": "EUR/USD",
    "bid": 1.0848,
    "ask": 1.0850,
    "last": 1.0849,
    "high": 1.0900,
    "low": 1.0800,
    "change": 0.0025,
    "changePercent": 0.23,
    "timestamp": "2026-02-13T10:30:00Z"
  }
}
```

---

### Get Instrument Details

**Endpoint:** `GET /api/v1/market/instruments`

**Description:** Get list of available trading instruments

**Response (200):**
```json
{
  "success": true,
  "data": {
    "instruments": [
      {
        "symbol": "EUR/USD",
        "name": "Euro vs US Dollar",
        "category": "Forex",
        "minSize": 0.01,
        "maxSize": 1000,
        "spread": 0.0002,
        "minLeverage": 1,
        "maxLeverage": 500
      }
    ]
  }
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INSUFFICIENT_MARGIN",
    "message": "Not enough margin to open this position",
    "details": {
      "required": 152.50,
      "available": 100.00,
      "shortfall": 52.50
    }
  }
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_CREDENTIALS | 401 | Email or password incorrect |
| UNAUTHORIZED | 401 | Missing or invalid token |
| INSUFFICIENT_MARGIN | 403 | Not enough margin to open position |
| POSITION_NOT_FOUND | 404 | Position ID doesn't exist |
| INVALID_PARAMETERS | 400 | Request parameters invalid |
| USER_ALREADY_EXISTS | 409 | User with email already exists |
| ACCOUNT_ALREADY_EXISTS | 409 | User already has account |
| POSITION_ALREADY_CLOSED | 409 | Cannot close already-closed position |
| VALIDATION_ERROR | 422 | Data validation failed |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

### Limits

```
- Anonymous endpoints: 60 requests/minute
- Authenticated endpoints: 300 requests/minute
- Trading endpoints: 100 position changes/minute
```

### Rate Limit Headers

```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1644755460
```

---

## Calculation Formulas

### Margin Required
```
MarginRequired = (Size × Price) / Leverage
```

### Equity
```
Equity = Balance + Bonus + UnrealizedPnL
```

### Free Margin
```
FreeMargin = Equity - MarginUsed
```

### Margin Level
```
MarginLevel = (Equity / MarginUsed) × 100
```

### PnL (LONG Position)
```
UnrealizedPnL = (CurrentPrice - EntryPrice) × Size
```

### PnL (SHORT Position)
```
UnrealizedPnL = (EntryPrice - CurrentPrice) × Size
```

### Liquidation Trigger
```
LiquidationLevel = 20%
Position liquidated if MarginLevel < 20%
```

---

## Webhooks (Optional)

### Position Opened Webhook

```json
{
  "event": "position.opened",
  "data": {
    "positionId": "pos-789ghi",
    "instrument": "EUR/USD",
    "direction": "LONG"
  }
}
```

### Position Closed Webhook

```json
{
  "event": "position.closed",
  "data": {
    "positionId": "pos-789ghi",
    "realizedPnL": 0.375,
    "reason": "user"
  }
}
```

---

**API Documentation**  
**Version 1.0**  
**Last Updated:** February 13, 2026
