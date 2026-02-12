/**
 * openPosition - Execute position opening (Phases 4-6)
 * 
 * Phase 4: State Transition
 * - Create new position with calculated fields
 * - Update account margin tracking
 * - Recalculate account derived fields
 * 
 * Phase 5: Effects
 * - Emit PositionOpenedEffect (for audit trail)
 * 
 * Phase 6: Commit
 * - Return immutable new state
 */

import { EngineState } from "../state/EngineState";
import { EngineResult } from "./executeEvent";
import { calculateMarginRequired } from "../domain/calculations/margin";
import { PositionState } from "../state/PositionState";
import { AccountState } from "../state/AccountState";

export function openPosition(
  state: EngineState,
  event: any
): EngineResult {
  try {
    const { positionId, accountId, marketId, side, size, executionPrice, leverage, stopLoss, takeProfit, timestamp, commissionFee } = event;

    // PHASE 4: State Transition
    // Create new position
    const newPosition: PositionState = {
      positionId,
      accountId,
      marketId,
      side,
      size,
      entryPrice: executionPrice,
      leverage,
      stopLoss,
      takeProfit,
      unrealizedPnL: 0, // Just opened, no P&L yet
      marginUsed: calculateMarginRequired(size, executionPrice, leverage),
      commissionFee: commissionFee || 0,
      swapFee: 0,
      status: "OPEN",
      openedAt: timestamp,
    };

    // Add position to state
    const newPositions = new Map(state.positions);
    newPositions.set(positionId, newPosition);

    // Recalculate account derived fields
    let totalUnrealizedPnL = 0;
    let totalMarginUsed = 0;
    newPositions.forEach((pos) => {
      totalUnrealizedPnL += pos.unrealizedPnL;
      totalMarginUsed += pos.marginUsed;
    });

    const newEquity = state.account.balance + state.account.bonus + totalUnrealizedPnL;
    const newFreeMargin = newEquity - totalMarginUsed;
    const newMarginLevel = totalMarginUsed > 0 ? (newEquity / totalMarginUsed) * 100 : null;

    const updatedAccount: AccountState = {
      ...state.account,
      marginUsed: totalMarginUsed,
      equity: newEquity,
      freeMargin: newFreeMargin,
      marginLevel: newMarginLevel,
    };

    const newState: EngineState = {
      account: updatedAccount,
      positions: newPositions,
      markets: state.markets,
    };

    // PHASE 5: Effects (audit trail)
    const effects = [
      {
        type: "PositionOpened",
        positionId,
        margin: newPosition.marginUsed,
        equity: newEquity,
      },
    ];

    // PHASE 6: Commit
    return {
      success: true,
      newState,
      effects,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "OPEN_POSITION_ERROR",
        message: error instanceof Error ? error.message : "Failed to open position",
      },
    };
  }
}
