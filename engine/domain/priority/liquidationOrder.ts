/**
 * liquidationOrder.ts - Position liquidation priority
 * 
 * Reference: ENGINE_GOLDEN_PATHS.md GP-3
 * 
 * When margin level falls below 20%, positions are liquidated in this order:
 * 1. Largest unrealized losses first
 * 2. Then oldest positions by openedAt timestamp
 * 
 * Invariant: INV-DATA-002 (liquidation decisions are logged)
 */

import { PositionState } from "../../state/PositionState";

export function getLiquidationOrder(
  positions: PositionState[]
): PositionState[] {
  // TODO: Sort by:
  // 1. Largest unrealized losses (most negative) first
  // 2. Then oldest positions (earliest openedAt)
  // Returns array in liquidation order
  return [];
}

export function getPositionLossValue(position: PositionState): number {
  // TODO: Return unrealizedPnL (negative values = losses)
  // Used for sorting in liquidation
  return position.unrealizedPnL;
}
