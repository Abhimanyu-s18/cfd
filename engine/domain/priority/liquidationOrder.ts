/**
 * liquidationOrder.ts - Position liquidation priority
 * 
 * Reference: ENGINE_GOLDEN_PATHS.md GP-3
 * 
 * When margin level falls below 20%, positions are liquidated in this order:
 * 1. Largest unrealized losses first (most negative unrealizedPnL)
 * 2. Then oldest positions by openedAt timestamp
 * 
 * Rationale: Liquidate loss-making positions first to minimize collateral damage.
 * Among positions with similar PnL, liquidate oldest first (fairness across time).
 * 
 * Invariant: INV-DATA-002 (liquidation decisions are logged)
 * INV-RISK-003 (liquidation order is deterministic and logged)
 */

import { PositionState } from "../../state/PositionState";

/**
 * getLiquidationOrder - Returns positions sorted by liquidation priority
 * 
 * Sort by:
 * 1. Unrealized loss (most negative first) - primary criterion
 * 2. openedAt timestamp (oldest first) - tiebreaker for same-loss positions
 * 
 * Returns: Array in liquidation order (first item = first to liquidate)
 * 
 * Pure function: YES (no state access, no side effects)
 * Deterministic: YES (same input → same output)
 * 
 * @param positions Array of open positions
 * @returns Sorted array with highest-loss positions first
 */
export function getLiquidationOrder(
  positions: PositionState[]
): PositionState[] {
  // Filter open positions only
  const openPositions = positions.filter((p) => p.status === "OPEN");

  // Sort by unrealizedPnL (ascending = most negative first), then by openedAt (ascending = oldest first)
  return openPositions.sort((a, b) => {
    // Primary sort: unrealizedPnL ascending (most negative first)
    const pnlDiff = (a.unrealizedPnL || 0) - (b.unrealizedPnL || 0);
    if (pnlDiff !== 0) {
      return pnlDiff;
    }

    // Tiebreaker: openedAt timestamp ascending (oldest first)
    const timeA = new Date(a.openedAt).getTime();
    const timeB = new Date(b.openedAt).getTime();
    return timeA - timeB;
  });
}

/**
 * getPositionLossValue - Extract unrealized loss value for sorting
 * 
 * Returns the unrealizedPnL as the loss indicator.
 * Negative values indicate losses; positive values indicate gains.
 * 
 * @param position Single position
 * @returns unrealizedPnL value (negative = loss, positive = gain)
 */
export function getPositionLossValue(position: PositionState): number {
  return position.unrealizedPnL || 0;
}

/**
 * Example liquidation order for 3 positions:
 * 
 * Before: [
 *   { posId: "P1", unrealizedPnL: 100, openedAt: "2026-02-12T10:00:00Z" },   // +100 gain
 *   { posId: "P2", unrealizedPnL: -500, openedAt: "2026-02-12T11:00:00Z" },  // -500 loss
 *   { posId: "P3", unrealizedPnL: -200, openedAt: "2026-02-12T10:30:00Z" },  // -200 loss
 * ]
 * 
 * After getLiquidationOrder():
 * [
 *   { posId: "P2", unrealizedPnL: -500, ... },  // Largest loss → liquidate first
 *   { posId: "P3", unrealizedPnL: -200, ... },  // Smaller loss → liquidate second
 *   { posId: "P1", unrealizedPnL: 100, ... },   // Gainful → liquidate last (if necessary)
 * ]
 */
