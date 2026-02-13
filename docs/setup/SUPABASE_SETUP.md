# Supabase Backend Setup & Configuration Guide

This document provides comprehensive setup instructions for Supabase as the backend service for the CFD Trading Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Configuration](#database-configuration)
4. [Authentication Setup](#authentication-setup)
5. [Edge Functions Deployment](#edge-functions-deployment)
6. [Environment Variables](#environment-variables)
7. [Backend Integration](#backend-integration)
8. [Testing & Verification](#testing--verification)

---

## Prerequisites

### Required Tools
- Supabase CLI: `npm install -g supabase`
- Node.js 18+
- TypeScript
- Git

### Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note your project credentials (URL, API keys, etc.)

### Environment Setup
```bash
# Clone and setup
git clone <repo>
cd cfd
npm install

# Install Supabase CLI dependencies
npm install --save-dev @supabase/cli
```

---

## Supabase Project Setup

### 1. Link Supabase Project

```bash
# Initialize Supabase in project
supabase init

# Link to existing Supabase project
supabase link --project-id=oupeqqjccmminuncgdkm
```

### 2. Update Environment Variables

Create/update `.env.local`:

```env
# Supabase URLs and Keys
SUPABASE_URL=https://oupeqqjccmminuncgdkm.supabase.co
SUPABASE_KEY=<YOUR_SERVICE_ROLE_KEY>  # Server-side operations only!
VITE_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>  # Client-side (public)

# Backend Configuration
NODE_ENV=development
API_PORT=3000

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=<your_google_client_id>
GITHUB_CLIENT_ID=<your_github_client_id>
```

⚠️ **Security Warning**: Never commit `.env.local` to version control. Add to `.gitignore`:
```
.env.local
.env*.local
```

---

## Database Configuration

### 1. Create Database Schema

Execute the complete schema setup in Supabase SQL Editor:

```bash
# Option A: Using Supabase Dashboard
# 1. Go to https://supabase.com/dashboard
# 2. Select your project
# 3. Open SQL Editor
# 4. Copy & paste content from scripts/setup-supabase-complete.sql
# 5. Click "Run"

# Option B: Using Supabase CLI
supabase db push
```

Or run the migration script:

```bash
npx ts-node scripts/setup-supabase.ts
```

### 2. Tables Created

The setup creates the following tables:

#### `account_profiles`
User account information with multi-tenancy support.

```typescript
{
  id: UUID
  user_id: UUID (links to auth.users)
  account_id: TEXT (unique identifier)
  name: TEXT
  email: TEXT
  status: 'active' | 'inactive' | 'suspended'
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
  metadata: JSONB
}
```

#### `effects`
Immutable audit trail of all engine events.

```typescript
{
  id: BIGSERIAL
  account_id: TEXT
  type: TEXT
  payload: JSONB
  sequence_number: BIGINT
  created_at: TIMESTAMP
  created_by: UUID
}
```

#### `engine_states`
Latest engine state snapshots for recovery.

```typescript
{
  id: BIGSERIAL
  account_id: TEXT UNIQUE
  state_json: JSONB
  version: INTEGER
  checksum: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

#### `audit_log`
Human-readable audit trail.

```typescript
{
  id: UUID
  account_id: TEXT
  user_id: UUID
  action: TEXT
  resource_type: TEXT
  resource_id: TEXT
  details: JSONB
  timestamp: TIMESTAMP
}
```

#### `positions`
Trading positions data.

```typescript
{
  id: UUID
  account_id: TEXT
  position_id: TEXT UNIQUE
  symbol: TEXT
  direction: 'LONG' | 'SHORT'
  entry_price: NUMERIC
  entry_time: TIMESTAMP
  size: NUMERIC
  stop_loss: NUMERIC
  take_profit: NUMERIC
  current_price: NUMERIC
  pnl: NUMERIC
  status: 'open' | 'closed' | 'pending'
  metadata: JSONB
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### 3. Row-Level Security (RLS)

All user-facing tables have RLS enabled:
- Users can only access their own accounts
- Service role bypasses RLS for backend operations
- Audit logs are immutable

---

## Authentication Setup

### 1. Email Authentication

**Already enabled by default**

Users can sign up/sign in with email and password.

```typescript
// supabase/auth.ts
import { AuthenticationService } from './auth'

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

// Sign out
await AuthenticationService.signOut()
```

### 2. OAuth Providers (Google, GitHub)

**Configure OAuth in Supabase Dashboard:**

1. Go to Authentication → Providers
2. Enable Google:
   - Add Google Client ID
   - Add Google Client Secret
3. Enable GitHub:
   - Add GitHub Client ID
   - Add GitHub Client Secret

```typescript
// Sign in with Google
await AuthenticationService.signInWithOAuth('google')

// Sign in with GitHub
await AuthenticationService.signInWithOAuth('github')
```

### 3. Email Verification

Configure email templates in Supabase Dashboard:
- Authentication → Email Templates
- Customize confirmation, password reset, and magic link emails

### 4. Session Management

```typescript
// Check current session
const session = await AuthenticationService.getSession()

// Monitor auth state changes
const unsubscribe = AuthenticationService.onAuthStateChange((user) => {
  console.log('Auth state changed:', user)
})

// Clean up listener
unsubscribe()
```

---

## Edge Functions Deployment

### 1. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy persist-effect
supabase functions deploy get-engine-state
supabase functions deploy get-account-stats

# Test locally first
supabase functions serve
```

### 2. Function Endpoints

After deployment, functions are available at:

```
https://oupeqqjccmminuncgdkm.supabase.co/functions/v1/persist-effect
https://oupeqqjccmminuncgdkm.supabase.co/functions/v1/get-engine-state
https://oupeqqjccmminuncgdkm.supabase.co/functions/v1/get-account-stats
```

### 3. Function Usage

```typescript
// From backend
import { getBackendService } from './backend/supabase-backend'

const backend = getBackendService()

// Persist effect
await backend.persistEffect(accountId, effect)

// Get engine state
const state = await backend.loadEngineState(accountId)

// Get account stats
const stats = await backend.getAccountStats(accountId)
```

### 4. Testing Functions

```bash
# Test persist-effect
curl -X POST https://oupeqqjccmminuncgdkm.supabase.co/functions/v1/persist-effect \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "AddFunds",
    "payload": { "amount": 1000 },
    "accountId": "ACC-123"
  }'
```

---

## Environment Variables

### Client-Side (Public)
These are safe to expose:
```env
VITE_SUPABASE_URL=https://oupeqqjccmminuncgdkm.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>  # Safe, read-only
```

### Backend/Server-Side (Secret)
Keep these secure in .env or secrets manager:
```env
SUPABASE_URL=https://oupeqqjccmminuncgdkm.supabase.co
SUPABASE_KEY=<service_role_key>  # NEVER expose publicly
```

### Obtaining Keys

1. Go to Supabase Dashboard
2. Select your project
3. Settings → API
4. Copy the required keys

---

## Backend Integration

### 1. Initialize Backend Service

```typescript
import { initializeBackendService, getBackendService } from './backend/supabase-backend'

// Initialize (usually in app startup)
initializeBackendService({
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceKey: process.env.SUPABASE_KEY!,
})

// Get service instance
const backend = getBackendService()
```

### 2. Persist Effects

```typescript
// After engine executes an event
const effect: EngineEffect = {
  type: 'AddFunds',
  payload: { amount: 1000, accountId: 'ACC-123' }
}

await backend.persistEffect(accountId, effect)
```

### 3. Save Engine State

```typescript
// Periodically snapshot engine state
const state: EngineState = { /* ... */ }
await backend.saveEngineState(accountId, state)
```

### 4. Load Engine State

```typescript
// On startup/recovery
const savedState = await backend.loadEngineState(accountId)

if (savedState) {
  // Recover from saved state
  return savedState
} else {
  // Initialize new account
  return initializeNewAccount(accountId)
}
```

### 5. Audit Logging

```typescript
await backend.createAuditLog(
  accountId,
  'Position opened',
  'position',
  'POS-123',
  { symbol: 'EURUSD', size: 1.0 }
)
```

---

## Testing & Verification

### 1. Verify Database Setup

```bash
# Run verification in Supabase SQL Editor
SELECT tablename FROM pg_tables 
WHERE tablename IN ('account_profiles', 'effects', 'engine_states', 'audit_log', 'positions')
ORDER BY tablename;

-- Expected output:
-- account_profiles
-- audit_log
-- effects
-- engine_states
-- positions
```

### 2. Test Authentication

```bash
npm test -- auth

# Or manually:
npm run build
npx ts-node -e "
import { getSupabaseClient } from './supabase/config'
const client = getSupabaseClient()
console.log('Supabase connected:', !!client)
"
```

### 3. Test Backend Service

```bash
npm test -- backend

# Or manually:
npx ts-node -e "
import { getBackendService } from './backend/supabase-backend'
const backend = getBackendService()
const stats = await backend.getAccountStats('ACC-DEMO-001')
console.log('Stats:', stats)
"
```

### 4. Test Edge Functions Locally

```bash
# Start local Edge Function environment
supabase functions serve

# In another terminal, test:
curl -X POST http://localhost:54321/functions/v1/persist-effect \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '...'
```

---

## Troubleshooting

### Issue: "Table does not exist"
**Solution**: Run setup script:
```bash
npx ts-node scripts/setup-supabase-complete.sql
# Or paste SQL into Supabase dashboard
```

### Issue: "Policy violation" or "Permission denied"
**Solution**: Check RLS policies and ensure:
- User is authenticated
- User owns the account being accessed
- Using service role key for backend operations

### Issue: "Invalid or expired JWT"
**Solution**: 
- Refresh session: `await supabase.auth.refreshSession()`
- Re-authenticate user
- Check token expiration

### Issue: Functions fail with CORS errors
**Solution**: Enable CORS in function headers (already configured)

---

## Security Best Practices

1. **Never commit secrets**:
   ```bash
   echo ".env.local" >> .gitignore
   ```

2. **Use service role only on backend**:
   - Never send service key to frontend
   - Use anon key for client-side operations

3. **Enable RLS on all tables**:
   ```sql
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   ```

4. **Create restrictive policies**:
   ```sql
   -- Example: User can only view own data
   CREATE POLICY "Users can view own data" ON table_name
   FOR SELECT USING (user_id = auth.uid());
   ```

5. **Regular token rotation**:
   - Implement token refresh logic
   - Handle token expiration gracefully

---

## Production Deployment

### 1. Use Environment Secrets

Replace `.env` with actual environment variables in production:

```bash
# Example with Vercel
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
```

### 2. Enable Backups

1. Settings → Backups
2. Enable daily backups
3. Configure retention policy

### 3. Monitor Performance

1. Database → Logs
2. Monitor slow queries
3. Scale compute resources if needed

### 4. Setup Alerts

1. Settings → Notifications
2. Configure alerts for:
   - Database connection failures
   - High resource usage
   - Authentication errors

---

## Useful Commands

```bash
# Initialize Supabase
supabase init

# Link to remote project
supabase link --project-id=<PROJECT_ID>

# Deploy migrations
supabase db push

# Deploy functions
supabase functions deploy

# Run functions locally
supabase functions serve

# Execute SQL
supabase db execute

# Check status
supabase status
```

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [RLS Policy Examples](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated**: February 12, 2026
