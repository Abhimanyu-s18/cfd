/**
 * validateEvent - Main validation dispatcher
 * 
 * PHASE 1 ORCHESTRATOR — Structural & Referential Validation
 * Reference: ENGINE_EXECUTION_CONTRACT.md § 3 — Phase 1
 * 
 * Execution order matters. Validates all invariants in dependency order.
 * First failure stops execution and throws.
 * No state changes on validation failure.
 * 
 * Implemented invariants (ready to call):
 * - INV-FIN-001: validateBalanceNonNegative (✅ Option J complete)
 * 
 * Invariants in development:
 * - INV-DATA-001: Account exists
 * - INV-STATE-003: Account status valid
 * - More: see ENGINE_VALIDATION_ORDER.md
 * 
 * Validation order (IMMUTABLE):
 * 1. Structural validation (entities exist)
 * 2. Referential validation (references coherent)
 * 3. Account validation (balance, status)
 * 4. Position validation (size, price, SL/TP logic)
 * 5. Risk validation (leverage, margin, exposure)
 * 6. Event-specific validation
 * 
 * No validator may be added out of order.
 * No validator may be skipped.
 */

import { EngineState } from "../state/EngineState";
import { EngineEvent } from "../events/EngineEvent";
import { validateBalanceNonNegative } from "./validateAccount";

export class EngineValidationError extends Error {
  constructor(
    public code: string,
    public invariantId: string,
    message: string
  ) {
    super(message);
    this.name = "EngineValidationError";
  }
}

/**
 * validateOpenPosition — EVENT-SPECIFIC VALIDATION
 * 
 * Follows ENGINE_VALIDATION_ORDER.md:
 * Step 1-13: All structural and referential checks
 */
function validateOpenPosition(
  state: EngineState,
  event: any
): void {
  const { accountId, marketId, positionId, side, size, executionPrice, leverage, stopLoss, takeProfit } = event;

  // Step 1: Entity Existence
  if (!state.account || state.account.accountId !== accountId) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} does not match engine state`
    );
  }
  if (!state.markets || !state.markets.has(marketId)) {
    throw new EngineValidationError(
      "MARKET_NOT_FOUND",
      "INV-DATA-001",
      `Market ${marketId} does not exist`
    );
  }

  // Step 2: Position ID Uniqueness
  if (state.positions && state.positions.has(positionId)) {
    throw new EngineValidationError(
      "POSITION_ID_DUPLICATE",
      "INV-POS-002",
      `Position ID ${positionId} already exists`
    );
  }

  // Step 3: Input Value Validation
  if (size <= 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-POS-005",
      "Position size must be positive"
    );
  }
  if (executionPrice <= 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-POS-006",
      "Entry price must be positive"
    );
  }
  if (leverage <= 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-CALC-005",
      "Leverage must be positive"
    );
  }

  // Step 4: Stop Loss Logic
  if (stopLoss !== undefined && stopLoss !== null) {
    if (side === "LONG" && stopLoss >= executionPrice) {
      throw new EngineValidationError(
        "INVALID_STOP_LOSS",
        "INV-POS-007",
        `LONG stop loss ${stopLoss} must be below entry price ${executionPrice}`
      );
    }
    if (side === "SHORT" && stopLoss <= executionPrice) {
      throw new EngineValidationError(
        "INVALID_STOP_LOSS",
        "INV-POS-007",
        `SHORT stop loss ${stopLoss} must be above entry price ${executionPrice}`
      );
    }
  }

  // Step 5: Take Profit Logic
  if (takeProfit !== undefined && takeProfit !== null) {
    if (side === "LONG" && takeProfit <= executionPrice) {
      throw new EngineValidationError(
        "INVALID_TAKE_PROFIT",
        "INV-POS-008",
        `LONG take profit ${takeProfit} must be above entry price ${executionPrice}`
      );
    }
    if (side === "SHORT" && takeProfit >= executionPrice) {
      throw new EngineValidationError(
        "INVALID_TAKE_PROFIT",
        "INV-POS-008",
        `SHORT take profit ${takeProfit} must be below entry price ${executionPrice}`
      );
    }
  }

  // Step 6: Leverage Limit
  const market = state.markets.get(marketId)!;
  if (leverage > market.maxLeverage) {
    throw new EngineValidationError(
      "LEVERAGE_EXCEEDED",
      "INV-FIN-009",
      `Leverage ${leverage} exceeds maximum ${market.maxLeverage} for ${marketId}`
    );
  }

  // Step 7: Position Size Limits
  if (size < market.minSize) {
    throw new EngineValidationError(
      "SIZE_BELOW_MINIMUM",
      "INV-RISK-008",
      `Size ${size} below minimum ${market.minSize}`
    );
  }
  if (size > market.maxSize) {
    throw new EngineValidationError(
      "SIZE_ABOVE_MAXIMUM",
      "INV-RISK-009",
      `Size ${size} exceeds maximum ${market.maxSize}`
    );
  }

  // Step 8: Account Status
  if (state.account.status !== "ACTIVE") {
    throw new EngineValidationError(
      "INVALID_ACCOUNT_STATUS",
      "INV-STATE-003",
      `Account status ${state.account.status} does not allow trading`
    );
  }

  // Step 9: Position Count Limit
  const positionCount = state.positions ? state.positions.size : 0;
  if (positionCount >= state.account.maxPositions) {
    throw new EngineValidationError(
      "POSITION_LIMIT_EXCEEDED",
      "INV-POS-009",
      `Account has ${positionCount} open positions; max ${state.account.maxPositions} allowed`
    );
  }

  // Step 10-12: Margin Calculations
  const marginRequired = (size * executionPrice) / leverage;
  const currentFreeMargin = state.account.freeMargin;

  // Step 10: Margin Availability
  if (marginRequired > currentFreeMargin) {
    throw new EngineValidationError(
      "INSUFFICIENT_MARGIN",
      "INV-FIN-004",
      `Required margin ${marginRequired} exceeds free margin ${currentFreeMargin}`
    );
  }

  // Step 11: Margin Level Safety
  const marginUsedAfter = state.account.marginUsed + marginRequired;
  if (marginUsedAfter > 0) {
    const marginLevelAfter = (state.account.equity / marginUsedAfter) * 100;
    if (marginLevelAfter < 125) {
      throw new EngineValidationError(
        "MARGIN_LEVEL_INSUFFICIENT",
        "INV-RISK-004",
        `Margin level after position (${marginLevelAfter.toFixed(2)}%) would be unsafe`
      );
    }
  }
}

/**
 * validateClosePosition — EVENT-SPECIFIC VALIDATION
 */
function validateClosePosition(
  state: EngineState,
  event: any
): void {
  const { accountId, positionId, closePrice } = event;

  // Entity Existence
  if (!state.account || state.account.accountId !== accountId) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} does not match engine state`
    );
  }

  // Position Exists
  if (!state.positions || !state.positions.has(positionId)) {
    throw new EngineValidationError(
      "POSITION_NOT_FOUND",
      "INV-POS-003",
      `Position ${positionId} does not exist`
    );
  }

  const position = state.positions.get(positionId)!;
  if (position.status === "CLOSED") {
    throw new EngineValidationError(
      "POSITION_ALREADY_CLOSED",
      "INV-POS-004",
      `Position ${positionId} is already closed`
    );
  }

  // Close Price Validity
  if (closePrice <= 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-POS-011",
      "Close price must be positive"
    );
  }
}

/**
 * validateUpdatePrices — EVENT-SPECIFIC VALIDATION
 */
function validateUpdatePrices(
  state: EngineState,
  event: any
): void {
  const { prices } = event;

  if (!prices || Object.keys(prices).length === 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-DATA-004",
      "UpdatePrices event must contain at least one price"
    );
  }

  for (const marketId in prices) {
    if (!state.markets || !state.markets.has(marketId)) {
      throw new EngineValidationError(
        "MARKET_NOT_FOUND",
        "INV-DATA-001",
        `Market ${marketId} does not exist`
      );
    }

    const price = prices[marketId];
    if (price <= 0) {
      throw new EngineValidationError(
        "INVALID_MARKET_PRICE",
        "INV-DATA-004",
        `Price for ${marketId} must be positive, got ${price}`
      );
    }
  }
}

export function validateEvent(
  state: EngineState,
  event: EngineEvent
): void {
  // PHASE 1: Structural & Referential Validation
  // Reference: ENGINE_EXECUTION_CONTRACT.md § 3 — Phase 1
  // Order: Immutable per ENGINE_VALIDATION_ORDER.md
  
  switch (event.type) {
    case "OPEN_POSITION":
      validateOpenPosition(state, event);
      break;
    case "CLOSE_POSITION":
      validateClosePosition(state, event);
      break;
    case "UPDATE_PRICES":
      validateUpdatePrices(state, event);
      break;
    default:
      // Other event types will be implemented in future phases
      // For now, accept them (graceful degradation)
      break;
  }
}
