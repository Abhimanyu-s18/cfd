/**
 * IdGenerator.ts - Unique ID interface
 * 
 * Engine does not generate IDs.
 * System generates IDs via this interface.
 */

export interface IdGenerator {
  /**
   * Generate unique position ID
   * Never called by engine - IDs passed in via events
   * Used for system-level orchestration only
   */
  generatePositionId(): string;
  
  generateAccountId(): string;
  
  generateTransactionId(): string;
}

// TODO: Create implementations (UUID, custom, etc)
