## Supabase Integration Guide

**Status:** Ready for production demo  
**Date:** February 12, 2026

---

### Overview

The CFD engine now supports **Supabase PostgreSQL persistence** for audit trail and state recovery. This enables:

- 📋 **Audit Trail** — Immutable effect log for investor verification
- 💾 **State Recovery** — Crash-replay: load last known state, replay events
- 🔄 **Deterministic Replay** — Same events always produce identical results
- 🚀 **Production Ready** — Enterprise-grade PostgreSQL backend

---

### Quick Setup

#### 1. **Create Tables in Supabase**

Copy the SQL from `scripts/setup-supabase.sql` and run in your Supabase dashboard:

1. Navigate to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Open **SQL Editor**
4. Create a new query
5. Paste the contents of `scripts/setup-supabase.sql`
6. Execute

This creates 3 tables:
- `effects` — Append-only audit log
- `engine_states` — Latest state snapshots per account
- `audit_log` — Human-readable audit trail (optional)

#### 2. **Configure Environment**

Update `.env` file:

```env
# Backend Supabase (required for persistence)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...  # Use anon key or service role key
```

Get these values from Supabase dashboard:
- **URL:** Settings → API → Project URL
- **Key:** Settings → API → Project API Keys (anon or service_role)

#### 3. **Use in Your Code**

```typescript
import { createDefaultPersistence } from "../engine/effects/compositePersistence";

// Auto-detects and uses Supabase if SUPABASE_URL is set
const persistence = createDefaultPersistence();

// Use with orchestrator
import { executeEngineWithPersistence } from "../engine/effects/orchestrator";

const { result, persisted } = await executeEngineWithPersistence(
  state,
  event,
  persistence,
  { accountId: "ACC-001" }
);
```

---

### Architecture

#### **Persistence Sinks**

Three implementation options:

| Option | Use Case | Backend |
|--------|----------|---------|
| **FilePersistence** | MVP, testing, local | JSON files (demo-data/) |
| **SupabasePersistence** | Production demo | Supabase PostgreSQL |
| **HybridPersistence** | Redundancy, migration | Both (writes to both, reads from Supabase) |

#### **Factory Functions**

```typescript
// File-based only
const sink1 = createFilePersistence();

// Supabase-based only
const sink2 = createSupabasePersistence();

// Both (Supabase + file backup)
const sink3 = createHybridPersistence();

// Auto-detect based on env vars
const sink = createDefaultPersistence();
```

#### **Database Schema**

**effects table:**
```sql
id (BIGSERIAL PRIMARY KEY)
type (TEXT) — Effect type (ACCOUNT_BALANCE_UPDATED, etc.)
payload (JSONB) — Full effect object
created_at (TIMESTAMP) — When effect was recorded
```

**engine_states table:**
```sql
id (BIGSERIAL PRIMARY KEY)
account_id (TEXT UNIQUE) — Account identifier
state_json (JSONB) — Serialized EngineState
created_at (TIMESTAMP)
updated_at (TIMESTAMP) — Last modified time
```

---

### Crash-Replay Scenario

**Demo flow:**

```typescript
// 1. Execute engine (pure, no side effects)
const result = executeEvent(state, event);

// 2. Persist effects to Supabase
await persistence.persistEffect(result.effects[0]);

// 3. Save state snapshot
await persistence.saveEngineState(accountId, result.newState);

// ===== CRASH: restart application =====

// 4. Recover by loading last known state from Supabase
const recoveredState = await persistence.loadEngineState(accountId);

// 5. Replay remaining events
const finalState = await replayEvents(recoveredState, moreEvents, persistence);

// Result: Deterministically identical to non-crashed run
```

---

### Usage Examples

#### **Example 1: Simple Persistence**

```typescript
import { createDefaultPersistence } from "./engine/effects/compositePersistence";
import { executeEngineWithPersistence } from "./engine/effects/orchestrator";

const persistence = createDefaultPersistence(); // Auto-detects Supabase

const { result, persisted } = await executeEngineWithPersistence(
  currentState,
  addFundsEvent,
  persistence,
  { accountId: "ACC-001" }
);

if (persisted) {
  console.log("✓ Effect persisted with state snapshot");
}
```

#### **Example 2: Recovery After Crash**

```typescript
import { SupabasePersistence } from "./engine/effects/subabasePersistence";

const persistence = new SupabasePersistence();

// Load last known state
const recoveredState = await persistence.loadEngineState("ACC-001");

if (recoveredState) {
  console.log("Recovered state from Supabase");
  console.log(`Account balance: ${recoveredState.account.balance}`);
  // Continue from this point
} else {
  console.log("No prior state found (new account)");
}
```

#### **Example 3: Audit Trail**

```typescript
// Retrieve all effects since a timestamp
const effects = await persistence.getEffects("2026-02-12T10:00:00Z");

// Build human-readable audit log
for (const effect of effects) {
  console.log(`[${effect.timestamp}] ${effect.type}: ${effect.action}`);
}
```

---

### Testing

**Run all tests:**
```bash
npm test
```

**Run just Supabase integration tests:**
```bash
npm test -- supabase-integration.test.ts
```

**Test file:**
- `engine/tests/__tests__/supabase-integration.test.ts`
- Tests cover: effects persistence, state recovery, composite sink setup
- Supabase tests skip automatically if `SUPABASE_URL` not configured

---

### Environment Variables

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `SUPABASE_URL` | Yes | `https://xxx.supabase.co` | API endpoint |
| `SUPABASE_KEY` | Yes | `eyJ...` | Authentication key |
| `VITE_SUPABASE_URL` | Frontend only | `https://xxx.supabase.co` | Frontend config |
| `VITE_SUPABASE_ANON_KEY` | Frontend only | `eyJ...` | Frontend auth |

---

### Troubleshooting

**Error: "Tables do not exist"**
- Run SQL from `scripts/setup-supabase.sql` in Supabase SQL Editor
- Verify tables: `SELECT tablename FROM pg_tables WHERE schemaname='public';`

**Error: "SUPABASE_URL and SUPABASE_KEY must be set"**
- Check `.env` file has both variables (not `VITE_` prefix)
- Restart Node.js process to reload env vars

**Connection timeout**
- Verify Supabase project is active
- Check network connectivity to `supabase.co`
- Try hybrid persistence (`createHybridPersistence()`) as fallback

**Data not persisting**
- Check Supabase anon key vs service role key permissions
- Verify RLS policies aren't blocking writes
- Monitor Supabase logs for errors

---

### Persistence Classes (API Reference)

#### **SupabasePersistence**

```typescript
class SupabasePersistence {
  persistEffect(effect: EngineEffect): Promise<void>
  saveEngineState(accountId: string, state: EngineState): Promise<void>
  loadEngineState(accountId: string): Promise<EngineState | null>
  getEffects(since?: string): Promise<EngineEffect[]>
  clearEffects(): Promise<void> // Testing only
  clearAccountState(accountId: string): Promise<void> // Testing only
}
```

#### **FilePersistence**

```typescript
class FilePersistence {
  persistEffect(effect: EngineEffect): void
  saveEngineState(accountId: string, state: EngineState): void
  loadEngineState(accountId: string): EngineState | null
  reset(): void // Clear all demo data
  printAuditTrail(): void // Print effects to console
  getAllEffects(): EngineEffect[] // Get all persisted effects
}
```

---

### Demo Scripts

All demo scripts support both file and Supabase persistence:

```bash
# Use file-based persistence (default if SUPABASE_URL not set)
npx ts-node scripts/demo-long-tp.ts

# Use Supabase if SUPABASE_URL is set in .env
SUPABASE_URL=https://xxx.supabase.co npx ts-node scripts/demo-short-sl.ts

# View persisted effects in Supabase
# SELECT * FROM effects ORDER BY created_at DESC LIMIT 10;
```

---

### Production Checklist

- [ ] Supabase project created
- [ ] Tables created via SQL script
- [ ] `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- [ ] Tests pass: `npm test`
- [ ] Demo scripts run successfully
- [ ] Effects visible in Supabase dashboard
- [ ] Crash-replay scenario validated
- [ ] RLS policies configured (optional security)
- [ ] Database backups enabled (Supabase setting)
- [ ] Ready for investor demo!

---

### Next Steps

1. ✅ Set up Supabase (SQL + env vars)
2. ✅ Run demo scripts with persistence
3. ✅ Validate crash-replay scenario
4. 🔄 Connect frontend to Supabase dashboard for live audit viewing
5. 🔄 Implement real-time audit trail notifications
6. 🔄 Add performance monitoring / slow query logs

---

📚 **Related Files:**
- [scripts/setup-supabase.sql](../scripts/setup-supabase.sql) — SQL schema
- [scripts/setup-supabase.ts](../scripts/setup-supabase.ts) — TypeScript migration script
- [engine/effects/supabasePersistence.ts](../engine/effects/supabasePersistence.ts) — Implementation
- [engine/effects/compositePersistence.ts](../engine/effects/compositePersistence.ts) — Factory
- [engine/tests/__tests__/supabase-integration.test.ts](../engine/tests/__tests__/supabase-integration.test.ts) — Tests
