/**
 * OpenPositionEvent - Request to open a new trading position
 * 
 * Validations:
 * - INV-DATA-001: Account exists
 * - INV-DATA-001: Market exists
 * - INV-POS-002: positionId unique
 * - INV-POS-005: size > 0
 * - INV-POS-006: executionPrice > 0
 * - INV-POS-007: Stop loss logic
 * - INV-POS-008: Take profit logic
 * - INV-FIN-009: Leverage within limits
 * - INV-RISK-008: Size >= market.minSize
 * - INV-RISK-009: Size <= market.maxSize
 * - INV-STATE-003: Account status allows trading
 * - INV-POS-009: Position count not exceeded
 * - INV-FIN-004: Sufficient free margin
 * - INV-RISK-004: Margin level check
 * - INV-RISK-010: Exposure limits
 */

export interface OpenPositionEvent {
  type: "OPEN_POSITION";
  positionId: string;
  accountId: string;
  marketId: string;
  side: "LONG" | "SHORT";
  size: number;
  executionPrice: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  orderType: "MARKET" | "LIMIT";
  timestamp: string; // ISO 8601
}

// TODO: Add JSON schema validator
// TODO: Add type guard function
