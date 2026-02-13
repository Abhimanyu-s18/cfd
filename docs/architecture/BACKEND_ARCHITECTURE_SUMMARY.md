# Backend Architecture - Executive Summary

**Last Updated:** February 13, 2026  
**Status:** Architecture Pre-Planned

---

## Quick Overview

You have three main backend-related folder structures that need consolidation:

| Current Location | Component | Status |
|------------------|-----------|--------|
| `/backend/supabase-backend.ts` | Persistence Service | ⚠️ Isolated |
| `/supabase/` | Config, Auth, Types | ⚠️ Scattered |
| `/scripts/` | Setup, Migrations, Demos | ⚠️ Mixed |

### The Problem
- **Scattered responsibility**: Backend lives in `/backend`, but its config lives in `/supabase`
- **No clear patterns**: Direct database coupling, no repository layer
- **Mixed concerns**: Auth, persistence, data access all mixed together
- **Maintenance overhead**: Hard to test, scale, or refactor

---

## Proposed Solution

### 1. Unified Backend Structure

```
backend/
├── config/              ← Supabase initialization & settings
├── services/            ← Business logic
│   ├── auth/            ← User authentication
│   ├── persistence/     ← Engine state & effects
│   ├── data/            ← Repository pattern (data access)
│   └── statistics/      ← Analytics & calculations
├── middleware/          ← Request processing (auth, errors)
├── handlers/            ← HTTP endpoints (REST API)
├── types/               ← Unified type definitions
└── utils/               ← Helpers & utilities
```

### 2. Clear Separation of Concerns

| Layer | Responsibility | Examples |
|-------|-----------------|----------|
| **Config** | Initialization & settings | Supabase client, environment vars |
| **Services** | Business logic | Auth, Persistence, Statistics |
| **Repositories** | Data access abstraction | Query building, CRUD operations |
| **Middleware** | Request processing | Token verification, error handling |
| **Handlers** | HTTP logic | Parse request, call service, return response |

### 3. Key Design Patterns

#### Repository Pattern (Data Access)
```
Handler → Service → Repository → Supabase DB
```
- Decouples services from database implementation
- Easy to mock for testing
- Centralized query logic

#### Service Locator Pattern (Dependency Injection)
```
ServiceLocator.initialize(config)
↓
Creates all services with dependencies
↓
Handlers request services as needed
```
- Single initialization point
- Managed dependencies
- Easy to swap implementations

#### Middleware Pipeline
```
Request → Auth → Validate → Handler → Response
```
- Consistent error handling
- Token verification
- Request validation

---

## Architecture at a Glance

### Request Flow

```
Client sends request with auth token
         ↓
authMiddleware validates token
         ↓
Handler receives request + authenticated user
         ↓
Handler calls appropriate Service
         ↓
Service uses Repository for data access
         ↓
Repository executes Supabase query
         ↓
Response flows back through layers
         ↓
Client receives JSON response
```

### Service Dependencies

```
Config Service (singleton)
     ↓
Repositories (use supabase client)
     ↓
Business Services (use repositories)
     ↓
Handlers (use services)
     ↓
Middleware (use services)
```

---

## Current Components (To Be Refactored)

### 1. Backend Service
**File:** `backend/supabase-backend.ts`

**Current Responsibilities:**
- `SupabaseBackendService` class for persistence
- Effect persistence
- Engine state save/load

**Issues:**
- Tightly coupled to Supabase client
- No repository abstraction
- Error handling inconsistent

**Future Home:** `backend/services/persistence/`

---

### 2. Supabase Config
**Files:** `supabase/config.ts`, `supabase/auth.ts`, `supabase/types.ts`, `supabase/index.ts`

**Current Responsibilities:**
- Supabase client initialization
- Configuration management
- Authentication service
- Type definitions

**Issues:**
- Auth service mixed with configs
- Types scattered in multiple files
- No unified initialization

**Future Home:** 
- Config → `backend/config/`
- Auth → `backend/services/auth/`
- Types → `backend/types/`

---

### 3. Scripts
**Folder:** `scripts/`

**Current Mix:**
- Setup migrations (setup-supabase.ts)
- Demo scenarios (demo-*.ts)
- Integration tests (test-supabase-integration.ts)
- Shell scripts (setup-supabase-*.sh)

**Future Organization:**
```
scripts/
├── setup/           ← Database migrations
├── cli/             ← CLI commands
└── dev/             ← Development/demo scripts
```

---

## Key Improvements

### 1. **Testability** ✓
```typescript
// Before: Tightly coupled
new SupabaseBackendService(config)

// After: Mockable dependencies
interface IEffectRepository { ... }
new PersistenceService(mockRepo)
```

### 2. **Maintainability** ✓
```
Clear folder structure
↓
Single responsibility per file
↓
Easy to locate & modify code
```

### 3. **Scalability** ✓
```typescript
// Easy to add new services
class NotificationService { ... }

// Easy to add new handlers
class NotificationHandler { ... }

// Easy to extract to microservice later
```

### 4. **Type Safety** ✓
```
Supabase auto-generated types
    ↓
Custom domain types
    ↓
API request/response types
    ↓
All consolidated in /backend/types/
```

---

## Implementation Phases

### ✅ Phase 1: Planning (COMPLETE)
- Analyzed current architecture
- Identified issues
- Designed solution
- Created documentation

### Phase 2: Infrastructure (Ready to Start)
- Create folder structure
- Add base classes
- Set up service locator

### Phase 3: Core Services
- Implement repositories
- Implement auth service
- Implement persistence service
- Implement statistics service

### Phase 4: Integration
- Add middleware
- Add handlers
- Connect to existing code

### Phase 5: Testing & Cleanup
- Add tests
- Update imports
- Remove old files
- Update documentation

---

## File Organization Reference

### Config Layer
```
backend/
└── config/
    ├── config.ts            ← ConfigService (singleton)
    ├── types.ts             ← Configuration type definitions
    └── index.ts             ← Exports
```

### Service Layer
```
backend/
└── services/
    ├── auth/
    │   ├── AuthService.ts   ← Signs up/in users, verifies tokens
    │   ├── types.ts
    │   └── index.ts
    ├── persistence/
    │   ├── PersistenceService.ts  ← Engine effect/state persistence
    │   ├── types.ts
    │   └── index.ts
    ├── data/
    │   ├── BaseRepository.ts  ← Base CRUD operations
    │   ├── AccountRepository.ts
    │   ├── EffectRepository.ts
    │   ├── PositionRepository.ts
    │   ├── EngineStateRepository.ts
    │   ├── types.ts
    │   └── index.ts
    ├── statistics/
    │   ├── StatisticsService.ts  ← Account analytics
    │   ├── types.ts
    │   └── index.ts
    └── index.ts             ← ServiceLocator
```

### HTTP Layer
```
backend/
├── middleware/
│   ├── auth.middleware.ts      ← Token verification
│   ├── errorHandler.middleware.ts
│   └── index.ts
├── handlers/
│   ├── account.handler.ts
│   ├── position.handler.ts
│   ├── effect.handler.ts
│   ├── statistics.handler.ts
│   └── index.ts
└── types/
    ├── index.ts              ← Re-exports all types
    ├── domain.ts             ← Business models
    ├── services.ts           ← Service types
    ├── api.ts                ← API endpoint types
    └── common.ts             ← Shared types
```

---

## Integration with Existing Components

### With Engine
```
Engine emits effects
    ↓
PersistenceService.persistEffect()
    ↓
EffectRepository.create()
    ↓
Database
```

### With Frontend
```
Frontend sends REST request
    ↓
Handler processes request
    ↓
Service executes logic
    ↓
Frontend receives JSON response
```

### With Supabase
```
ConfigService initializes client
    ↓
Repositories use client for queries
    ↓
Edge Functions remain for serverless logic
    ↓
Database handles storage & RLS
```

---

## Type Management Strategy

### Before (Scattered)
```
supabase/database.types.ts      ← Auto-generated
supabase/types.ts               ← Custom types
backend/supabase-backend.ts     ← Scattered imports
```
**Problem:** Duplicate types, import conflicts

### After (Consolidated)
```
backend/types/
├── index.ts                    ← Central re-export
├── database.ts                 ← Auto-generated (moved)
├── domain.ts                   ← Domain models
├── services.ts                 ← Service types
├── api.ts                      ← API types
└── common.ts                   ← Shared types
```
**Benefit:** Single source of truth, easy imports

---

## Environment Configuration

### Required Environment Variables
```bash
SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
SUPABASE_KEY=xxx                    # Service role key
NODE_ENV=development|production
DEBUG=true|false
```

### Configuration Loading
```typescript
// Old way
import { supabaseConfig } from './supabase/config'

// New way
const config = ConfigService.initializeFromEnv()
const dbConfig = config.getDatabase()
```

---

## Next Steps

1. **Review** this architecture with your team
2. **Approve** the proposed structure
3. **Execute** Phase 2 (Infrastructure setup)
4. **Build** core services (Phases 3-4)
5. **Test** and integrate (Phase 5)
6. **Deploy** new architecture

---

## Documentation Map

| Document | Purpose | Link |
|----------|---------|------|
| **BACKEND_ARCHITECTURE_ANALYSIS.md** | Detailed analysis & issues | Current folder |
| **BACKEND_STRUCTURE_VISUAL.md** | Visual diagrams & flows | Current folder |
| **BACKEND_IMPLEMENTATION_GUIDE.md** | Step-by-step code examples | Current folder |
| **BACKEND_ARCHITECTURE_SUMMARY.md** | This document | Current folder |

---

## Benefits Summary

| Aspect | Current | Proposed | Benefit |
|--------|---------|----------|---------|
| **Structure** | Scattered | Organized | Easy to navigate |
| **Testing** | Difficult | Easy | Mockable dependencies |
| **Scaling** | Hard | Easy | Modular services |
| **Types** | Conflicting | Unified | Type-safe code |
| **Errors** | Inconsistent | Centralized | Better debugging |
| **Maintainability** | Low | High | Faster development |
| **Onboarding** | Steep | Gentle | Clear patterns |

---

## Questions & Answers

**Q: Why separate repositories from services?**  
A: Repositories abstract database access, making services testable and database-agnostic.

**Q: Why ConfigService as singleton?**  
A: Ensures single connection to Supabase, consistent configuration across app.

**Q: Why need middleware?**  
A: Common concerns (auth, errors) handled consistently across all routes.

**Q: Will Edge Functions still work?**  
A: Yes! They remain in `/supabase/functions/` for serverless operations.

**Q: How are types managed?**  
A: Auto-generated types from Supabase live in database.ts, custom types in domain.ts, API types in api.ts.

---

## Related Architecture Documents

- [Technical_Architecture_Document.md](./Technical_Architecture_Document.md)
- [ENGINE_INTERFACE.md](./engine-specs/ENGINE_INTERFACE.md)
- [API_SPECIFICATION.md](./reference/API_SPECIFICATION.md)

