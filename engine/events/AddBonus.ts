/**
 * AddBonusEvent - Admin adds bonus funds to account
 * 
 * Validations:
 * - INV-DATA-001: Account exists
 * - INV-FIN-008: amount > 0
 * - INV-FIN-006: Bonus separation maintained
 * - Admin metadata required
 */

export interface AddBonusEvent {
  type: "ADD_BONUS";
  accountId: string;
  amount: number;
  adminUserId: string;
  reason: string;
  timestamp: string; // ISO 8601
}

// TODO: Add JSON schema validator
// TODO: Add type guard function
