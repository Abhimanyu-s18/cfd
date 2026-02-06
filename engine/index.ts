/**
 * ENGINE ENTRYPOINT
 * 
 * The ONLY legal way to interact with the engine
 * 
 * Signature:
 * function runEngine(state: EngineState, event: EngineEvent): EngineResult
 * 
 * Rules:
 * - Pure function (no side effects)
 * - Deterministic (same input → same output)
 * - Synchronous (no async)
 * - Stateless (state passed in, returned in result)
 */

import { EngineState } from "./state/EngineState";
import { EngineEvent } from "./events/EngineEvent";
import { validateEvent, EngineValidationError } from "./validation/validateEvent";
import { executeEvent, EngineResult } from "./execution/executeEvent";

/**
 * Process a single event through the engine
 * 
 * @param state Current engine state
 * @param event Event to process
 * @returns EngineResult (success with new state, or failure)
 */
export function runEngine(
  state: EngineState,
  event: EngineEvent
): EngineResult {
  try {
    // PHASE 1: VALIDATE
    // All invariants checked here. First failure stops execution.
    // State is NOT changed during validation.
    validateEvent(state, event);

    // PHASE 2: EXECUTE
    // If validation passed, execute the event.
    // Calculate new state - orchestration only, no validation.
    const result = executeEvent(state, event);
    
    return result;
  } catch (error) {
    if (error instanceof EngineValidationError) {
      return {
        success: false,
        error: {
          code: error.code,
          invariantId: error.invariantId,
          message: error.message,
        },
      };
    }
    
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

// Export types and interfaces
export { EngineState } from "./state/EngineState";
export { AccountState } from "./state/AccountState";
export { PositionState } from "./state/PositionState";
export { MarketState } from "./state/MarketState";
export { EngineEvent } from "./events/EngineEvent";
export { EngineResult } from "./execution/executeEvent";
export { EngineEffect } from "./effects/audit";
