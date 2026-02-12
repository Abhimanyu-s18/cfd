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

  // Step 12: Exposure per Asset Class (if defined on market)
  // Note: maxExposure field not yet added to MarketState
  // TODO: Implement when MarketState.maxExposure is defined
  
  // Step 13: Account-level Total Exposure (if defined)
  // Note: maxTotalExposure field not yet added to AccountState
  // TODO: Implement when AccountState.maxTotalExposure is defined
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

/**
 * validateAddFunds — EVENT-SPECIFIC VALIDATION
 */
function validateAddFunds(
  state: EngineState,
  event: any
): void {
  const { accountId, amount, adminUserId } = event;

  // Step 1: Account exists
  if (!state.account || state.account.accountId !== accountId) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} does not match engine state`
    );
  }

  // Step 2: Amount validation
  if (amount <= 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-FIN-008",
      "Addition amount must be positive"
    );
  }

  // Step 3: Admin metadata
  if (!adminUserId) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-STATE-005",
      "Admin user ID required for ADD_FUNDS"
    );
  }
}

/**
 * validateRemoveFunds — EVENT-SPECIFIC VALIDATION
 */
function validateRemoveFunds(
  state: EngineState,
  event: any
): void {
  const { accountId, amount, adminUserId } = event;

  // Step 1: Account exists
  if (!state.account || state.account.accountId !== accountId) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} does not match engine state`
    );
  }

  // Step 2: Amount validation
  if (amount <= 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-FIN-008",
      "Removal amount must be positive"
    );
  }

  // Step 3: Sufficient balance
  if (amount > state.account.freeMargin) {
    throw new EngineValidationError(
      "INSUFFICIENT_BALANCE",
      "INV-FIN-001",
      `Removal amount ${amount} exceeds free margin ${state.account.freeMargin}`
    );
  }

  // Step 4: Balance remains non-negative after removal
  const balanceAfter = state.account.balance - amount;
  if (balanceAfter < 0) {
    throw new EngineValidationError(
      "INVALID_BALANCE",
      "INV-FIN-001",
      `Balance would be negative after removal: ${balanceAfter}`
    );
  }

  // Step 5: Admin metadata
  if (!adminUserId) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-STATE-005",
      "Admin user ID required for REMOVE_FUNDS"
    );
  }
}

/**
 * validateAddBonus — EVENT-SPECIFIC VALIDATION
 */
function validateAddBonus(
  state: EngineState,
  event: any
): void {
  const { accountId, amount, adminUserId } = event;

  // Step 1: Account exists
  if (!state.account || state.account.accountId !== accountId) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} does not match engine state`
    );
  }

  // Step 2: Amount validation
  if (amount <= 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-FIN-008",
      "Bonus amount must be positive"
    );
  }

  // Step 3: Admin metadata
  if (!adminUserId) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-STATE-005",
      "Admin user ID required for ADD_BONUS"
    );
  }
}

/**
 * validateRemoveBonus — EVENT-SPECIFIC VALIDATION
 */
function validateRemoveBonus(
  state: EngineState,
  event: any
): void {
  const { accountId, amount, adminUserId } = event;

  // Step 1: Account exists
  if (!state.account || state.account.accountId !== accountId) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} does not match engine state`
    );
  }

  // Step 2: Amount validation
  if (amount <= 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-FIN-008",
      "Bonus removal amount must be positive"
    );
  }

  // Step 3: Sufficient bonus available
  if (!state.account.bonus || amount > state.account.bonus) {
    throw new EngineValidationError(
      "INSUFFICIENT_BONUS",
      "INV-FIN-011",
      `Removal amount ${amount} exceeds available bonus ${state.account.bonus || 0}`
    );
  }

  // Step 4: Admin metadata
  if (!adminUserId) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-STATE-005",
      "Admin user ID required for REMOVE_BONUS"
    );
  }
}

/**
 * validateSetStopLoss — EVENT-SPECIFIC VALIDATION
 */
function validateSetStopLoss(
  state: EngineState,
  event: any
): void {
  const { accountId, positionId, stopLoss } = event;

  // Step 1: Account exists
  if (!state.account || state.account.accountId !== accountId) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} does not match engine state`
    );
  }

  // Step 2: Position exists
  if (!state.positions || !state.positions.has(positionId)) {
    throw new EngineValidationError(
      "POSITION_NOT_FOUND",
      "INV-POS-003",
      `Position ${positionId} does not exist`
    );
  }

  const position = state.positions.get(positionId)!;

  // Step 3: Position is open
  if (position.status !== "OPEN") {
    throw new EngineValidationError(
      "POSITION_NOT_OPEN",
      "INV-POS-001",
      `Position ${positionId} is not open (status: ${position.status})`
    );
  }

  // Step 4: SL logic if provided
  if (stopLoss !== undefined && stopLoss !== null) {
    if (stopLoss <= 0) {
      throw new EngineValidationError(
        "INVALID_STOP_LOSS",
        "INV-POS-007",
        `Stop loss must be positive, got ${stopLoss}`
      );
    }

    if (position.side === "LONG" && stopLoss >= position.entryPrice) {
      throw new EngineValidationError(
        "INVALID_STOP_LOSS",
        "INV-POS-007",
        `LONG stop loss ${stopLoss} must be below entry price ${position.entryPrice}`
      );
    }

    if (position.side === "SHORT" && stopLoss <= position.entryPrice) {
      throw new EngineValidationError(
        "INVALID_STOP_LOSS",
        "INV-POS-007",
        `SHORT stop loss ${stopLoss} must be above entry price ${position.entryPrice}`
      );
    }
  }
  // stopLoss can be null to remove existing SL - this is allowed
}

/**
 * validateSetTakeProfit — EVENT-SPECIFIC VALIDATION
 */
function validateSetTakeProfit(
  state: EngineState,
  event: any
): void {
  const { accountId, positionId, takeProfit } = event;

  // Step 1: Account exists
  if (!state.account || state.account.accountId !== accountId) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} does not match engine state`
    );
  }

  // Step 2: Position exists
  if (!state.positions || !state.positions.has(positionId)) {
    throw new EngineValidationError(
      "POSITION_NOT_FOUND",
      "INV-POS-003",
      `Position ${positionId} does not exist`
    );
  }

  const position = state.positions.get(positionId)!;

  // Step 3: Position is open
  if (position.status !== "OPEN") {
    throw new EngineValidationError(
      "POSITION_NOT_OPEN",
      "INV-POS-001",
      `Position ${positionId} is not open (status: ${position.status})`
    );
  }

  // Step 4: TP logic if provided
  if (takeProfit !== undefined && takeProfit !== null) {
    if (takeProfit <= 0) {
      throw new EngineValidationError(
        "INVALID_TAKE_PROFIT",
        "INV-POS-008",
        `Take profit must be positive, got ${takeProfit}`
      );
    }

    if (position.side === "LONG" && takeProfit <= position.entryPrice) {
      throw new EngineValidationError(
        "INVALID_TAKE_PROFIT",
        "INV-POS-008",
        `LONG take profit ${takeProfit} must be above entry price ${position.entryPrice}`
      );
    }

    if (position.side === "SHORT" && takeProfit >= position.entryPrice) {
      throw new EngineValidationError(
        "INVALID_TAKE_PROFIT",
        "INV-POS-008",
        `SHORT take profit ${takeProfit} must be below entry price ${position.entryPrice}`
      );
    }
  }
  // takeProfit can be null to remove existing TP - this is allowed
}

/**
 * validateCancelPending — EVENT-SPECIFIC VALIDATION
 */
function validateCancelPending(
  state: EngineState,
  event: any
): void {
  const { accountId, positionId } = event;

  // Step 1: Account exists
  if (!state.account || state.account.accountId !== accountId) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} does not match engine state`
    );
  }

  // Step 2: Position exists
  if (!state.positions || !state.positions.has(positionId)) {
    throw new EngineValidationError(
      "POSITION_NOT_FOUND",
      "INV-POS-003",
      `Position ${positionId} does not exist`
    );
  }

  const position = state.positions.get(positionId)!;

  // Step 3: Position must be in PENDING status
  if (position.status !== "PENDING") {
    throw new EngineValidationError(
      "POSITION_NOT_PENDING",
      "INV-POS-001",
      `Position ${positionId} must be PENDING to cancel; current status: ${position.status}`
    );
  }
}

/**
 * validateUpdateAccountStatus — EVENT-SPECIFIC VALIDATION
 */
function validateUpdateAccountStatus(
  state: EngineState,
  event: any
): void {
  const { accountId, status, adminUserId } = event;

  // Step 1: Account exists
  if (!state.account || state.account.accountId !== accountId) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} does not match engine state`
    );
  }

  // Step 2: Valid status transition
  const validStatuses = ["ACTIVE", "LIQUIDATION_ONLY", "CLOSED"];
  if (!validStatuses.includes(status)) {
    throw new EngineValidationError(
      "INVALID_STATUS",
      "INV-STATE-002",
      `Invalid status '${status}'. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  // Step 3: Prevent invalid state transitions
  const currentStatus = state.account.status;
  if (currentStatus === "CLOSED") {
    throw new EngineValidationError(
      "TRANSITION_INVALID",
      "INV-STATE-002",
      `Cannot change status of CLOSED account`
    );
  }

  // Step 4: Admin metadata
  if (!adminUserId) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-STATE-005",
      "Admin user ID required for UPDATE_ACCOUNT_STATUS"
    );
  }
}

/**
 * validateUpdatePolicies — EVENT-SPECIFIC VALIDATION
 */
function validateUpdatePolicies(
  state: EngineState,
  event: any
): void {
  const { accountId, policies, adminUserId } = event;

  // Step 1: Account exists
  if (!state.account || state.account.accountId !== accountId) {
    throw new EngineValidationError(
      "ACCOUNT_NOT_FOUND",
      "INV-DATA-001",
      `Account ${accountId} does not match engine state`
    );
  }

  // Step 2: Policies object is not empty
  if (!policies || Object.keys(policies).length === 0) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-STATE-004",
      "Policies object cannot be empty"
    );
  }

  // Step 3: Validate individual policy fields if present
  if (policies.maxPositions !== undefined && policies.maxPositions <= 0) {
    throw new EngineValidationError(
      "INVALID_POLICY",
      "INV-STATE-004",
      "maxPositions must be positive"
    );
  }

  if (policies.maxLeverageOverride !== undefined && policies.maxLeverageOverride <= 0) {
    throw new EngineValidationError(
      "INVALID_POLICY",
      "INV-STATE-004",
      "maxLeverageOverride must be positive"
    );
  }

  // Step 4: Admin metadata
  if (!adminUserId) {
    throw new EngineValidationError(
      "INVALID_EVENT",
      "INV-STATE-005",
      "Admin user ID required for UPDATE_POLICIES"
    );
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
    case "ADD_FUNDS":
      validateAddFunds(state, event);
      break;
    case "REMOVE_FUNDS":
      validateRemoveFunds(state, event);
      break;
    case "ADD_BONUS":
      validateAddBonus(state, event);
      break;
    case "REMOVE_BONUS":
      validateRemoveBonus(state, event);
      break;
    case "SET_STOP_LOSS":
      validateSetStopLoss(state, event);
      break;
    case "SET_TAKE_PROFIT":
      validateSetTakeProfit(state, event);
      break;
    case "CANCEL_PENDING":
      validateCancelPending(state, event);
      break;
    case "UPDATE_ACCOUNT_STATUS":
      validateUpdateAccountStatus(state, event);
      break;
    case "UPDATE_POLICIES":
      validateUpdatePolicies(state, event);
      break;
    default:
      throw new EngineValidationError(
        "UNKNOWN_EVENT_TYPE",
        "INV-DATA-002",
        `Unknown event type: ${(event as any).type}`
      );
  }
}
