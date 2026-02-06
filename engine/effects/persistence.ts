/**
 * persistence.ts - Hooks for persisting effects
 * 
 * Engine does not persist.
 * System persists based on effects.
 */

import { EngineEffect } from "./audit";

export interface PersistenceSink {
  /**
   * Called with each effect produced by engine
   * System responsible for reliability and retry logic
   */
  persistEffect(effect: EngineEffect): Promise<void>;
}

// TODO: Create no-op implementation for testing
// TODO: Create database implementation for production
