/**
 * CancelPendingPositionEvent - Cancel a position in PENDING status
 * 
 * Validations:
 * - INV-POS-003: Position exists and belongs to account
 * - INV-POS-001: Position status is PENDING
 * - Releases reserved margin
 */

export interface CancelPendingPositionEvent {
  type: "CANCEL_PENDING_POSITION";
  positionId: string;
  accountId: string;
  timestamp: string; // ISO 8601
}

// TODO: Add JSON schema validator
// TODO: Add type guard function
