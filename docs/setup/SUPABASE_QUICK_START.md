# Supabase Quick Start Guide

This guide provides a quick overview of the Supabase backend setup for the CFD Trading Platform.

## What's Included

### 📁 Directory Structure

```
/supabase
  ├── config.ts                  # Supabase client initialization
  ├── auth.ts                    # Authentication service
  ├── types.ts                   # TypeScript type definitions
  ├── database.types.ts          # Auto-generated DB types
  ├── index.ts                   # Main exports
  └── supabase.json              # Project configuration

/backend
  └── supabase-backend.ts        # Backend service with persistence

/supabase/functions
  ├── persist-effect/            # Edge Function for persisting effects
  ├── get-engine-state/          # Edge Function for retrieving state
  └── get-account-stats/         # Edge Function for account stats

/scripts
  ├── setup-supabase-complete.sql    # Database schema setup
  ├── setup-supabase.ts              # Migration script
  ├── deploy-supabase.sh             # Deployment script
  ├── setup-supabase-auth.sh         # Auth configuration
  └── test-supabase-integration.ts   # Integration tests
```

## 5-Minute Setup

### Step 1: Environment Variables

```bash
# Copy and update .env.local with your Supabase credentials
cp .env.local.example .env.local

# Edit .env.local and add:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 2: Setup Database

```bash
# Option A: Deploy with bash script
bash scripts/deploy-supabase.sh

# Option B: Manual setup via SQL Editor
# 1. Go to Supabase Dashboard
# 2. Open SQL Editor
# 3. Copy content from scripts/setup-supabase-complete.sql
# 4. Execute
```

### Step 3: Deploy Functions

```bash
npm run supabase:functions:deploy
```

### Step 4: Configure Auth

```bash
bash scripts/setup-supabase-auth.sh
```

### Step 5: Test Integration

```bash
npm run build
npx ts-node scripts/test-supabase-integration.ts
```

## Key Features

### 🔐 Authentication
- Email/password signup and login
- OAuth support (Google, GitHub)
- Session management
- Account profiles for multi-tenancy

### 💾 Data Persistence
- Immutable effects log (audit trail)
- Engine state snapshots (recovery)
- Audit logging
- Position management

### ⚡ Edge Functions
- Persist effects with validation
- Retrieve engine state on demand
- Fetch account statistics
- All functions are secure and require authentication

### 🛡️ Security
- Row-Level Security (RLS) on all user-facing tables
- Service role for backend operations
- Anon key (public) for client-side operations
- Automatic JWT validation on Edge Functions

## Common Tasks

### Authenticate User

```typescript
import { AuthenticationService } from './supabase/auth'

// Sign up
const { user, session } = await AuthenticationService.signUp(
  'user@example.com',
  'password123',
  'John Doe'
)

// Sign in
const { user, session } = await AuthenticationService.signIn(
  'user@example.com',
  'password123'
)
```

### Persist Effect

```typescript
import { getBackendService } from './backend/supabase-backend'

const backend = getBackendService()

await backend.persistEffect(accountId, {
  type: 'AddFunds',
  payload: { amount: 1000 }
})
```

### Save Engine State

```typescript
await backend.saveEngineState(accountId, engineState)
```

### Load Engine State

```typescript
const state = await backend.loadEngineState(accountId)
if (state) {
  // Recover from saved state
} else {
  // Initialize new account
}
```

### Get Account Stats

```typescript
const stats = await backend.getAccountStats(accountId)
console.log(`Open positions: ${stats.open_positions}`)
console.log(`Total effects: ${stats.total_effects}`)
```

### Create Audit Log

```typescript
await backend.createAuditLog(
  accountId,
  'Position opened',
  'position',
  'POS-123',
  { symbol: 'EURUSD', size: 1.0 }
)
```

## Environment Variables

### Client-Side (Public)
```env
VITE_SUPABASE_URL=...        # Safe to expose
VITE_SUPABASE_ANON_KEY=...   # Limited permissions
```

### Server-Side (Secret)
```env
SUPABASE_URL=...             # Internal only
SUPABASE_KEY=...             # NEVER expose to client
```

## Available npm Commands

```bash
# Supabase Management
npm run supabase:setup              # Run database setup
npm run supabase:deploy             # Full deployment
npm run supabase:auth               # Configure authentication
npm run supabase:functions:serve    # Run functions locally
npm run supabase:functions:deploy   # Deploy functions to production
npm run supabase:db:push            # Push database migrations
npm run supabase:status             # Check deployment status
npm run supabase:logs               # View function logs

# Testing
npm test                            # Run all tests
npm run test:coverage               # Test with coverage report
```

## Testing

Run integration tests to verify setup:

```bash
npx ts-node scripts/test-supabase-integration.ts
```

This tests:
- ✓ Connection initialization
- ✓ Effect persistence
- ✓ Engine state save/load
- ✓ Effect retrieval
- ✓ Account statistics
- ✓ Audit logging
- ✓ Position management
- ✓ Error handling

## Troubleshooting

### "Table does not exist"
```bash
# Run setup again
npm run supabase:setup
```

### "Permission denied"
- Check RLS policies are correct
- Verify using service role for backend operations
- Use anon key only for client-side

### "Invalid JWT"
- Refresh session: `await supabase.auth.refreshSession()`
- Re-authenticate user
- Check token hasn't expired

### Functions failing
```bash
# Check logs
npm run supabase:logs

# Start local environment
npm run supabase:functions:serve
```

## Next Steps

1. **Authentication UI** - Add login/signup forms to your application
2. **Real-time Updates** - Enable Supabase realtime subscriptions
3. **File Storage** - Use Supabase storage for document uploads
4. **Email Notifications** - Send email alerts for important events
5. **Monitoring** - Set up alerts and performance monitoring

## Resources

- [Full Setup Guide](./SUPABASE_SETUP.md)
- [Supabase Docs](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Row-Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Support

Need help? Check:
1. Error logs: `npm run supabase:logs`
2. Documentation: `SUPABASE_SETUP.md`
3. Supabase Dashboard: https://supabase.com/dashboard
