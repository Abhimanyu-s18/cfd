/**
 * closePosition - Execute position closing
 * 
 * Actions:
 * 1. Verify position is OPEN
 * 2. Calculate final P&L (rawPnL - fees)
 * 3. Update position: status=CLOSED, realizedPnL, closedPrice, closedAt
 * 4. Update account.balance += realizedPnL
 * 5. Release margin
 * 6. Recalculate derived fields
 * 7. Emit PositionClosedEffect
 * 
 * No validation here - validate before calling
 */

import { EngineState } from "../state/EngineState";
import { ClosePositionEvent } from "../events/ClosePosition";

export function closePosition(
  state: EngineState,
  event: ClosePositionEvent
): EngineState {
  // TODO: Implement position closure
  // TODO: Calculate realized P&L
  // TODO: Update balance
  // TODO: Release margin
  // TODO: Recalculate derived fields
  // TODO: Return new immutable state
  return state;
}
