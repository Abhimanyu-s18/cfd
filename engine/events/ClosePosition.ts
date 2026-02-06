/**
 * ClosePositionEvent - Request to close an open position
 * 
 * Validations:
 * - INV-DATA-001: Account exists
 * - INV-POS-003: Position exists and belongs to account
 * - INV-POS-001: Position status is OPEN
 * - INV-POS-011: closePrice > 0
 * - INV-DATA-003: Temporal ordering (timestamp >= openedAt)
 * - INV-POS-013: Admin close requires metadata
 * - INV-FIN-001: Balance remains non-negative
 * - INV-FIN-007: Realized P&L applied to balance
 */

export interface ClosePositionEvent {
  type: "CLOSE_POSITION";
  positionId: string;
  accountId: string;
  closePrice: number;
  closedBy: "USER" | "ADMIN" | "STOP_LOSS" | "TAKE_PROFIT" | "MARGIN_CALL";
  adminUserId?: string;
  adminCloseComment?: string;
  timestamp: string; // ISO 8601
}

// TODO: Add JSON schema validator
// TODO: Add type guard function
