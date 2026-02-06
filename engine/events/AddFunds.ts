/**
 * AddFundsEvent - Admin adds funds to account
 * 
 * Validations:
 * - INV-DATA-001: Account exists
 * - INV-FIN-008: amount > 0
 * - Admin metadata required
 * - INV-FIN-007: Balance updated
 */

export interface AddFundsEvent {
  type: "ADD_FUNDS";
  accountId: string;
  amount: number;
  adminUserId: string;
  reason: string;
  timestamp: string; // ISO 8601
}

// TODO: Add JSON schema validator
// TODO: Add type guard function
