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

/**
 * INV-FIN-009 — Leverage Limits
 * Phase 1: Risk management validation
 * Rule: Position leverage must not exceed account maximum
 */
export function validateLeverageLimit(
  leverage: number,
  maxLeverage: number
): void {
  if (leverage > maxLeverage) {
    throw new EngineValidationError(
      "LEVERAGE_EXCEEDED",
      "INV-FIN-009",
      `Leverage ${leverage} exceeds limit ${maxLeverage}`
    );
  }
}

/**
 * INV-RISK-008 — Minimum Position Size
 * Phase 1: Risk management validation
 * Rule: Position size must meet market minimum
 */
export function validatePositionMinSize(
  size: number,
  market: MarketState
): void {
  if (size < market.minSize) {
    throw new EngineValidationError(
      "SIZE_BELOW_MINIMUM",
      "INV-RISK-008",
      `Size ${size} below minimum ${market.minSize}`
    );
  }
}

/**
 * INV-RISK-009 — Maximum Position Size
 * Phase 1: Risk management validation
 * Rule: Position size must not exceed market maximum
 */
export function validatePositionMaxSize(
  size: number,
  market: MarketState
): void {
  if (size > market.maxSize) {
    throw new EngineValidationError(
      "SIZE_ABOVE_MAXIMUM",
      "INV-RISK-009",
      `Size ${size} exceeds maximum ${market.maxSize}`
    );
  }
}

/**
 * INV-FIN-004 — Margin Availability
 * Phase 1: Risk management validation
 * Rule: Required margin must not exceed free margin
 */
export function validateMarginAvailability(
  freeMargin: number,
  requiredMargin: number
): void {
  if (requiredMargin > freeMargin) {
    throw new EngineValidationError(
      "INSUFFICIENT_MARGIN",
      "INV-FIN-004",
      `Required margin ${requiredMargin} exceeds free margin ${freeMargin}`
    );
  }
}

/**
 * INV-RISK-004 — Margin Level Safety
 * Phase 1: Risk management validation
 * Rule: Margin level must remain above minimum threshold (e.g., 80%)
 */
export function validateMarginLevel(
  equity: number,
  marginUsed: number
): void {
  if (marginUsed <= 0) return; // No positions
  const marginLevel = (equity / marginUsed) * 100;
  const minimumMarginLevel = 80; // Policy threshold
  if (marginLevel < minimumMarginLevel) {
    throw new EngineValidationError(
      "MARGIN_LEVEL_INSUFFICIENT",
      "INV-RISK-004",
      `Margin level ${marginLevel}% is below minimum ${minimumMarginLevel}%`
    );
  }
}

/**
 * INV-RISK-010 — Exposure Limits
 * Phase 1: Risk management validation
 * Rule: Total account exposure must not exceed maximum allowed
 */
export function validateExposure(
  currentExposure: number,
  maxExposure: number
): void {
  if (currentExposure > maxExposure) {
    throw new EngineValidationError(
      "EXPOSURE_EXCEEDED",
      "INV-RISK-010",
      `Exposure ${currentExposure} exceeds maximum ${maxExposure}`
    );
  }
}

/**
 * INV-DATA-004 — Market Price Validity
 * Phase 1: Data validation
 * Rule: Market prices must be positive numbers
 */
export function validateMarketPrice(price: number): void {
  if (price <= 0) {
    throw new EngineValidationError(
      "INVALID_MARKET_PRICE",
      "INV-DATA-004",
      "Market price must be positive"
    );
  }
}
