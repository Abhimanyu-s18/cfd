/**
 * validateRisk - Risk management invariant checks
 * 
 * Validates:
 * - INV-FIN-004: Free margin availability (INV-RISK-004)
 * - INV-FIN-009: Leverage limits
 * - INV-RISK-008: Minimum position size
 * - INV-RISK-009: Maximum position size
 * - INV-RISK-010: Exposure limits
 * - INV-DATA-004: Price validity
 */

import { MarketState } from "../state/MarketState";
import { EngineValidationError } from "./validateEvent";

export function validateLeverageLimit(
  leverage: number,
  maxLeverage: number
): void {
  // TODO: Enforce INV-FIN-009
  if (leverage > maxLeverage) {
    throw new EngineValidationError(
      "LEVERAGE_EXCEEDED",
      "INV-FIN-009",
      `Leverage ${leverage} exceeds limit ${maxLeverage}`
    );
  }
}

export function validatePositionMinSize(
  size: number,
  market: MarketState
): void {
  // TODO: Enforce INV-RISK-008
  if (size < market.minSize) {
    throw new EngineValidationError(
      "SIZE_BELOW_MINIMUM",
      "INV-RISK-008",
      `Size ${size} below minimum ${market.minSize}`
    );
  }
}

export function validatePositionMaxSize(
  size: number,
  market: MarketState
): void {
  // TODO: Enforce INV-RISK-009
  if (size > market.maxSize) {
    throw new EngineValidationError(
      "SIZE_ABOVE_MAXIMUM",
      "INV-RISK-009",
      `Size ${size} exceeds maximum ${market.maxSize}`
    );
  }
}

export function validateMarginAvailability(
  freeMargin: number,
  requiredMargin: number
): void {
  // TODO: Enforce INV-FIN-004
  if (requiredMargin > freeMargin) {
    throw new EngineValidationError(
      "INSUFFICIENT_MARGIN",
      "INV-FIN-004",
      `Required margin ${requiredMargin} exceeds free margin ${freeMargin}`
    );
  }
}

export function validateMarginLevel(
  equity: number,
  marginUsed: number
): void {
  // TODO: Enforce INV-RISK-004 (margin level >= 80%)
}

export function validateExposure(
  currentExposure: number,
  maxExposure: number
): void {
  // TODO: Enforce INV-RISK-010
}

export function validateMarketPrice(price: number): void {
  // TODO: Enforce INV-DATA-004
  if (price <= 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-DATA-004",
      "Market price must be positive"
    );
  }
}
