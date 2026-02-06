/**
 * SetStopLossEvent - Set or update stop loss on open position
 * 
 * Validations:
 * - INV-POS-003: Position exists and belongs to account
 * - INV-POS-001: Position status is OPEN
 * - INV-POS-007: Stop loss logic
 * - stopLoss can be null (removes existing SL)
 */

export interface SetStopLossEvent {
  type: "SET_STOP_LOSS";
  positionId: string;
  accountId: string;
  stopLoss: number | null;
  timestamp: string; // ISO 8601
}

// TODO: Add JSON schema validator
// TODO: Add type guard function
