/**
 * validateEvent - Main validation dispatcher
 * 
 * Execution order matters. Validates all invariants in dependency order.
 * First failure stops execution and throws.
 * No state changes on validation failure.
 * 
 * Order:
 * 1. validateAccount
 * 2. validateRisk
 * 3. validatePosition
 * Plus event-specific validators
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

export function validateEvent(
  state: EngineState,
  event: EngineEvent
): void {
  // TODO: Implement event type routing
  // TODO: Call type-specific validators
  // TODO: Ensure validation order follows ENGINE_VALIDATION_ORDER.md
  
  switch (event.type) {
    case "OPEN_POSITION":
      // TODO: openPositionValidation
      break;
    case "CLOSE_POSITION":
      // TODO: closePositionValidation
      break;
    case "UPDATE_PRICES":
      // TODO: updatePricesValidation
      break;
    // TODO: Add all other event types
    default:
      throw new Error(`Unknown event type: ${(event as any).type}`);
  }
}
