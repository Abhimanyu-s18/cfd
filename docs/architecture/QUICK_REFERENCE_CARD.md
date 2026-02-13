# Backend Architecture - Quick Reference Card

**Print this or bookmark for quick lookup during implementation**

---

## Directory Structure

```
backend/
├── config/              ← Configuration & Supabase initialization
├── services/            ← Business logic
│   ├── auth/           ← User authentication
│   ├── persistence/    ← Engine effects & state
│   ├── data/           ← Repository pattern (CRUD)
│   └── statistics/     ← Analytics & calculations
├── middleware/         ← Auth, errors, validation
├── handlers/           ← HTTP endpoints (REST)
├── types/              ← Unified type definitions
├── utils/              ← Helpers & utilities
├── tests/              ← Unit & integration tests
└── index.ts            ← Main exports
```

---

## Core Classes & Their Purpose

### ConfigService (Singleton)
```typescript
// Location: backend/config/config.ts
// Purpose: Manage app configuration & Supabase clients

ConfigService.initializeFromEnv()  // Initialize from .env
config.getSupabaseClient()         // Get anon client
config.getServiceRoleClient()      // Get service role client
```

### Repositories (Data Access)
```typescript
// Location: backend/services/data/
// Purpose: Encapsulate database queries

accountRepo.create(data)           // CREATE
accountRepo.read(id)               // READ by ID
accountRepo.update(id, data)       // UPDATE
accountRepo.delete(id)             // DELETE
accountRepo.list(filters, opts)    // READ with filters
```

### Services (Business Logic)
```typescript
// AuthService: Handle user auth
// PersistenceService: Save effects & state
// StatisticsService: Calculate account stats
// Each takes repositories as dependencies
```

### Middleware (Request Processing)
```typescript
authMiddleware(req, res, next)     // Verify token
errorHandler(error)                // Normalize errors
```

### Handlers (HTTP Endpoints)
```typescript
accountHandler.handleGetAccount()      // GET /accounts/:id
accountHandler.handleUpdateAccount()   // PUT /accounts/:id
effectHandler.handlePersistEffect()    // POST /effects
```

---

## Service Dependencies Map

```
ConfigService
    ↓
Repositories (use Supabase client)
    ↓
Services (use Repositories)
    ↓
Handlers (use Services)
    ↓
Middleware (authentication)
```

---

## Common Tasks

### Initialize Backend
```typescript
import { ConfigService, ServiceLocator } from './backend'

// 1. Initialize config
const config = ConfigService.initializeFromEnv()

// 2. Initialize services
const services = ServiceLocator.initialize(config)

// 3. Use services
const authService = services.getAuthService()
const persistence = services.getPersistenceService()
```

### Create New Repository
```typescript
import { BaseRepository } from './BaseRepository'

export class MyRepository extends BaseRepository<MyType> {
  protected getTableName(): string {
    return 'my_table'
  }
  
  async customQuery() {
    // Add custom queries here
  }
}
```

### Create New Service
```typescript
export class MyService {
  constructor(
    private repo1: Repository1,
    private repo2: Repository2
  ) {}
  
  async doSomething() {
    // Use repositories
  }
}
```

### Create New Handler
```typescript
export class MyHandler {
  constructor(
    private service1: Service1,
    private service2: Service2
  ) {}
  
  async handleRequest(req: Request, res: Response) {
    try {
      // Verify auth
      if (!req.authUser) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }
      
      // Call service
      const result = await this.service1.doSomething()
      
      // Send response
      res.json(result)
    } catch (error) {
      const err = errorHandler(error)
      res.status(err.statusCode).json(err)
    }
  }
}
```

### Create New Middleware
```typescript
export function myMiddleware(
  req: Request,
  res: Response,
  next: () => void
) {
  try {
    // Do something
    next()
  } catch (error) {
    res.status(500).json({ error: 'Internal error' })
  }
}
```

---

## Type Management

### Types Location Reference
```
backend/types/
├── database.ts    ← Auto-generated from Supabase
├── domain.ts      ← Domain models & business types
├── services.ts    ← Service input/output types
├── api.ts         ← API request/response types
└── common.ts      ← Shared types (errors, pagination)
```

### Importing Types
```typescript
// Import all types centrally
import { 
  AccountProfile,      // db type
  AuthUser,            // auth type
  EngineState,         // domain type
  AccountStats,        // service output
} from '../backend/types'
```

---

## Error Handling

### In Middleware
```typescript
const errorResponse = errorHandler(error)
res.status(errorResponse.statusCode).json(errorResponse)
```

### In Repositories
```typescript
if (error.code === 'PGRST116') {
  // No rows found
  return null
}
throw new Error(`Database error: ${error.message}`)
```

### In Services
```typescript
try {
  await this.repo.create(data)
} catch (error) {
  throw new Error(`Failed to create: ${error.message}`)
}
```

---

## Testing

### Mock Repository
```typescript
const mockRepo = {
  create: jest.fn().mockResolvedValue(data),
  read: jest.fn().mockResolvedValue(data),
  list: jest.fn().mockResolvedValue([data]),
}

const service = new MyService(mockRepo)
```

### Mock Service
```typescript
const mockService = {
  doSomething: jest.fn().mockResolvedValue(result)
}

const handler = new MyHandler(mockService)
```

### Test Handler
```typescript
describe('MyHandler', () => {
  it('should handle request', async () => {
    const req = {
      authUser: { id: 'user-1', email: 'test@example.com' }
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    
    await handler.handleRequest(req as any, res as any)
    
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
```

---

## Environment Variables

### Required
```bash
SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
SUPABASE_KEY=xxx                    # Service role key
```

### Optional
```bash
NODE_ENV=development|production     # Defaults to development
DEBUG=true|false                    # Enables verbose logging
```

### Validation
```typescript
ConfigService.initializeFromEnv() // Throws if required vars missing
```

---

## Database Tables Reference

```typescript
effects
  id, account_id, type, payload, created_at

engine_states
  id, account_id, state_json, created_at, updated_at

account_profiles
  id, user_id, account_id, name, email, status, created_at, updated_at, metadata

positions
  id, account_id, position_id, symbol, direction, entry_price, size, status, metadata

audit_log
  id, account_id, action, resource_type, resource_id, details, created_at
```

---

## File Naming Conventions

```
Services:     MyService.ts           (PascalCase + Service)
Repositories: MyRepository.ts        (PascalCase + Repository)
Handlers:     MyHandler.ts           (PascalCase + Handler)
Middleware:   my.middleware.ts       (lowercase + .middleware)
Types:        my.types.ts            (lowercase + .types)
Utils:        my.utils.ts            (lowercase + .utils)
Tests:        MyClass.test.ts        (Class name + .test)
```

---

## Import Patterns

### From Backend
```typescript
// Correct ✓
import { ConfigService } from '../backend/config'
import { AuthService } from '../backend/services/auth'
import { MyType } from '../backend/types'

// Avoid ✗
import { ConfigService } from '../backend/config/config'
```

### From External
```typescript
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
```

---

## Debugging Tips

### Check Configuration
```typescript
const config = ConfigService.getInstance()
console.log(config.getConfig())  // See all settings
```

### Test Supabase Connection
```typescript
const client = config.getSupabaseClient()
const { data, error } = await client.from('effects').select('count')
console.log(data, error)
```

### View Service Dependencies
```typescript
const services = ServiceLocator.getInstance()
console.log(services.getAuthService())
```

### Check Middleware Order
```typescript
// Correct order:
app.use(authMiddleware)      // Must verify auth first
app.use(errorHandler)        // Catch errors
app.use(handlers)            // Then process
```

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| ConfigService not initialized | Init not called | Call `ConfigService.initializeFromEnv()` first |
| Missing authorization header | No token in request | Add `Authorization: Bearer <token>` header |
| Invalid token | Token expired/invalid | Verify token via AuthService.verifyToken() |
| Resource not found | ID doesn't exist | Check ID exists in database |
| Access denied | Not owner of resource | Verify `account.user_id === authUser.id` |
| PGRST116 | No rows returned | Normal for single() query, handle with null check |

---

## Quick Checklist for New Code

- [ ] Added to appropriate service/repository
- [ ] Has proper error handling
- [ ] All inputs validated
- [ ] All outputs typed
- [ ] Includes unit test
- [ ] Documented with comments
- [ ] Follows naming conventions
- [ ] No direct database access outside repos
- [ ] No service instantiation outside ServiceLocator
- [ ] Auth check in handlers

---

## Performance Tips

```typescript
// Use specific queries, not select all
❌ await this.supabase.from('effects').select()
✅ await this.supabase.from('effects').select('id, type')

// Use filters to reduce data
❌ let items = await repo.list()
✅ let items = await repo.list({ account_id: 'xxx' })

// Use pagination for large results
❌ await repo.list({ account_id: 'xxx' })
✅ await repo.list({ account_id: 'xxx' }, { limit: 20, offset: 0 })

// Cache expensive calculations
❌ Call stats service on every request
✅ Cache stats with TTL, invalidate on change
```

---

## Useful Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build

# Test
npm test

# Test specific file
npm test -- backend/services/auth/AuthService.test.ts

# Test with coverage
npm test -- --coverage

# Run demo
npx ts-node scripts/demo-with-supabase.ts
```

---

## Architecture Decision Records (ADRs)

### Why Repository Pattern?
- Abstracts database implementation
- Easy to mock for testing
- Centralizes query logic
- Supports switching databases

### Why ServiceLocator?
- Single initialization point
- Managed dependencies
- Easy to configure services
- Testable with mocks

### Why Middleware Pipeline?
- Consistent request handling
- Cross-cutting concerns separated
- Easy to add/remove middleware
- Standard web pattern

---

## Resources

- [Architecture Analysis](./BACKEND_ARCHITECTURE_ANALYSIS.md)
- [Visual Diagrams](./BACKEND_STRUCTURE_VISUAL.md)
- [Implementation Guide](./BACKEND_IMPLEMENTATION_GUIDE.md)
- [Before/After Comparison](./BACKEND_BEFORE_AFTER_COMPARISON.md)
- [Implementation Roadmap](./BACKEND_IMPLEMENTATION_ROADMAP.md)

---

**Last Updated:** Feb 13, 2026  
**Version:** 1.0  
**Status:** Active Reference

