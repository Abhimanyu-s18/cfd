/**
 * RemoveBonusEvent - Admin removes bonus funds from account
 * 
 * Validations:
 * - INV-DATA-001: Account exists
 * - INV-FIN-008: amount > 0
 * - amount <= account.bonus
 * - INV-FIN-006: Bonus separation maintained
 * - Admin metadata required
 */

export interface RemoveBonusEvent {
  type: "REMOVE_BONUS";
  accountId: string;
  amount: number;
  adminUserId: string;
  reason: string;
  timestamp: string; // ISO 8601
}

// TODO: Add JSON schema validator
// TODO: Add type guard function
