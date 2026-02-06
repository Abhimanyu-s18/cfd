/**
 * AccountState - Immutable account data
 * 
 * Invariants:
 * - INV-FIN-001: balance >= 0
 * - INV-FIN-002: equity = balance + bonus + sum(unrealizedPnL)
 * - INV-FIN-003: marginUsed = sum(position.marginUsed)
 * - INV-FIN-004: freeMargin = equity - marginUsed
 * - INV-FIN-005: marginLevel = (equity / marginUsed) × 100
 * - INV-FIN-006: bonus separation and usage rules
 * - INV-STATE-001: Account state consistency
 * - INV-STATE-003: Account status constraints
 */

export interface AccountState {
  readonly accountId: string;
  readonly balance: number; // INV-FIN-001
  readonly bonus: number; // INV-FIN-006
  readonly equity: number; // INV-FIN-002 (derived)
  readonly marginUsed: number; // INV-FIN-003 (derived)
  readonly freeMargin: number; // INV-FIN-004 (derived)
  readonly marginLevel: number | null; // INV-FIN-005 (derived)
  readonly status: "ACTIVE" | "LIQUIDATION_ONLY" | "CLOSED"; // INV-STATE-003
  readonly maxPositions: number; // INV-POS-009
  readonly createdAt: string; // ISO 8601
}

// TODO: Implement derived field calculations in domain/calculations
// TODO: Implement status transition rules in validation/validateAccount
