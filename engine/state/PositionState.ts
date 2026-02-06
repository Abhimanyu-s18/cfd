/**
 * PositionState - Immutable position data
 * 
 * Invariants:
 * - INV-POS-001: Status progression validation
 * - INV-POS-002: Position ID uniqueness
 * - INV-POS-003: Position ownership (accountId reference)
 * - INV-POS-004: Immutability after close
 * - INV-POS-005: Size > 0
 * - INV-POS-006: Entry price > 0
 * - INV-POS-007: Stop loss logic (LONG: SL < entry, SHORT: SL > entry)
 * - INV-POS-008: Take profit logic (LONG: TP > entry, SHORT: TP < entry)
 * - INV-POS-009: Position count limit per account
 * - INV-POS-010: Asset class consistency
 * - INV-POS-012: Close reason traceability
 * - INV-FIN-010: Margin calculation
 * - INV-FIN-011: LONG P&L calculation
 * - INV-FIN-012: SHORT P&L calculation
 * - INV-FIN-014: Fee accumulation
 */

export interface PositionState {
  readonly positionId: string; // INV-POS-002
  readonly accountId: string; // INV-POS-003
  readonly marketId: string; // INV-POS-010
  readonly side: "LONG" | "SHORT";
  readonly size: number; // INV-POS-005
  readonly entryPrice: number; // INV-POS-006
  readonly leverage: number;
  readonly stopLoss?: number; // INV-POS-007
  readonly takeProfit?: number; // INV-POS-008
  readonly unrealizedPnL: number; // INV-FIN-011 | INV-FIN-012 (derived)
  readonly realizedPnL?: number; // INV-FIN-014
  readonly marginUsed: number; // INV-FIN-010 (derived)
  readonly commissionFee: number;
  readonly swapFee: number;
  readonly status: "PENDING" | "OPEN" | "CLOSED"; // INV-POS-001
  readonly closedBy?: "USER" | "ADMIN" | "STOP_LOSS" | "TAKE_PROFIT" | "MARGIN_CALL"; // INV-POS-012
  readonly openedAt: string; // ISO 8601
  readonly closedAt?: string; // ISO 8601
  readonly closedPrice?: number;
  readonly adminUserId?: string;
  readonly adminCloseComment?: string;
}

// TODO: Implement P&L calculations in domain/calculations/pnl.ts
// TODO: Implement margin calculation in domain/calculations/margin.ts
// TODO: Implement fee logic in domain/calculations/fees.ts
// TODO: Implement SL/TP logic validation in validation/validatePosition.ts
