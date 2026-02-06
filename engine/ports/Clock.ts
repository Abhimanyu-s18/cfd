/**
 * Clock.ts - Time interface
 * 
 * Engine does not generate timestamps.
 * System provides times via this interface.
 */

export interface Clock {
  /**
   * Get current time (ISO 8601)
   * Never called by engine - timestamps passed in via events
   * Used for system-level orchestration only
   */
  now(): string; // ISO 8601
}

// TODO: Create implementations (real and test)
