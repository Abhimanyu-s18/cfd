/**
 * executeEvent - Main execution dispatcher
 * 
 * After all validations pass (Phase 1), orchestrate execution phases:
 * - Phase 4: State Transition (create new immutable state)
 * - Phase 5: Effects (emit side effects)
 * - Phase 6: Commit (return result)
 * 
 * No validation here - validation layer ensures all invariants hold.
 */

import { EngineState } from "../state/EngineState";
import { EngineEvent } from "../events/EngineEvent";
import { openPosition } from "./openPosition";
import { closePosition } from "./closePosition";
import { updatePrices } from "./updatePrices";

export function executeEvent(
  state: EngineState,
  event: EngineEvent
): EngineResult {
  try {
    switch (event.type) {
      case "OPEN_POSITION":
        return openPosition(state, event as any);
      case "CLOSE_POSITION":
        return closePosition(state, event as any);
      case "UPDATE_PRICES":
        return updatePrices(state, event as any);
      default:
        return {
          success: false,
          error: {
            code: "UNKNOWN_EVENT_TYPE",
            message: `Event type ${(event as any).type} not implemented`,
          },
        };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: "EXECUTION_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

export interface EngineResult {
  success: boolean;
  newState?: EngineState;
  effects?: any[];
  error?: {
    code: string;
    message: string;
  };
}
