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

export function validateAccountExists(
  state: EngineState,
  accountId: string
): void {
  // TODO: Verify accountId exists in state
  if (!accountId) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} not found`
    );
  }
}

export function validateAccountActive(
  account: AccountState
): void {
  // TODO: Check status is ACTIVE
  if (account.status !== "ACTIVE") {
    throw new EngineValidationError(
      "INVALID_ACCOUNT_STATUS",
      "INV-STATE-003",
      `Account status ${account.status} does not allow trading`
    );
  }
}

export function validateBalanceNonNegative(
  balance: number
): void {
  // TODO: Enforce INV-FIN-001
  if (balance < 0) {
    throw new EngineValidationError(
      "INVALID_BALANCE",
      "INV-FIN-001",
      "Balance cannot be negative"
    );
  }
}
