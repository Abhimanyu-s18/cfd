# Backend Implementation Guide

**Purpose:** Step-by-step guide to restructure the backend with concrete examples

---

## Phase 1: Directory Structure Setup

### Create Base Directories

```bash
mkdir -p backend/config
mkdir -p backend/services/{auth,persistence,data,statistics}
mkdir -p backend/middleware
mkdir -p backend/handlers
mkdir -p backend/types
mkdir -p backend/utils
mkdir -p backend/tests
```

---

## Phase 2: Configuration Service

### File: `backend/config/types.ts`

```typescript
// Configuration type definitions
export interface DatabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey: string
}

export interface AppConfig {
  database: DatabaseConfig
  environment: 'development' | 'production' | 'test'
  debug: boolean
}

export type ConfigEnvironment = 'SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY' | 'SUPABASE_KEY'
```

### File: `backend/config/config.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { AppConfig, DatabaseConfig } from './types'

/**
 * ConfigService - Singleton for managing application configuration
 * and Supabase client initialization
 */
export class ConfigService {
  private static instance: ConfigService
  private config: AppConfig
  private supabaseClient: SupabaseClient | null = null
  private serviceRoleClient: SupabaseClient | null = null

  private constructor(config: AppConfig) {
    this.config = config
  }

  /**
   * Get or create ConfigService singleton
   */
  static getInstance(config?: AppConfig): ConfigService {
    if (!ConfigService.instance && config) {
      ConfigService.instance = new ConfigService(config)
    } else if (!ConfigService.instance) {
      throw new Error('ConfigService not initialized. Provide config to getInstance()')
    }
    return ConfigService.instance
  }

  /**
   * Initialize configuration from environment variables
   */
  static initializeFromEnv(): ConfigService {
    const config: AppConfig = {
      database: {
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
        serviceRoleKey: process.env.SUPABASE_KEY || '',
      },
      environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      debug: process.env.DEBUG === 'true',
    }

    this.validate(config)
    return ConfigService.getInstance(config)
  }

  /**
   * Validate configuration
   */
  private static validate(config: AppConfig): void {
    const { database } = config
    if (!database.url) throw new Error('SUPABASE_URL not set')
    if (!database.anonKey) throw new Error('VITE_SUPABASE_ANON_KEY not set')
    if (config.environment === 'production' && !database.serviceRoleKey) {
      throw new Error('SUPABASE_KEY required for production')
    }
  }

  /**
   * Get Supabase client (anon)
   */
  getSupabaseClient(): SupabaseClient {
    if (!this.supabaseClient) {
      const dbConfig = this.config.database
      this.supabaseClient = createClient(dbConfig.url, dbConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        db: { schema: 'public' },
        realtime: { params: { eventsPerSecond: 10 } },
      })
    }
    return this.supabaseClient
  }

  /**
   * Get service role client (backend operations)
   */
  getServiceRoleClient(): SupabaseClient {
    if (!this.serviceRoleClient) {
      const dbConfig = this.config.database
      if (!dbConfig.serviceRoleKey) {
        throw new Error('Service role key not configured')
      }
      this.serviceRoleClient = createClient(dbConfig.url, dbConfig.serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    }
    return this.serviceRoleClient
  }

  /**
   * Get configuration
   */
  getConfig(): AppConfig {
    return this.config
  }

  /**
   * Get environment
   */
  getEnvironment(): 'development' | 'production' | 'test' {
    return this.config.environment
  }
}

export const initializeConfig = () => ConfigService.initializeFromEnv()
export const getConfig = () => ConfigService.getInstance()
```

### File: `backend/config/index.ts`

```typescript
export { ConfigService, initializeConfig, getConfig } from './config'
export type { AppConfig, DatabaseConfig } from './types'
```

---

## Phase 3: Repository Pattern

### File: `backend/services/data/types.ts`

```typescript
// Base repository interface
export interface IRepository<T, CreateInput = T, UpdateInput = Partial<T>> {
  create(data: CreateInput): Promise<T>
  read(id: string): Promise<T | null>
  update(id: string, data: UpdateInput): Promise<T>
  delete(id: string): Promise<boolean>
  list(filters?: Record<string, any>, limit?: number): Promise<T[]>
}

// Query options
export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

// Error types
export class RepositoryError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message)
  }
}
```

### File: `backend/services/data/BaseRepository.ts`

```typescript
import { SupabaseClient } from '@supabase/supabase-js'
import type { IRepository, QueryOptions } from './types'

/**
 * Base repository class - provides common CRUD operations
 */
export abstract class BaseRepository<T, CreateInput = T, UpdateInput = Partial<T>>
  implements IRepository<T, CreateInput, UpdateInput>
{
  protected tableName: string

  constructor(protected supabase: SupabaseClient) {
    this.tableName = this.getTableName()
  }

  /**
   * Must be implemented by subclasses
   */
  protected abstract getTableName(): string

  /**
   * Create record
   */
  async create(data: CreateInput): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert([data as any])
      .select()
      .single()

    if (error) throw new Error(`Failed to create ${this.tableName}: ${error.message}`)
    return result as T
  }

  /**
   * Read by ID
   */
  async read(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows
      throw new Error(`Failed to read ${this.tableName}: ${error.message}`)
    }
    return data as T
  }

  /**
   * Update record
   */
  async update(id: string, data: UpdateInput): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(data as any)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update ${this.tableName}: ${error.message}`)
    return result as T
  }

  /**
   * Delete record
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete ${this.tableName}: ${error.message}`)
    return true
  }

  /**
   * List records with filters
   */
  async list(filters?: Record<string, any>, options?: QueryOptions): Promise<T[]> {
    let query = this.supabase.from(this.tableName).select()

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }

    // Apply options
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.orderDirection !== 'desc' })
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to list ${this.tableName}: ${error.message}`)
    return (data || []) as T[]
  }
}
```

### File: `backend/services/data/AccountRepository.ts`

```typescript
import type { AccountProfile } from '../../../supabase/database.types'
import { BaseRepository } from './BaseRepository'

export type AccountCreateInput = Omit<AccountProfile, 'id' | 'created_at' | 'updated_at'>
export type AccountUpdateInput = Partial<Omit<AccountProfile, 'id' | 'created_at'>>

/**
 * AccountRepository - handles account data access
 */
export class AccountRepository extends BaseRepository<AccountProfile, AccountCreateInput, AccountUpdateInput> {
  protected getTableName(): string {
    return 'account_profiles'
  }

  /**
   * Find account by user ID
   */
  async findByUserId(userId: string): Promise<AccountProfile | null> {
    const { data, error } = await this.supabase
      .from('account_profiles')
      .select()
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data as AccountProfile
  }

  /**
   * Find account by account ID
   */
  async findByAccountId(accountId: string): Promise<AccountProfile | null> {
    const { data, error } = await this.supabase
      .from('account_profiles')
      .select()
      .eq('account_id', accountId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data as AccountProfile
  }

  /**
   * Find all accounts for a user
   */
  async findByUserIdAll(userId: string): Promise<AccountProfile[]> {
    const { data, error } = await this.supabase
      .from('account_profiles')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as AccountProfile[]
  }

  /**
   * Get active accounts
   */
  async getActive(): Promise<AccountProfile[]> {
    return this.list({ status: 'active' })
  }
}
```

### File: `backend/services/data/index.ts`

```typescript
export { BaseRepository } from './BaseRepository'
export { AccountRepository } from './AccountRepository'
export { EffectRepository } from './EffectRepository'
export { PositionRepository } from './PositionRepository'
export { EngineStateRepository } from './EngineStateRepository'

export type { IRepository, QueryOptions } from './types'
export { RepositoryError } from './types'
```

---

## Phase 4: Service Layer

### File: `backend/services/auth/types.ts`

```typescript
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email?: string
  role?: string
  metadata?: Record<string, unknown>
}

export interface SignUpInput {
  email: string
  password: string
  name: string
  metadata?: Record<string, unknown>
}

export interface AuthResult {
  user: AuthUser
  session?: Session
}
```

### File: `backend/services/auth/AuthService.ts`

```typescript
import type { User, Session } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthUser, SignUpInput, AuthResult } from './types'

/**
 * AuthService - handles user authentication and authorization
 */
export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Sign up new user
   */
  async signUp(input: SignUpInput): Promise<AuthResult> {
    const { email, password, name, metadata } = input

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, ...metadata },
      },
    })

    if (error) throw new Error(`Sign up failed: ${error.message}`)
    if (!data.user) throw new Error('Sign up failed: No user returned')

    return {
      user: this.mapUser(data.user),
      session: data.session || undefined,
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw new Error(`Sign in failed: ${error.message}`)
    if (!data.user || !data.session) throw new Error('Sign in failed: No session returned')

    return {
      user: this.mapUser(data.user),
      session: data.session,
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw new Error(`Sign out failed: ${error.message}`)
  }

  /**
   * Verify token and get user
   */
  async verifyToken(token: string): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.getUser(token)

    if (error || !data.user) {
      throw new Error('Invalid or expired token')
    }

    return this.mapUser(data.user)
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data, error } = await this.supabase.auth.getUser()

    if (error || !data.user) return null
    return this.mapUser(data.user)
  }

  /**
   * Map Supabase User to AuthUser
   */
  private mapUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role,
      metadata: user.user_metadata,
    }
  }
}
```

### File: `backend/services/persistence/PersistenceService.ts`

```typescript
import type { EngineEffect } from '../../../engine/effects/audit'
import type { EngineState } from '../../../engine/state/types'
import { EffectRepository } from '../data/EffectRepository'
import { EngineStateRepository } from '../data/EngineStateRepository'

/**
 * PersistenceService - handles engine state and effect persistence
 */
export class PersistenceService {
  constructor(
    private effectRepo: EffectRepository,
    private stateRepo: EngineStateRepository,
  ) {}

  /**
   * Persist an engine effect (append-only log)
   */
  async persistEffect(accountId: string, effect: EngineEffect): Promise<void> {
    await this.effectRepo.create({
      account_id: accountId,
      type: effect.type,
      payload: effect as any,
      created_at: new Date().toISOString(),
    })
  }

  /**
   * Save engine state snapshot
   */
  async saveEngineState(accountId: string, state: EngineState): Promise<void> {
    const existing = await this.stateRepo.findByAccountId(accountId)

    if (existing) {
      await this.stateRepo.update(existing.id, {
        state_json: state as any,
        updated_at: new Date().toISOString(),
      })
    } else {
      await this.stateRepo.create({
        account_id: accountId,
        state_json: state as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  /**
   * Load engine state from database
   */
  async loadEngineState(accountId: string): Promise<EngineState | null> {
    const state = await this.stateRepo.findByAccountId(accountId)
    return state?.state_json || null
  }

  /**
   * Get effect history for account
   */
  async getEffectHistory(accountId: string, limit: number = 100): Promise<EngineEffect[]> {
    return this.effectRepo.list(
      { account_id: accountId },
      {
        limit,
        orderBy: 'created_at',
        orderDirection: 'desc',
      }
    )
  }

  /**
   * Recover state from effect history
   */
  async recoverState(accountId: string): Promise<EngineState | null> {
    // First try snapshot
    const snapshot = await this.loadEngineState(accountId)
    if (snapshot) return snapshot

    // TODO: Reconstruct from effect history if needed
    return null
  }
}
```

---

## Phase 5: Middleware

### File: `backend/middleware/auth.middleware.ts`

```typescript
import type { Request } from 'express'
import { AuthService } from '../services/auth/AuthService'
import type { AuthUser } from '../services/auth/types'

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser
    }
  }
}

/**
 * Auth middleware - extracts and verifies token from Authorization header
 */
export async function authMiddleware(
  req: Request,
  res: any,
  next: () => void,
  authService: AuthService,
) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer '
    const user = await authService.verifyToken(token)
    req.authUser = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

/**
 * Optional auth middleware - sets user if token provided, doesn't fail if missing
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: any,
  next: () => void,
  authService: AuthService,
) {
  try {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      req.authUser = await authService.verifyToken(token)
    }
  } catch {
    // Ignore auth errors for optional middleware
  }
  next()
}
```

### File: `backend/middleware/errorHandler.middleware.ts`

```typescript
export interface ErrorResponse {
  error: string
  code?: string
  statusCode: number
}

/**
 * Error handler middleware - normalizes error responses
 */
export function errorHandler(error: any): ErrorResponse {
  console.error('[Error]', error)

  if (error.code === 'PGRST116') {
    return {
      error: 'Resource not found',
      code: 'NOT_FOUND',
      statusCode: 404,
    }
  }

  if (error.message?.includes('does not exist')) {
    return {
      error: 'Resource not found',
      code: 'NOT_FOUND',
      statusCode: 404,
    }
  }

  if (error.message?.includes('unauthorized') || error.message?.includes('Invalid token')) {
    return {
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
      statusCode: 401,
    }
  }

  if (error.message?.includes('permission denied')) {
    return {
      error: 'Access denied',
      code: 'FORBIDDEN',
      statusCode: 403,
    }
  }

  return {
    error: error.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  }
}
```

---

## Phase 6: Handlers

### File: `backend/handlers/account.handler.ts`

```typescript
import type { Request, Response } from 'express'
import { AuthService } from '../services/auth/AuthService'
import { AccountRepository } from '../services/data/AccountRepository'
import { StatisticsService } from '../services/statistics/StatisticsService'
import { errorHandler } from '../middleware/errorHandler.middleware'

/**
 * AccountHandler - REST handlers for account endpoints
 */
export class AccountHandler {
  constructor(
    private authService: AuthService,
    private accountRepo: AccountRepository,
    private statsService: StatisticsService,
  ) {}

  /**
   * GET /accounts/:accountId
   */
  async handleGetAccount(req: Request, res: Response): Promise<void> {
    try {
      if (!req.authUser) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { accountId } = req.params
      const account = await this.accountRepo.findByAccountId(accountId)

      if (!account) {
        res.status(404).json({ error: 'Account not found' })
        return
      }

      // Verify ownership
      if (account.user_id !== req.authUser.id) {
        res.status(403).json({ error: 'Access denied' })
        return
      }

      const stats = await this.statsService.getAccountStats(accountId)

      res.json({
        account,
        stats,
      })
    } catch (error) {
      const err = errorHandler(error)
      res.status(err.statusCode).json(err)
    }
  }

  /**
   * PUT /accounts/:accountId
   */
  async handleUpdateAccount(req: Request, res: Response): Promise<void> {
    try {
      if (!req.authUser) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { accountId } = req.params
      const updates = req.body

      const account = await this.accountRepo.findByAccountId(accountId)
      if (!account || account.user_id !== req.authUser.id) {
        res.status(403).json({ error: 'Access denied' })
        return
      }

      const updated = await this.accountRepo.update(account.id, {
        ...updates,
        updated_at: new Date().toISOString(),
      })

      res.json(updated)
    } catch (error) {
      const err = errorHandler(error)
      res.status(err.statusCode).json(err)
    }
  }

  /**
   * GET /accounts
   */
  async handleListAccounts(req: Request, res: Response): Promise<void> {
    try {
      if (!req.authUser) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const accounts = await this.accountRepo.findByUserIdAll(req.authUser.id)
      res.json(accounts)
    } catch (error) {
      const err = errorHandler(error)
      res.status(err.statusCode).json(err)
    }
  }
}
```

---

## Phase 7: Service Initialization

### File: `backend/services/index.ts`

```typescript
import { ConfigService } from '../config/config'
import { AuthService } from './auth/AuthService'
import { PersistenceService } from './persistence/PersistenceService'
import { AccountRepository } from './data/AccountRepository'
import { EffectRepository } from './data/EffectRepository'
import { EngineStateRepository } from './data/EngineStateRepository'
import { PositionRepository } from './data/PositionRepository'
import { StatisticsService } from './statistics/StatisticsService'

/**
 * ServiceLocator - centralized service initialization
 */
export class ServiceLocator {
  private static instance: ServiceLocator
  private config: ConfigService
  private authService!: AuthService
  private persistenceService!: PersistenceService
  private statisticsService!: StatisticsService

  private constructor(config: ConfigService) {
    this.config = config
    this.initializeServices()
  }

  static initialize(config: ConfigService): ServiceLocator {
    ServiceLocator.instance = new ServiceLocator(config)
    return ServiceLocator.instance
  }

  static getInstance(): ServiceLocator {
    if (!ServiceLocator.instance) {
      throw new Error('ServiceLocator not initialized')
    }
    return ServiceLocator.instance
  }

  private initializeServices(): void {
    const supabase = this.config.getSupabaseClient()

    // Repositories
    const accountRepo = new AccountRepository(supabase)
    const effectRepo = new EffectRepository(supabase)
    const stateRepo = new EngineStateRepository(supabase)
    const positionRepo = new PositionRepository(supabase)

    // Services
    this.authService = new AuthService(supabase)
    this.persistenceService = new PersistenceService(effectRepo, stateRepo)
    this.statisticsService = new StatisticsService(effectRepo, positionRepo)
  }

  getAuthService(): AuthService {
    return this.authService
  }

  getPersistenceService(): PersistenceService {
    return this.persistenceService
  }

  getStatisticsService(): StatisticsService {
    return this.statisticsService
  }

  getAccountRepository(): AccountRepository {
    return new AccountRepository(this.config.getSupabaseClient())
  }
}

export default ServiceLocator
```

---

## Phase 8: Main Application Entry

### File: `backend/index.ts`

```typescript
import { ConfigService, initializeConfig } from './config/config'
import ServiceLocator from './services'
import { AccountHandler } from './handlers/account.handler'

/**
 * Initialize backend services
 */
export async function initializeBackend() {
  // Initialize configuration
  const config = initializeConfig()

  // Initialize service locator
  const services = ServiceLocator.initialize(config)

  return {
    config,
    services,
    handlers: {
      account: new AccountHandler(
        services.getAuthService(),
        services.getAccountRepository(),
        services.getStatisticsService(),
      ),
    },
  }
}

export { ConfigService, ServiceLocator }
export * from './middleware'
export * from './handlers'
export * from './services'
export * from './config'
export * from './types'
```

---

## Migration Checklist

- [ ] Create backend directory structure
- [ ] Implement ConfigService
- [ ] Implement BaseRepository
- [ ] Implement specific repositories
- [ ] Implement AuthService
- [ ] Implement PersistenceService
- [ ] Implement StatisticsService
- [ ] Implement middleware
- [ ] Implement handlers
- [ ] Implement ServiceLocator
- [ ] Update imports in existing code
- [ ] Add integration tests
- [ ] Update documentation

