/**
 * sl-tp-triggers.test.ts - Stop Loss and Take Profit Trigger Tests
 * 
 * Tests INV-RISK-005 (Stop Loss), INV-RISK-006 (Take Profit), INV-RISK-007 (Mutual Exclusivity)
 */

import { EngineState } from "../../state/EngineState";
import { AccountState } from "../../state/AccountState";
import { PositionState } from "../../state/PositionState";
import { MarketState } from "../../state/MarketState";
import { updatePrices } from "../../execution/updatePrices";

/**
 * Helper: Create a test state with a single position already open
 */
function createStateWithPosition(
  position: PositionState
): EngineState {
  const account: AccountState = {
    accountId: "A1",
    balance: 10000.0,
    bonus: 0.0,
    marginUsed: position.marginUsed,
    equity: 10000.0,
    freeMargin: 10000.0 - position.marginUsed,
    marginLevel: (10000.0 / position.marginUsed) * 100,
    status: "ACTIVE",
    maxPositions: 10,
    createdAt: new Date().toISOString(),
  };

  const markets = new Map<string, MarketState>([
    [
      "EURUSD",
      {
        marketId: "EURUSD",
        symbol: "EUR/USD",
        assetClass: "FOREX",
        markPrice: 1.1000,
        minSize: 0.01,
        maxSize: 100.0,
        maxLeverage: 100,
      },
    ],
  ]);

  const positions = new Map<string, PositionState>([[position.positionId, position]]);

  return {
    account,
    positions,
    markets,
  };
}

/**
 * Helper: Create a LONG position
 */
function createLongPosition(
  positionId: string,
  entryPrice: number,
  size: number = 1.0,
  stopLoss?: number,
  takeProfit?: number
): PositionState {
  return {
    positionId,
    accountId: "A1",
    marketId: "EURUSD",
    side: "LONG",
    size,
    entryPrice,
    leverage: 100,
    stopLoss,
    takeProfit,
    status: "OPEN",
    openedAt: new Date().toISOString(),
    unrealizedPnL: 0,
    realizedPnL: undefined,
    marginUsed: entryPrice * size * 0.01,
    commissionFee: 10,
    swapFee: 0,
  };
}

/**
 * Helper: Create a SHORT position
 */
function createShortPosition(
  positionId: string,
  entryPrice: number,
  size: number = 1.0,
  stopLoss?: number,
  takeProfit?: number
): PositionState {
  return {
    positionId,
    accountId: "A1",
    marketId: "EURUSD",
    side: "SHORT",
    size,
    entryPrice,
    leverage: 100,
    stopLoss,
    takeProfit,
    status: "OPEN",
    openedAt: new Date().toISOString(),
    unrealizedPnL: 0,
    realizedPnL: undefined,
    marginUsed: entryPrice * size * 0.01,
    commissionFee: 10,
    swapFee: 0,
  };
}

/**
 * Helper: Create UpdatePrices event
 */
function createUpdatePricesEvent(prices: Record<string, number>) {
  return {
    type: "UPDATE_PRICES",
    prices: new Map(Object.entries(prices)),
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// BASIC TRIGGER TESTS
// ============================================================================

describe("Stop Loss and Take Profit Triggers", () => {
  test("LONG + price rises to TP → closes with Take Profit effect", () => {
    const position = createLongPosition("P1", 1.1000, 1.0, undefined, 1.1200);
    const state = createStateWithPosition(position);

    const event = createUpdatePricesEvent({ EURUSD: 1.1200 });
    const result = updatePrices(state, event);

    expect(result.success).toBe(true);
    expect(result.newState?.positions.get("P1")?.status).toBe("CLOSED");
    expect(result.newState?.positions.get("P1")?.closedBy).toBe("TAKE_PROFIT");
    expect(result.newState?.positions.get("P1")?.closedPrice).toBeCloseTo(1.1200);
    expect(result.effects?.find((e: any) => e.type === "TakeProfitTriggered")).toBeDefined();
  });

  test("LONG + price falls to SL → closes with Stop Loss effect", () => {
    const position = createLongPosition("P1", 1.1000, 1.0, 1.0900);
    const state = createStateWithPosition(position);

    const event = createUpdatePricesEvent({ EURUSD: 1.0900 });
    const result = updatePrices(state, event);

    expect(result.success).toBe(true);
    expect(result.newState?.positions.get("P1")?.status).toBe("CLOSED");
    expect(result.newState?.positions.get("P1")?.closedBy).toBe("STOP_LOSS");
    expect(result.effects?.find((e: any) => e.type === "StopLossTriggered")).toBeDefined();
  });

  test("SHORT + price falls to TP → closes with Take Profit effect", () => {
    const position = createShortPosition("P1", 1.1000, 1.0, undefined, 1.0900);
    const state = createStateWithPosition(position);

    const event = createUpdatePricesEvent({ EURUSD: 1.0900 });
    const result = updatePrices(state, event);

    expect(result.success).toBe(true);
    expect(result.newState?.positions.get("P1")?.status).toBe("CLOSED");
    expect(result.newState?.positions.get("P1")?.closedBy).toBe("TAKE_PROFIT");
    expect(result.effects?.find((e: any) => e.type === "TakeProfitTriggered")).toBeDefined();
  });

  test("SHORT + price rises to SL → closes with Stop Loss effect", () => {
    const position = createShortPosition("P1", 1.1000, 1.0, 1.1100);
    const state = createStateWithPosition(position);

    const event = createUpdatePricesEvent({ EURUSD: 1.1100 });
    const result = updatePrices(state, event);

    expect(result.success).toBe(true);
    expect(result.newState?.positions.get("P1")?.status).toBe("CLOSED");
    expect(result.newState?.positions.get("P1")?.closedBy).toBe("STOP_LOSS");
    expect(result.effects?.find((e: any) => e.type === "StopLossTriggered")).toBeDefined();
  });
});

// ============================================================================
// BOUNDARY CONDITION TESTS
// ============================================================================

describe("Boundary Conditions for Triggers", () => {
  test("LONG + price exactly equal to SL → triggers (INV-RISK-005)", () => {
    const position = createLongPosition("P1", 1.1000, 1.0, 1.0900);
    const state = createStateWithPosition(position);

    const event = createUpdatePricesEvent({ EURUSD: 1.0900 });
    const result = updatePrices(state, event);

    expect(result.newState?.positions.get("P1")?.status).toBe("CLOSED");
    expect(result.newState?.positions.get("P1")?.closedBy).toBe("STOP_LOSS");
  });

  test("LONG + price just above SL → does NOT trigger", () => {
    const position = createLongPosition("P1", 1.1000, 1.0, 1.0900);
    const state = createStateWithPosition(position);

    const event = createUpdatePricesEvent({ EURUSD: 1.0901 });
    const result = updatePrices(state, event);

    expect(result.newState?.positions.get("P1")?.status).toBe("OPEN");
  });

  test("LONG + price exactly equal to TP → triggers (INV-RISK-006)", () => {
    const position = createLongPosition("P1", 1.1000, 1.0, undefined, 1.1200);
    const state = createStateWithPosition(position);

    const event = createUpdatePricesEvent({ EURUSD: 1.1200 });
    const result = updatePrices(state, event);

    expect(result.newState?.positions.get("P1")?.status).toBe("CLOSED");
    expect(result.newState?.positions.get("P1")?.closedBy).toBe("TAKE_PROFIT");
  });

  test("LONG + price just below TP → does NOT trigger", () => {
    const position = createLongPosition("P1", 1.1000, 1.0, undefined, 1.1200);
    const state = createStateWithPosition(position);

    const event = createUpdatePricesEvent({ EURUSD: 1.1199 });
    const result = updatePrices(state, event);

    expect(result.newState?.positions.get("P1")?.status).toBe("OPEN");
  });
});

// ============================================================================
// MUTUAL EXCLUSIVITY TESTS (INV-RISK-007)
// ============================================================================

describe("SL/TP Mutual Exclusivity (INV-RISK-007)", () => {
  test("Both SL and TP set: SL triggers first (deterministic order)", () => {
    // LONG with both SL < entry and TP > entry
    const position = createLongPosition("P1", 1.1000, 1.0, 1.0900, 1.1200);
    const state = createStateWithPosition(position);

    // Price at SL level
    const event = createUpdatePricesEvent({ EURUSD: 1.0900 });
    const result = updatePrices(state, event);

    // SL should fire (checked first)
    expect(result.newState?.positions.get("P1")?.closedBy).toBe("STOP_LOSS");
    
    // Only one trigger effect
    const slEffects = result.effects?.filter((e: any) => e.type === "StopLossTriggered");
    expect(slEffects?.length).toBe(1);
  });

  test("Both SL and TP set: TP triggers when price not at SL", () => {
    const position = createLongPosition("P1", 1.1000, 1.0, 1.0900, 1.1200);
    const state = createStateWithPosition(position);

    // Price at TP level (SL not triggered)
    const event = createUpdatePricesEvent({ EURUSD: 1.1200 });
    const result = updatePrices(state, event);

    // TP should fire
    expect(result.newState?.positions.get("P1")?.closedBy).toBe("TAKE_PROFIT");
    
    // Only one trigger effect
    const tpEffects = result.effects?.filter((e: any) => e.type === "TakeProfitTriggered");
    expect(tpEffects?.length).toBe(1);
  });
});

// ============================================================================
// MISSING SL/TP TESTS
// ============================================================================

describe("Missing Stop Loss or Take Profit", () => {
  test("No SL set: large price drop does NOT trigger", () => {
    const position = createLongPosition("P1", 1.1000, 1.0, undefined);
    const state = createStateWithPosition(position);

    const event = createUpdatePricesEvent({ EURUSD: 0.9000 }); // Crash
    const result = updatePrices(state, event);

    expect(result.newState?.positions.get("P1")?.status).toBe("OPEN");
    expect(result.effects?.find((e: any) => e.type === "StopLossTriggered")).toBeUndefined();
  });

  test("No TP set: large price rise does NOT trigger", () => {
    const position = createLongPosition("P1", 1.1000, 1.0, 1.0900);
    const state = createStateWithPosition(position);

    const event = createUpdatePricesEvent({ EURUSD: 1.5000 }); // Spike
    const result = updatePrices(state, event);

    expect(result.newState?.positions.get("P1")?.status).toBe("OPEN");
    expect(result.effects?.find((e: any) => e.type === "TakeProfitTriggered")).toBeUndefined();
  });
});

// ============================================================================
// DETERMINISTIC REPLAY TEST
// ============================================================================

describe("Deterministic Replay", () => {
  test("Same events produce identical results on replay", () => {
    const results = [];

    for (let i = 0; i < 3; i++) {
      const position = createShortPosition("P1", 1.1000, 1.0, 1.1200);
      const state = createStateWithPosition(position);

      const event = createUpdatePricesEvent({ EURUSD: 1.1200 });
      const result = updatePrices(state, event);

      results.push({
        success: result.success,
        status: result.newState?.positions.get("P1")?.status,
        closedBy: result.newState?.positions.get("P1")?.closedBy,
        realizedPnL: result.newState?.positions.get("P1")?.realizedPnL,
      });
    }

    // All replays should be identical
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toEqual(results[0]);
    }
  });
});

// ============================================================================
// STATE IMMUTABILITY TEST
// ============================================================================

describe("State Immutability", () => {
  test("Original state not mutated after trigger", () => {
    const position = createLongPosition("P1", 1.1000, 1.0, undefined, 1.1200);
    const originalState = createStateWithPosition(position);

    const originalBalance = originalState.account.balance;
    const originalStatus = originalState.positions.get("P1")?.status;

    const event = createUpdatePricesEvent({ EURUSD: 1.1200 });
    updatePrices(originalState, event);

    // Original state unchanged
    expect(originalState.account.balance).toBe(originalBalance);
    expect(originalState.positions.get("P1")?.status).toBe(originalStatus);
  });
});
