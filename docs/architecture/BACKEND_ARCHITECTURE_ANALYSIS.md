# Backend Architecture Analysis & Restructuring Plan

**Date:** February 13, 2026  
**Status:** Analysis Complete

---

## 📊 Current Architecture State

### Existing Components

```
/supabase
├── config.ts           → Supabase client initialization & configuration
├── auth.ts             → AuthenticationService (signup, signin, OAuth)
├── database.types.ts   → Auto-generated Supabase types
├── types.ts            → Custom type definitions (Accounts, Effects, Positions, Audit)
├── index.ts            → Main exports
└── functions/          → Supabase Edge Functions
    ├── persist-effect/   → Persists engine effects to DB
    ├── get-engine-state/ → Retrieves engine state snapshots
    └── get-account-stats/ → Calculates account statistics

/backend
└── supabase-backend.ts → SupabaseBackendService class
    ├── persistEffect()    → Saves effects to DB
    ├── saveEngineState()  → Snapshots engine state
    └── loadEngineState()  → Recovers engine state

/scripts
├── setup-supabase.ts        → Database table migrations
├── setup-supabase-complete.sql
├── demo-with-supabase.ts    → Integration demo
├── test-supabase-integration.ts
└── setup-supabase-auth.sh   → Auth initialization
```

### Current Responsibilities

| Component | Purpose | Issues |
|-----------|---------|--------|
| `supabase/config.ts` | Client & connection mgmt | ✓ Good separation |
| `supabase/auth.ts` | User authentication | Located in wrong folder |
| `backend/supabase-backend.ts` | Effect & state persistence | ✗ Isolated from supabase configs |
| `supabase/types.ts` | Type definitions | ✓ Centralized types |
| `supabase/functions/*` | Server-side operations | ✓ Serverless functions |
| `scripts/*` | Setup & migrations | ✗ Mix of setup, demos, tests |

---

## 🔍 Current Issues

### 1. **Scattered Structure**
- Backend class lives in `/backend` but supabase client lives in `/supabase`
- Auth service in supabase folder but backend service in backend folder
- Inconsistent folder organization

### 2. **Missing Abstractions**
- No repository/data access layer pattern
- No service interfaces/contracts
- Direct database coupling in backend service

### 3. **Scripts Organization**
- Setup scripts mixed with demo scripts
- Tests mixed with utilities
- No clear CLI command interface

### 4. **Incomplete Service Layer**
- Only persistence service exists
- No data fetching layer (only Edge Functions)
- No transaction management
- No caching strategy

### 5. **Type Safety Gaps**
- Auto-generated types not integrated with custom types
- Potential type conflicts between `database.types.ts` and `types.ts`

---

## ✨ Proposed Architecture

### New Folder Structure

```
/backend
├── README.md
├── services/
│   ├── index.ts                 → Service exports
│   ├── auth/
│   │   ├── AuthService.ts       → Authentication (moved from /supabase/auth.ts)
│   │   ├── types.ts             → Auth-specific types
│   │   └── index.ts
│   ├── persistence/
│   │   ├── PersistenceService.ts  → Effect & state persistence (from supabase-backend.ts)
│   │   ├── types.ts             → Persistence types
│   │   └── index.ts
│   ├── data/
│   │   ├── AccountRepository.ts   → Account data access
│   │   ├── PositionRepository.ts  → Position data access
│   │   ├── EffectRepository.ts    → Effect data access
│   │   ├── types.ts
│   │   └── index.ts
│   └── statistics/
│       ├── StatisticsService.ts  → Account statistics calculation
│       ├── types.ts
│       └── index.ts
├── middleware/
│   ├── index.ts
│   ├── auth.middleware.ts       → Auth token validation
│   └── errorHandler.middleware.ts → Centralized error handling
├── handlers/
│   ├── index.ts                 → REST handlers
│   ├── account.handler.ts       → Account endpoints
│   ├── position.handler.ts      → Position endpoints
│   ├── effect.handler.ts        → Effect endpoints
│   └── statistics.handler.ts    → Statistics endpoints
└── config/
    ├── config.ts                → Configuration (from supabase/config.ts - moved)
    ├── types.ts                 → Config types
    └── index.ts

/supabase
├── database.types.ts            → Auto-generated DB types (keep here)
├── index.ts                     → Exports (simplified)
└── functions/                   → Edge Functions (keep serverless functions)
    ├── persist-effect/
    ├── get-engine-state/
    └── get-account-stats/

/scripts
├── setup/
│   ├── migrations.ts            → Database setup
│   ├── seed.ts                  → Demo data seeding
│   └── index.ts
├── cli/
│   ├── commands.ts              → CLI command definitions
│   └── index.ts
└── dev/
    ├── demo-long-tp.ts          → Demos
    ├── demo-margin-cascade.ts
    └── test-integration.ts
```

---

## 🏗️ Detailed Component Design

### 1. **Config Layer** (`/backend/config`)

**Purpose:** Centralized configuration management

```typescript
// backend/config/types.ts
export interface DatabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey: string
}

export interface AppConfig {
  database: DatabaseConfig
  environment: 'development' | 'production' | 'test'
}

// backend/config/config.ts
export class ConfigService {
  private static instance: ConfigService
  private config: AppConfig

  static getInstance(): ConfigService { ... }
  getDatabase(): DatabaseConfig { ... }
}
```

### 2. **Auth Service** (`/backend/services/auth`)

**Purpose:** User authentication & authorization

```typescript
export class AuthService {
  constructor(private supabaseClient: SupabaseClient) {}

  async signUp(email: string, password: string, name: string): Promise<AuthUser>
  async signIn(email: string, password: string): Promise<Session>
  async signInWithOAuth(provider: 'google' | 'github'): Promise<void>
  async signOut(): Promise<void>
  async getCurrentUser(): Promise<AuthUser | null>
  async verifyToken(token: string): Promise<AuthUser>
}
```

### 3. **Repository Layer** (`/backend/services/data`)

**Purpose:** Data access abstraction with CRUD operations

```typescript
// Generic repository interface
export interface IRepository<T> {
  create(data: T): Promise<T>
  read(id: string): Promise<T | null>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<boolean>
  list(filters?: Record<string, any>): Promise<T[]>
}

// Specific repositories
export class AccountRepository implements IRepository<AccountProfile> { ... }
export class PositionRepository implements IRepository<Position> { ... }
export class EffectRepository implements IRepository<Effect> { ... }
```

### 4. **Persistence Service** (`/backend/services/persistence`)

**Purpose:** Engine state & effect persistence

```typescript
export class PersistenceService {
  constructor(
    private effectRepo: EffectRepository,
    private stateRepo: EngineStateRepository
  ) {}

  async persistEffect(accountId: string, effect: EngineEffect): Promise<void>
  async saveEngineState(accountId: string, state: EngineState): Promise<void>
  async loadEngineState(accountId: string): Promise<EngineState | null>
  async getEffectHistory(accountId: string, limit?: number): Promise<EngineEffect[]>
}
```

### 5. **Statistics Service** (`/backend/services/statistics`)

**Purpose:** Account analytics & KPI calculations

```typescript
export class StatisticsService {
  constructor(
    private effectRepo: EffectRepository,
    private positionRepo: PositionRepository
  ) {}

  async getAccountStats(accountId: string): Promise<AccountStats>
  async getPositionMetrics(accountId: string, symbol?: string): Promise<PositionMetrics>
  async getPnLSummary(accountId: string): Promise<PnLSummary>
}
```

### 6. **Middleware** (`/backend/middleware`)

**Purpose:** Request/response handling

```typescript
// Auth middleware
export const authMiddleware = (token: string): Promise<AuthUser> { ... }

// Error handler
export const errorHandler = (error: Error): ErrorResponse { ... }

// Request validation
export const validateRequest = (schema: Schema) => (req: Request) => { ... }
```

### 7. **REST Handlers** (`/backend/handlers`)

**Purpose:** HTTP endpoint logic

```typescript
// backend/handlers/account.handler.ts
export class AccountHandler {
  constructor(
    private authService: AuthService,
    private accountRepo: AccountRepository,
    private statsService: StatisticsService
  ) {}

  async handleGetAccount(req: Request): Promise<Response>
  async handleCreateAccount(req: Request): Promise<Response>
  async handleUpdateAccount(req: Request): Promise<Response>
}
```

---

## 📋 Data Flow Diagrams

### Authentication Flow
```
Client Request
    ↓
authMiddleware (verify token)
    ↓
AuthService.verifyToken()
    ↓
Supabase Auth
    ↓
Return AuthUser or 401
```

### Data Persistence Flow
```
Engine Event
    ↓
PersistenceService.persistEffect()
    ↓
EffectRepository.create()
    ↓
Supabase (effects table)
    ↓
Audit Log
```

### State Recovery Flow
```
Application Start
    ↓
Request Engine State
    ↓
PersistenceService.loadEngineState()
    ↓
EngineStateRepository.read()
    ↓
Supabase (engine_states table)
    ↓
Restore State
```

---

## 🔄 Integration Points

### With Engine
- Engine emits effects → PersistenceService consumes
- Application requests state → PersistenceService provides
- Events validated before persistence

### With Frontend
- REST API via handlers
- Real-time updates via Edge Functions
- Authentication via AuthService

### With Supabase
- Client initialization via ConfigService
- Direct table access via repositories
- Edge Functions for server-side logic

---

## 🚀 Migration Path

### Phase 1: Infrastructure
- [ ] Create `/backend/config` structure
- [ ] Create `/backend/services` directory
- [ ] Create `/backend/middleware` directory
- [ ] Create `/backend/handlers` directory

### Phase 2: Core Services
- [ ] Move `supabase/config.ts` → `backend/config/`
- [ ] Move `supabase/auth.ts` → `backend/services/auth/`
- [ ] Move `backend/supabase-backend.ts` → `backend/services/persistence/`
- [ ] Create repository interfaces & implementations
- [ ] Create StatisticsService

### Phase 3: Handlers & Middleware
- [ ] Implement auth middleware
- [ ] Implement error handler middleware
- [ ] Create REST handlers
- [ ] Add request validation

### Phase 4: Types & Testing
- [ ] Merge type definitions
- [ ] Add integration tests
- [ ] Update imports in scripts
- [ ] Update imports in frontend code

### Phase 5: Cleanup
- [ ] Remove deprecated files
- [ ] Organize scripts folder
- [ ] Update documentation
- [ ] Update deployment configs

---

## 📁 Type Consolidation

### Current Issues
- `supabase/database.types.ts` - Auto-generated from Supabase
- `supabase/types.ts` - Custom type definitions
- Potential conflicts & duplication

### Solution
```
/backend/types
├── index.ts                    → Re-exports all types
├── database.ts                 → Auto-generated (from supabase/database.types.ts)
├── domain.ts                   → Domain models (Account, Position, Effect)
├── services.ts                 → Service request/response types
├── api.ts                      → API request/response types
└── common.ts                   → Shared types (errors, pagination, etc)
```

---

## 🔐 Security Considerations

1. **Token Validation**: Centralized in auth middleware
2. **Account Ownership**: Verified before any data access
3. **Service Role Key**: Only used in backend, never exposed to client
4. **CORS**: Configured via Edge Functions
5. **Rate Limiting**: Can be added via middleware or Supabase
6. **Audit Logging**: All mutations logged via effect persistence

---

## 📊 Benefits

| Benefit | Impact |
|---------|--------|
| **Separation of Concerns** | Each service has single responsibility |
| **Testability** | Easy to mock repositories & services |
| **Maintainability** | Clear structure, easier onboarding |
| **Scalability** | Services can be extracted to microservices |
| **Type Safety** | Consolidated type system |
| **Code Reusability** | Services shared across handlers & Edge Functions |
| **Error Handling** | Centralized error management |

---

## 📝 Implementation Checklist

- [ ] Review architecture with team
- [ ] Identify migration order
- [ ] Create service interfaces
- [ ] Implement config service
- [ ] Implement auth service
- [ ] Implement repositories
- [ ] Implement persistence service
- [ ] Implement statistics service
- [ ] Create middleware
- [ ] Create handlers
- [ ] Add comprehensive tests
- [ ] Update documentation
- [ ] Update import paths across codebase
- [ ] Deploy & verify

---

## 🔗 Related Documents

- [Technical_Architecture_Document.md](./Technical_Architecture_Document.md)
- [CFD_Trading_Platform_Requirements.md](./CFD_Trading_Platform_Requirements.md)
- [ENGINE_INTERFACE.md](./engine-specs/ENGINE_INTERFACE.md)

