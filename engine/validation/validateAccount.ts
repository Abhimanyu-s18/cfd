/**
 * validateAccount - Account-level invariant checks
 * 
 * Validates:
 * - INV-DATA-001: Account exists
 * - INV-FIN-001: Balance non-negativity
 * - INV-STATE-003: Account status allows operations
 * - INV-STATE-001: Overall account consistency
 */

import { EngineState } from "../state/EngineState";
import { AccountState } from "../state/AccountState";
import { EngineValidationError } from "./validateEvent";

/**
 * INV-DATA-001 — Account Existence
 * Phase 1: Structural validation (referential check)
 * Rule: Account must exist in state before any operation
 */
export function validateAccountExists(
  state: EngineState,
  accountId: string
): void {
  if (!accountId || !state.accounts[accountId]) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} not found in state`
    );
  }
}

/**
 * INV-STATE-003 — Account Active Status
 * Phase 1: Structural validation (status check)
 * Rule: Account must be ACTIVE to allow trading operations
 */
export function validateAccountActive(
  account: AccountState
): void {
  if (account.status !== "ACTIVE") {
    throw new EngineValidationError(
      "INVALID_ACCOUNT_STATUS",
      "INV-STATE-003",
      `Account status ${account.status} does not allow trading`
    );
  }
}

/**
 * validateBalanceNonNegative — OPTION J: FIRST REAL INVARIANT
 * 
 * Invariant: INV-FIN-001 - Account Balance Non-Negativity
 * 
 * Rule: balance >= 0 (always)
 * 
 * Enforcement: PHASE 1 (Structural & Referential Validation)
 * Reference: ENGINE_EXECUTION_CONTRACT.md § 3 — Phase 1
 * 
 * This guard prevents:
 * - Realized P&L from going negative without triggering stop-out
 * - Fund removal from creating debt
 * - Invalid state propagation to later phases
 * 
 * When triggered: Events CLOSE_POSITION, REMOVE_FUNDS, UPDATE_PRICES
 * Golden Path: GP-3 (stop-out scenario)
 * 
 * Severity: CRITICAL
 * Engine bug if violated: NO (indicates calculation or closure error)
 * 
 * Pure function: YES (no side effects, no mutation)
 * Deterministic: YES (same input → same output)
 */
export function validateBalanceNonNegative(
  balance: number
): void {
  if (balance < 0) {
    throw new EngineValidationError(
      "INVALID_BALANCE",
      "INV-FIN-001",
      `Balance must be non-negative; got ${balance}`
    );
  }
}
