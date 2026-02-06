/**
 * UpdatePricesEvent - Update market prices and trigger SL/TP
 * 
 * Validations:
 * - INV-DATA-004: marketId exists
 * - INV-DATA-004: markPrice > 0
 * - Triggers SL/TP checks for all positions
 * - Triggers margin call/stop out checks
 * - Recalculates all derived fields
 */

export interface UpdatePricesEvent {
  type: "UPDATE_PRICES";
  prices: Map<string, number>; // marketId -> markPrice
  timestamp: string; // ISO 8601
}

// TODO: Add JSON schema validator
// TODO: Add type guard function
