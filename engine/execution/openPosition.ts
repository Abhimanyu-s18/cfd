/**
 * openPosition - Execute position opening
 * 
 * Actions:
 * 1. Create new position state (PENDING or OPEN)
 * 2. Add to account.positions
 * 3. Update account margin
 * 4. Calculate derived fields
 * 5. Emit PositionOpenedEffect
 * 
 * No validation here - validate before calling
 */

import { EngineState } from "../state/EngineState";
import { OpenPositionEvent } from "../events/OpenPosition";

export function openPosition(
  state: EngineState,
  event: OpenPositionEvent
): EngineState {
  // TODO: Implement position creation
  // TODO: Update marginUsed
  // TODO: Recalculate derived fields (equity, freeMargin, marginLevel)
  // TODO: Return new immutable state
  return state;
}
