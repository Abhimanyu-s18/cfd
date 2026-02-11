/**
 * validatePosition - Position-level invariant checks
 * 
 * Validates:
 * - INV-POS-002: Position ID uniqueness
 * - INV-POS-003: Position ownership
 * - INV-POS-005: Size > 0
 * - INV-POS-006: Entry price > 0
 * - INV-POS-007: Stop loss logic
 * - INV-POS-008: Take profit logic
 * - INV-POS-009: Position count limit
 * - INV-POS-010: Asset class consistency
 * - INV-POS-011: Close price > 0
 * - INV-POS-013: Admin close validation
 */

import { EngineState } from "../state/EngineState";
import { EngineValidationError } from "./validateEvent";

/**
 * INV-POS-002 — Position ID Uniqueness
 * Phase 1: Structural validation (uniqueness check)
 * Rule: Position ID must be globally unique across all accounts
 */
export function validatePositionIdUnique(
  state: EngineState,
  accountId: string,
  positionId: string
): void {
  for (const acctId in state.accounts) {
    const account = state.accounts[acctId];
    if (account.positions && account.positions[positionId]) {
      throw new EngineValidationError(
        "POSITION_ID_DUPLICATE",
        "INV-POS-002",
        `Position ID ${positionId} already exists`
      );
    }
  }
}

/**
 * INV-POS-003 — Position Exists
 * Phase 1: Structural validation (referential check)
 * Rule: Position must exist before referencing in operations
 */
export function validatePositionExists(
  state: EngineState,
  positionId: string
): void {
  let found = false;
  for (const accountId in state.accounts) {
    const account = state.accounts[accountId];
    if (account.positions && account.positions[positionId]) {
      found = true;
      break;
    }
  }
  if (!found) {
    throw new EngineValidationError(
      "POSITION_NOT_FOUND",
      "INV-POS-003",
      `Position ${positionId} not found`
    );
  }
}

/**
 * INV-POS-003 — Position Ownership
 * Phase 1: Structural validation (referential check)
 * Rule: Position must belong to the accountId making the operation
 */
export function validatePositionOwnership(
  state: EngineState,
  positionId: string,
  accountId: string
): void {
  const account = state.accounts[accountId];
  if (!account || !account.positions || !account.positions[positionId]) {
    throw new EngineValidationError(
      "POSITION_NOT_OWNED",
      "INV-POS-003",
      `Position ${positionId} does not belong to account ${accountId}`
    );
  }
}

export function validatePositionSize(size: number): void {
  // TODO: Check size > 0
  // Invariant: INV-POS-005
  if (size <= 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-POS-005",
      "Position size must be positive"
    );
  }
}

export function validateEntryPrice(price: number): void {
  // TODO: Check price > 0
  // Invariant: INV-POS-006
  if (price <= 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-POS-006",
      "Entry price must be positive"
    );
  }
}

/**
 * INV-POS-007 — Stop Loss Logic
 * Phase 1: Structural validation (correctness check)
 * Rule: Stop loss price must be on loss side of entry price
 *  - LONG: stopLoss < entryPrice
 *  - SHORT: stopLoss > entryPrice
 */
export function validateStopLossLogic(
  side: "LONG" | "SHORT",
  entryPrice: number,
  stopLoss: number | undefined
): void {
  if (stopLoss === undefined) return; // Optional
  if (side === "LONG" && stopLoss >= entryPrice) {
    throw new EngineValidationError(
      "INVALID_STOP_LOSS",
      "INV-POS-007",
      `LONG stop loss ${stopLoss} must be below entry price ${entryPrice}`
    );
  }
  if (side === "SHORT" && stopLoss <= entryPrice) {
    throw new EngineValidationError(
      "INVALID_STOP_LOSS",
      "INV-POS-007",
      `SHORT stop loss ${stopLoss} must be above entry price ${entryPrice}`
    );
  }
}

/**
 * INV-POS-008 — Take Profit Logic
 * Phase 1: Structural validation (correctness check)
 * Rule: Take profit price must be on profit side of entry price
 *  - LONG: takeProfit > entryPrice
 *  - SHORT: takeProfit < entryPrice
 */
export function validateTakeProfitLogic(
  side: "LONG" | "SHORT",
  entryPrice: number,
  takeProfit: number | undefined
): void {
  if (takeProfit === undefined) return; // Optional
  if (side === "LONG" && takeProfit <= entryPrice) {
    throw new EngineValidationError(
      "INVALID_TAKE_PROFIT",
      "INV-POS-008",
      `LONG take profit ${takeProfit} must be above entry price ${entryPrice}`
    );
  }
  if (side === "SHORT" && takeProfit >= entryPrice) {
    throw new EngineValidationError(
      "INVALID_TAKE_PROFIT",
      "INV-POS-008",
      `SHORT take profit ${takeProfit} must be below entry price ${entryPrice}`
    );
  }
}

/**
 * INV-POS-009 — Position Count Limit
 * Phase 1: Structural validation (account policy check)
 * Rule: Account cannot exceed max positions configured in policy
 */
export function validatePositionCountLimit(
  state: EngineState,
  accountId: string
): void {
  const account = state.accounts[accountId];
  if (!account) return; // Account validation happens elsewhere
  const maxPositions = account.policy?.maxOpenPositions ?? 20;
  const currentCount = account.positions ? Object.keys(account.positions).length : 0;
  if (currentCount >= maxPositions) {
    throw new EngineValidationError(
      "POSITION_COUNT_EXCEEDED",
      "INV-POS-009",
      `Account has ${currentCount} open positions; max ${maxPositions} allowed`
    );
  }
}
