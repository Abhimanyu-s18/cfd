/**
 * effects.ts - Side effect definitions
 * 
 * Effects are notifications of state changes.
 * Engine produces effects; system handles delivery.
 * Engine never depends on effect delivery.
 */

export type EngineEffect =
  | PositionOpenedEffect
  | PositionClosedEffect
  | PricesUpdatedEffect
  | MarginCallTriggeredEffect
  | LiquidationTriggeredEffect
  | AccountBalanceUpdatedEffect
  | MarginReleasedEffect
  | AuditRecordCreatedEffect;

export interface PositionOpenedEffect {
  type: "POSITION_OPENED";
  positionId: string;
  accountId: string;
  side: "LONG" | "SHORT";
  size: number;
  entryPrice: number;
}

export interface PositionClosedEffect {
  type: "POSITION_CLOSED";
  positionId: string;
  accountId: string;
  reason: "USER" | "ADMIN" | "STOP_LOSS" | "TAKE_PROFIT" | "MARGIN_CALL";
  realizedPnL: number;
}

export interface PricesUpdatedEffect {
  type: "PRICES_UPDATED";
  timestamp: string;
  priceCount: number;
}

export interface MarginCallTriggeredEffect {
  type: "MARGIN_CALL_TRIGGERED";
  accountId: string;
  marginLevel: number;
}

export interface LiquidationTriggeredEffect {
  type: "LIQUIDATION_TRIGGERED";
  accountId: string;
  marginLevel: number;
  positionsToClose: number;
}

export interface AccountBalanceUpdatedEffect {
  type: "ACCOUNT_BALANCE_UPDATED";
  accountId: string;
  delta: number; // Positive or negative
  newBalance: number;
}

export interface MarginReleasedEffect {
  type: "MARGIN_RELEASED";
  accountId: string;
  amount: number;
}

export interface AuditRecordCreatedEffect {
  type: "AUDIT_RECORD_CREATED";
  reference: string; // positionId or accountId
  action: string;
  timestamp: string;
}

// TODO: Add effect emitter function
// TODO: Connect to persistence layer
