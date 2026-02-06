/**
 * SetTakeProfitEvent - Set or update take profit on open position
 * 
 * Validations:
 * - INV-POS-003: Position exists and belongs to account
 * - INV-POS-001: Position status is OPEN
 * - INV-POS-008: Take profit logic
 * - takeProfit can be null (removes existing TP)
 */

export interface SetTakeProfitEvent {
  type: "SET_TAKE_PROFIT";
  positionId: string;
  accountId: string;
  takeProfit: number | null;
  timestamp: string; // ISO 8601
}

// TODO: Add JSON schema validator
// TODO: Add type guard function
