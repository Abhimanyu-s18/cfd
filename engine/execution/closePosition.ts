/**
 * closePosition - Execute position closing (Phases 4-6)
 * 
 * Phase 4: State Transition
 * - Calculate realized P&L
 * - Update balance with realized P&L
 * - Close position (mark CLOSED, record prices)
 * - Release margin
 * - Recalculate account derived fields
 * 
 * Phase 5: Effects
 * - Emit PositionClosedEffect (audit trail)
 * 
 * Phase 6: Commit
 * - Return immutable new state
 */

import { EngineState } from "../state/EngineState";
import { EngineResult } from "./executeEvent";
import { calculateRealizedPnL } from "../domain/calculations/pnl";
import { AccountState } from "../state/AccountState";

export function closePosition(
  state: EngineState,
  event: any
): EngineResult {
  try {
    const { positionId, closePrice, closedBy, timestamp } = event;

    // Get position to close
    const position = state.positions.get(positionId);
    if (!position) {
      return {
        success: false,
        error: {
          code: "POSITION_NOT_FOUND",
          message: `Position ${positionId} not found`,
        },
      };
    }

    // PHASE 4: State Transition
    // Calculate realized P&L
    const realizedPnL = calculateRealizedPnL(
      position.side,
      position.entryPrice,
      closePrice,
      position.size,
      position.commissionFee,
      position.swapFee || 0
    );

    // Create closed position
    const closedPosition = {
      ...position,
      status: "CLOSED" as const,
      closedPrice: closePrice,
      closedAt: timestamp,
      realizedPnL,
      closedBy: closedBy || "USER",
    };

    // Update positions map
    const newPositions = new Map(state.positions);
    newPositions.set(positionId, closedPosition);

    // Update account balance and recalculate
    let totalUnrealizedPnL = 0;
    let totalMarginUsed = 0;
    newPositions.forEach((pos) => {
      if (pos.status !== "CLOSED") {
        totalUnrealizedPnL += pos.unrealizedPnL;
        totalMarginUsed += pos.marginUsed;
      }
    });

    const newBalance = state.account.balance + realizedPnL;
    const newEquity = newBalance + state.account.bonus + totalUnrealizedPnL;
    const newFreeMargin = newEquity - totalMarginUsed;
    const newMarginLevel = totalMarginUsed > 0 ? (newEquity / totalMarginUsed) * 100 : null;

    const updatedAccount: AccountState = {
      ...state.account,
      balance: newBalance,
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

    // PHASE 5: Effects
    const effects = [
      {
        type: "PositionClosed",
        positionId,
        realizedPnL,
        margin: position.marginUsed,
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
        code: "CLOSE_POSITION_ERROR",
        message: error instanceof Error ? error.message : "Failed to close position",
      },
    };
  }
}
