/**
 * updatePrices - Execute price updates and trigger SL/TP (Phases 4-6)
 * 
 * Phase 4: State Transition
 * - Update market prices
 * - Recalculate unrealized P&L for all positions
 * - Check SL/TP triggers (deterministic order)
 * - Auto-close triggered positions
 * - Check margin levels
 * - Trigger stop-out if needed
 * - Recalculate account derived fields
 * 
 * Phase 5: Effects
 * - Emit PricesUpdatedEffect
 * - Emit SLTriggeredEffect
 * - Emit TPTriggeredEffect
 * - Emit StopOutEffect (if triggered)
 * 
 * Phase 6: Commit
 * - Return immutable new state
 */

import { EngineState } from "../state/EngineState";
import { EngineResult } from "./executeEvent";
import { calculateUnrealizedPnL } from "../domain/calculations/pnl";
import { calculateRealizedPnL } from "../domain/calculations/pnl";
import { assertStopLossTrigger, assertTakeProfitTrigger } from "../domain/invariants/risk";
import { getLiquidationOrder } from "../domain/priority/liquidationOrder";
import { AccountState } from "../state/AccountState";

export function updatePrices(
  state: EngineState,
  event: any
): EngineResult {
  try {
    const { prices, timestamp } = event;

    // PHASE 4: State Transition
    // Update markets
    const newMarkets = new Map(state.markets);
    prices.forEach((price: number, marketId: string) => {
      const market = newMarkets.get(marketId);
      if (market) {
        newMarkets.set(marketId, {
          ...market,
          markPrice: price,
        });
      }
    });

    // Recalculate positions and check triggers
    const newPositions = new Map(state.positions);
    let totalUnrealizedPnL = 0;
    let totalMarginUsed = 0;
    let marginCallTriggered = false;
    const effects: any[] = [
      {
        type: "PricesUpdated",
        prices,
        timestamp,
      },
    ];

    newPositions.forEach((position) => {
      if (position.status === "CLOSED") return;

      const market = newMarkets.get(position.marketId);
      if (!market) return;

      const currentPrice = market.markPrice;

      // Check SL trigger (deterministic: check SL first)
      const slTriggered = assertStopLossTrigger(position.side, position.stopLoss, currentPrice);
      if (slTriggered) {
        // Close position with SL trigger
        const realizedPnL = calculateRealizedPnL(
          position.side,
          position.entryPrice,
          currentPrice,
          position.size,
          position.commissionFee,
          position.swapFee || 0
        );

        const closedPosition = {
          ...position,
          status: "CLOSED" as const,
          closedPrice: currentPrice,
          closedAt: timestamp,
          realizedPnL,
          closedBy: "STOP_LOSS" as const,
        };

        newPositions.set(position.positionId, closedPosition);
        effects.push({
          type: "StopLossTriggered",
          positionId: position.positionId,
          price: currentPrice,
          realizedPnL,
        });
        return;
      }

      // Check TP trigger (if no SL)
      const tpTriggered = assertTakeProfitTrigger(position.side, position.takeProfit, currentPrice);
      if (tpTriggered) {
        // Close position with TP trigger
        const realizedPnL = calculateRealizedPnL(
          position.side,
          position.entryPrice,
          currentPrice,
          position.size,
          position.commissionFee,
          position.swapFee || 0
        );

        const closedPosition = {
          ...position,
          status: "CLOSED" as const,
          closedPrice: currentPrice,
          closedAt: timestamp,
          realizedPnL,
          closedBy: "TAKE_PROFIT" as const,
        };

        newPositions.set(position.positionId, closedPosition);
        effects.push({
          type: "TakeProfitTriggered",
          positionId: position.positionId,
          price: currentPrice,
          realizedPnL,
        });
        return;
      }

      // Position still open - recalculate P&L
      const unrealizedPnL = calculateUnrealizedPnL(
        position.side,
        position.entryPrice,
        currentPrice,
        position.size
      );

      const updatedPosition = {
        ...position,
        unrealizedPnL,
      };

      newPositions.set(position.positionId, updatedPosition);
      totalUnrealizedPnL += unrealizedPnL;
      totalMarginUsed += position.marginUsed;
    });

    // Recalculate account
    let totalBalance = state.account.balance;
    newPositions.forEach((pos) => {
      if (pos.status === "CLOSED" && pos.realizedPnL) {
        totalBalance += pos.realizedPnL;
      }
    });
    totalUnrealizedPnL = 0;
    totalMarginUsed = 0;
    newPositions.forEach((pos) => {
      if (pos.status !== "CLOSED") {
        totalUnrealizedPnL += pos.unrealizedPnL;
        totalMarginUsed += pos.marginUsed;
      }
    });

    const newEquity = totalBalance + state.account.bonus + totalUnrealizedPnL;
    const newFreeMargin = newEquity - totalMarginUsed;
    let newMarginLevel = totalMarginUsed > 0 ? (newEquity / totalMarginUsed) * 100 : null;

    // Check margin level for stop-out (< 20%) and perform liquidation cascade
    if (newMarginLevel !== null && newMarginLevel < 20) {
      marginCallTriggered = true;

      // Gather open positions and sort by most-losing first (lowest unrealizedPnL)
      const openPositions: Array<any> = [];
      newPositions.forEach((pos) => {
        if (pos.status !== "CLOSED") {
          openPositions.push(pos);
        }
      });

      // Sort by liquidation priority: most-loss first, oldest position on tie
      const orderedPositions = getLiquidationOrder(openPositions);

      const liquidated: Array<any> = [];

      // Liquidate until margin level recovers >= 20% or no positions left
      for (const pos of orderedPositions) {
        const market = newMarkets.get(pos.marketId);
        const closePrice = market ? market.markPrice : undefined;
        const realizedPnL = closePrice
          ? calculateRealizedPnL(
              pos.side,
              pos.entryPrice,
              closePrice,
              pos.size,
              pos.commissionFee,
              pos.swapFee || 0
            )
          : 0;

        const closedPosition = {
          ...pos,
          status: "CLOSED" as const,
          closedPrice: closePrice,
          closedAt: timestamp,
          realizedPnL,
          closedBy: "MARGIN_CALL" as const,
        };

        newPositions.set(pos.positionId, closedPosition);
        liquidated.push({ positionId: pos.positionId, realizedPnL, price: closePrice });

        // Update running totals after each liquidation
        totalBalance += realizedPnL;
        totalUnrealizedPnL = 0;
        totalMarginUsed = 0;
        newPositions.forEach((p) => {
          if (p.status !== "CLOSED") {
            totalUnrealizedPnL += p.unrealizedPnL || 0;
            totalMarginUsed += p.marginUsed || 0;
          }
        });

        // Recalculate margin level
        const interimEquity = totalBalance + state.account.bonus + totalUnrealizedPnL;
        const interimMarginLevel = totalMarginUsed > 0 ? (interimEquity / totalMarginUsed) * 100 : null;

        effects.push({
          type: "PositionLiquidated",
          positionId: pos.positionId,
          price: closePrice,
          realizedPnL,
        });

        if (interimMarginLevel === null || interimMarginLevel >= 20) {
          // Sufficiently recovered
          newMarginLevel = interimMarginLevel;
          break;
        }
      }

      // Emit StopOut effect summarizing liquidation
      effects.push({
        type: "StopOut",
        marginLevel: newMarginLevel,
        message: "Account stopped out - positions liquidated",
        liquidated,
      });
    }

    const updatedAccount: AccountState = {
      ...state.account,
      balance: totalBalance,
      marginUsed: totalMarginUsed,
      equity: newEquity,
      freeMargin: newFreeMargin,
      marginLevel: newMarginLevel,
      status: marginCallTriggered ? "LIQUIDATION_ONLY" : state.account.status,
    };

    const newState: EngineState = {
      account: updatedAccount,
      positions: newPositions,
      markets: newMarkets,
    };

    // PHASE 6: Commit
    return {
      success: true,
      newState,
      effects,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "UPDATE_PRICES_ERROR",
        message: error instanceof Error ? error.message : "Failed to update prices",
      },
    };
  }
}
