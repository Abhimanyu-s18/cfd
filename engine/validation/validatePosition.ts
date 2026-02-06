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

export function validatePositionIdUnique(
  state: EngineState,
  accountId: string,
  positionId: string
): void {
  // TODO: Check positionId not in any account positions
  // Invariant: INV-POS-002
}

export function validatePositionExists(
  state: EngineState,
  positionId: string
): void {
  // TODO: Find position across all accounts
  // Invariant: INV-POS-003
}

export function validatePositionOwnership(
  state: EngineState,
  positionId: string,
  accountId: string
): void {
  // TODO: Verify position belongs to account
  // Invariant: INV-POS-003
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

export function validateStopLossLogic(
  side: "LONG" | "SHORT",
  entryPrice: number,
  stopLoss: number | undefined
): void {
  // TODO: Implement INV-POS-007
  // LONG: SL must be < entryPrice
  // SHORT: SL must be > entryPrice
}

export function validateTakeProfitLogic(
  side: "LONG" | "SHORT",
  entryPrice: number,
  takeProfit: number | undefined
): void {
  // TODO: Implement INV-POS-008
  // LONG: TP must be > entryPrice
  // SHORT: TP must be < entryPrice
}

export function validatePositionCountLimit(
  state: EngineState,
  accountId: string
): void {
  // TODO: Enforce INV-POS-009
}
