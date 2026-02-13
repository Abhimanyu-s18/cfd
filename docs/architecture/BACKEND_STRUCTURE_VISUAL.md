# Backend Architecture - Visual Reference

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Application                        │
│              (Web/Desktop Client via REST API)                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │    REST API Layer          │
        │  (/backend/handlers)       │
        │ ┌──────────────────────┐   │
        │ │ Account Handler      │   │
        │ │ Position Handler     │   │
        │ │ Effect Handler       │   │
        │ │ Statistics Handler   │   │
        │ └──────────────────────┘   │
        └────────────┬───────────────┘
                     │
        ┌────────────▼───────────────┐
        │   Middleware Stack         │
        │ ┌──────────────────────┐   │
        │ │ Auth Middleware      │   │
        │ │ Error Handler        │   │
        │ │ Request Validator    │   │
        │ │ CORS Handler         │   │
        │ └──────────────────────┘   │
        └────────────┬───────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
     ▼               ▼               ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│Auth Service  │ │Persistence  │ │Repository    │
│              │ │Service      │ │Layer         │
│- SignUp      │ │             │ │              │
│- SignIn      │ │- Persist    │ │- Account     │
│- SignOut     │ │- LoadState  │ │- Position    │
│- Verify      │ │- History    │ │- Effect      │
│              │ │             │ │              │
└──────────────┘ └─────────────┘ └──────────────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
    ┌────────────────▼─────────────────┐
    │    Config Service                │
    │  (Supabase Client Management)    │
    └────────────────┬──────────────────┘
                     │
        ┌────────────▼──────────────┐
        │  Supabase Backend         │
        │ ┌──────────────────────┐  │
        │ │ PostgreSQL Database  │  │
        │ │ ┌────────────────┐   │  │
        │ │ │ Tables:        │   │  │
        │ │ │ - effects      │   │  │
        │ │ │ - engine_states│   │  │
        │ │ │ - account_prof │   │  │
        │ │ │ - positions    │   │  │
        │ │ │ - audit_log    │   │  │
        │ │ └────────────────┘   │  │
        │ ├──────────────────────┤  │
        │ │ Auth Module          │  │
        │ │ (JWT Tokens)         │  │
        │ ├──────────────────────┤  │
        │ │ Edge Functions       │  │
        │ │ (persist-effect...)  │  │
        │ └──────────────────────┘  │
        └──────────────────────────┘
```

## Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Config Service                                             │
│  └─ Manages Supabase client connections & settings         │
│                                                              │
│  Auth Service                                               │
│  ├─ Signup/Signin/OAuth                                    │
│  ├─ Token Verification                                     │
│  └─ User/Account Profile Management                        │
│                                                              │
│  Persistence Service                                        │
│  ├─ Persists Engine Effects                                │
│  ├─ Manages Engine State Snapshots                         │
│  ├─ Effect History Queries                                 │
│  └─ State Recovery                                         │
│                                                              │
│  Repository Layer (Data Access)                            │
│  ├─ AccountRepository                                      │
│  ├─ PositionRepository                                     │
│  ├─ EffectRepository                                       │
│  ├─ EngineStateRepository                                  │
│  └─ AuditLogRepository                                     │
│                                                              │
│  Statistics Service                                         │
│  ├─ Account Statistics Calculation                         │
│  ├─ Position Metrics                                       │
│  ├─ P&L Summaries                                          │
│  └─ Performance Analytics                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

```
Client Request
    │
    ▼
Router/Dispatcher
    │
    ├─ Match route to handler
    │
    ▼
Middleware Stack
    │
    ├─ authMiddleware: Verify token → Extract AuthUser
    ├─ validateMiddleware: Validate request schema
    ├─ corsMiddleware: Handle CORS headers
    │
    ▼
Handler (e.g., AccountHandler)
    │
    ├─ Validate authorization (user owns account)
    │
    ▼
Services (Auth/Persistence/Statistics)
    │
    ▼
Repositories
    │
    ▼
Supabase Client
    │
    ├─ PostgreSQL Query
    ├─ Execute Row-Level Security (RLS)
    │
    ▼
Response Data
    │
    ├─ Format response
    ├─ Apply error middleware if needed
    │
    ▼
HTTP Response (JSON)
    │
    ▼
Client
```

## Database Schema (Simplified)

```
┌──────────────────────────┐    ┌──────────────────────────┐
│   account_profiles       │    │   auth.users             │
├──────────────────────────┤    ├──────────────────────────┤
│ id (PK)                  │    │ id (PK)                  │
│ user_id (FK) ───────────┼───>│ id                       │
│ account_id               │    │ email                    │
│ name                     │    │ encrypted_password       │
│ email                    │    │ created_at               │
│ status                   │    └──────────────────────────┘
│ created_at               │
│ updated_at               │
│ metadata                 │
└──────────────────────────┘

┌──────────────────────────┐    ┌──────────────────────────┐
│   effects                │    │   engine_states          │
├──────────────────────────┤    ├──────────────────────────┤
│ id (PK)                  │    │ id (PK)                  │
│ account_id (FK)          │    │ account_id (FK)          │
│ type                     │    │ state_json               │
│ payload (JSONB)          │    │ created_at               │
│ created_at               │    │ updated_at               │
└──────────────────────────┘    └──────────────────────────┘

┌──────────────────────────┐    ┌──────────────────────────┐
│   positions              │    │   audit_log              │
├──────────────────────────┤    ├──────────────────────────┤
│ id (PK)                  │    │ id (PK)                  │
│ account_id (FK)          │    │ account_id (FK)          │
│ position_id              │    │ action                   │
│ symbol                   │    │ resource_type            │
│ direction                │    │ resource_id              │
│ entry_price              │    │ details (JSONB)          │
│ size                     │    │ created_at               │
│ status                   │    └──────────────────────────┘
│ metadata                 │
└──────────────────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                  CFD Trading Engine                          │
│  (Accepts events, emits effects, manages state)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─ Subscribe to EngineEffect events
                     │
                     ▼
         ┌───────────────────────┐
         │ Event Persistence     │
         │  Orchestrator         │
         ├───────────────────────┤
         │ persistEffect(event)  │
         └────────────┬──────────┘
                      │
        ┌─────────────▼──────────────┐
        │ PersistenceService         │
        ├────────────────────────────┤
        │ persistEffect()            │
        │ saveEngineState()          │
        │ loadEngineState()          │
        └─────────────┬──────────────┘
                      │
             ┌────────▼────────┐
             │ Supabase DB      │
             │ (PostgreSQL)     │
             └─────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│            Frontend Deployment (Web/Desktop)                │
│  (Redux Store → REST API Calls)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ HTTPS/REST
        ┌────────────────────────────┐
        │  Backend API Server        │
        │  (Node.js/Deno Runtime)    │
        │  - Routes & Handlers       │
        │  - Middleware Stack        │
        │  - Services                │
        └────────────────┬───────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
        Supabase    Supabase      Supabase
        Database    Auth          Edge Fn
        (PostgreSQL) (JWT)        (Deno)
```

## Folder Structure Tree

```
backend/
├── config/
│   ├── config.ts          (ConfigService - singleton)
│   ├── types.ts           (Configuration interfaces)
│   └── index.ts
│
├── services/
│   ├── auth/
│   │   ├── AuthService.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── persistence/
│   │   ├── PersistenceService.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── data/              (Repository Pattern)
│   │   ├── AccountRepository.ts
│   │   ├── PositionRepository.ts
│   │   ├── EffectRepository.ts
│   │   ├── EngineStateRepository.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── statistics/
│   │   ├── StatisticsService.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── index.ts           (Service exports)
│
├── middleware/
│   ├── auth.middleware.ts
│   ├── errorHandler.middleware.ts
│   ├── validator.middleware.ts
│   └── index.ts
│
├── handlers/
│   ├── account.handler.ts
│   ├── position.handler.ts
│   ├── effect.handler.ts
│   ├── statistics.handler.ts
│   └── index.ts
│
├── types/
│   ├── index.ts           (Re-exports all types)
│   ├── domain.ts          (Domain models)
│   ├── services.ts        (Service types)
│   ├── api.ts             (API types)
│   └── common.ts          (Shared types)
│
├── utils/
│   ├── errors.ts
│   ├── logger.ts
│   └── validators.ts
│
└── index.ts               (Main exports)
```

## Service Dependencies Map

```
Handlers
├─ AccountHandler → AuthService, AccountRepository, StatisticsService
├─ PositionHandler → AuthService, PositionRepository
├─ EffectHandler → AuthService, PersistenceService, EffectRepository
└─ StatisticsHandler → AuthService, StatisticsService

Services
├─ AuthService → ConfigService (supabase client), Supabase Auth
├─ PersistenceService → EffectRepository, EngineStateRepository
├─ StatisticsService → EffectRepository, PositionRepository
└─ ConfigService → Environment variables, Supabase SDK

Repositories
├─ AccountRepository → ConfigService (supabase client)
├─ PositionRepository → ConfigService (supabase client)
├─ EffectRepository → ConfigService (supabase client)
└─ EngineStateRepository → ConfigService (supabase client)
```

