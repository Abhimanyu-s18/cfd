/**
 * RemoveFundsEvent - Admin removes funds from account
 * 
 * Validations:
 * - INV-DATA-001: Account exists
 * - INV-FIN-008: amount > 0
 * - INV-FIN-001: amount <= account.balance
 * - INV-FIN-001: balance remains >= 0 after removal
 * - Admin metadata required
 */

export interface RemoveFundsEvent {
  type: "REMOVE_FUNDS";
  accountId: string;
  amount: number;
  adminUserId: string;
  reason: string;
  timestamp: string; // ISO 8601
}

// TODO: Add JSON schema validator
// TODO: Add type guard function
