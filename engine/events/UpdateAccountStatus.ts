/**
 * UpdateAccountStatusEvent - Change account status
 * 
 * Validations:
 * - INV-DATA-001: Account exists
 * - INV-STATE-002: Valid status transition
 * - Admin metadata required
 */

export interface UpdateAccountStatusEvent {
  type: "UPDATE_ACCOUNT_STATUS";
  accountId: string;
  status: "ACTIVE" | "LIQUIDATION_ONLY" | "CLOSED";
  adminUserId: string;
  reason: string;
  timestamp: string; // ISO 8601
}

// TODO: Add JSON schema validator
// TODO: Add type guard function
