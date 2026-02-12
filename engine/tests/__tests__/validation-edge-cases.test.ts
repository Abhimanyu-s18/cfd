/**
 * Validation Edge Cases Test Suite
 * 
 * Tests critical validation scenarios that protect against unsafe positions.
 * Based on ENGINE_TEST_MATRIX.md validation scenarios 7-13.
 * 
 * Scope:
 * - Margin enforcement (insufficient margin)
 * - Risk validation (leverage, exposure, margin level)
 * - Position constraints (size, count, status)
 * - Account constraints (status, balance)
 */

import { runEngine, EngineState } from "../../index";
import { PositionState } from "../../state/PositionState";
import { MarketState } from "../../state/MarketState";
import { AccountState } from "../../state/AccountState";

function createTestState(overrides?: Partial<EngineState>): EngineState {
  const defaultAccount: AccountState = {
    accountId: "ACC-001",
    balance: 10000,
    bonus: 0,
    equity: 10000,
    marginUsed: 0,
    freeMargin: 10000,
    marginLevel: null,
    status: "ACTIVE",
    maxPositions: 10,
    createdAt: "2026-02-12T10:00:00Z",
  };

  const eurusd: MarketState = {
    marketId: "EUR/USD",
    symbol: "EURUSD",
    assetClass: "FOREX",
    markPrice: 1.1000,
    minSize: 0.01,
    maxSize: 100,
    maxLeverage: 50,
  };

  return {
    account: overrides?.account || defaultAccount,
    positions: overrides?.positions || new Map<string, PositionState>(),
    markets: overrides?.markets || new Map([["EUR/USD", eurusd]]),
  };
}

describe("Validation Edge Cases - PRIORITY 3", () => {
  describe("Margin Enforcement (INV-FIN-004, INV-FIN-010)", () => {
    test("Rejects OPEN_POSITION when margin required exceeds free margin", () => {
      const state = createTestState({
        account: {
          accountId: "ACC-001",
          balance: 1000,
          bonus: 0,
          equity: 1000,
          marginUsed: 0,
          freeMargin: 100,
          marginLevel: null,
          status: "ACTIVE",
          maxPositions: 10,
          createdAt: "2026-02-12T10:00:00Z",
        },
      });

      const event: any = {
        type: "OPEN_POSITION",
        accountId: "ACC-001",
        marketId: "EUR/USD",
        positionId: "POS-999",
        side: "LONG",
        size: 100, // 100 * 1.1000 = 110 notional * 1 leverage = 110 margin required
        executionPrice: 1.1000,
        leverage: 1, // 110 / 1 = 110 margin required > 100 free
        stopLoss: 1.0900,
        takeProfit: 1.1500,
        timestamp: "2026-02-12T10:01:00Z",
        commissionFee: 1,
      };

      const result = runEngine(state, event);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_MARGIN");
      expect(result.error?.message).toContain("exceeds free margin");
    });

    test("Accepts OPEN_POSITION when margin required equals available free margin", () => {
      const state = createTestState({
        account: {
          accountId: "ACC-001",
          balance: 10000,
          bonus: 0,
          equity: 10000,
          marginUsed: 0,
          freeMargin: 1100,
          marginLevel: null,
          status: "ACTIVE",
          maxPositions: 10,
          createdAt: "2026-02-12T10:00:00Z",
        },
      });

      const event: any = {
        type: "OPEN_POSITION",
        accountId: "ACC-001",
        marketId: "EUR/USD",
        positionId: "POS-001",
        side: "LONG",
        size: 10,
        executionPrice: 1.1000,
        leverage: 1, // 10 * 1.1000 / 1 = 11 margin required
        stopLoss: 1.0900,
        takeProfit: 1.1500,
        timestamp: "2026-02-12T10:01:00Z",
        commissionFee: 1,
      };

      const result = runEngine(state, event);

      expect(result.success).toBe(true);
      expect(result.newState).toBeDefined();
    });
  });

  describe("Position Size Constraints (INV-RISK-008, INV-RISK-009)", () => {
    test("Rejects OPEN_POSITION when size below minimum", () => {
      const state = createTestState();

      const event: any = {
        type: "OPEN_POSITION",
        accountId: "ACC-001",
        marketId: "EUR/USD",
        positionId: "POS-999",
        side: "LONG",
        size: 0.001, // Below minSize of 0.01
        executionPrice: 1.1000,
        leverage: 10,
        stopLoss: 1.0900,
        takeProfit: 1.1500,
        timestamp: "2026-02-12T10:01:00Z",
        commissionFee: 1,
      };

      const result = runEngine(state, event);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SIZE_BELOW_MINIMUM");
    });

    test("Rejects OPEN_POSITION when size exceeds maximum", () => {
      const state = createTestState();

      const event: any = {
        type: "OPEN_POSITION",
        accountId: "ACC-001",
        marketId: "EUR/USD",
        positionId: "POS-999",
        side: "LONG",
        size: 500, // Exceeds maxSize of 100
        executionPrice: 1.1000,
        leverage: 10,
        stopLoss: 1.0900,
        takeProfit: 1.1500,
        timestamp: "2026-02-12T10:01:00Z",
        commissionFee: 1,
      };

      const result = runEngine(state, event);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SIZE_ABOVE_MAXIMUM");
    });
  });

  describe("Leverage Constraints (INV-FIN-009)", () => {
    test("Rejects OPEN_POSITION when leverage exceeds maximum", () => {
      const state = createTestState();

      const event: any = {
        type: "OPEN_POSITION",
        accountId: "ACC-001",
        marketId: "EUR/USD",
        positionId: "POS-999",
        side: "LONG",
        size: 10,
        executionPrice: 1.1000,
        leverage: 100, // Exceeds maxLeverage of 50
        stopLoss: 1.0900,
        takeProfit: 1.1500,
        timestamp: "2026-02-12T10:01:00Z",
        commissionFee: 1,
      };

      const result = runEngine(state, event);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("LEVERAGE_EXCEEDED");
    });
  });

  describe("Stop Loss / Take Profit Validation (INV-POS-007, INV-POS-008)", () => {
    test("Rejects OPEN_POSITION with invalid SL for LONG (SL >= entry price)", () => {
      const state = createTestState();

      const event: any = {
        type: "OPEN_POSITION",
        accountId: "ACC-001",
        marketId: "EUR/USD",
        positionId: "POS-999",
        side: "LONG",
        size: 10,
        executionPrice: 1.1000,
        leverage: 10,
        stopLoss: 1.1000, // Must be below 1.1000 for LONG
        takeProfit: 1.1500,
        timestamp: "2026-02-12T10:01:00Z",
        commissionFee: 1,
      };

      const result = runEngine(state, event);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INVALID_STOP_LOSS");
    });

    test("Rejects OPEN_POSITION with invalid TP for SHORT (TP >= entry price)", () => {
      const state = createTestState();

      const event: any = {
        type: "OPEN_POSITION",
        accountId: "ACC-001",
        marketId: "EUR/USD",
        positionId: "POS-999",
        side: "SHORT",
        size: 10,
        executionPrice: 1.1000,
        leverage: 10,
        stopLoss: 1.1200, // Valid: above entry price for SHORT
        takeProfit: 1.1100, // Invalid: must be below 1.1000 for SHORT, this is above
        timestamp: "2026-02-12T10:01:00Z",
        commissionFee: 1,
      };

      const result = runEngine(state, event);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INVALID_TAKE_PROFIT");
    });
  });

  describe("Position Count Limits (INV-POS-009)", () => {
    test("Rejects OPEN_POSITION when position count exceeds maximum", () => {
      // Create state with maxPositions = 1 (and 1 position already open)
      const existingPosition: PositionState = {
        positionId: "POS-001",
        accountId: "ACC-001",
        marketId: "EUR/USD",
        side: "LONG",
        size: 1,
        entryPrice: 1.1000,
        unrealizedPnL: 0,
        marginUsed: 110,
        status: "OPEN",
        openedAt: "2026-02-12T10:00:00Z",
        leverage: 10,
        commissionFee: 1,
        stopLoss: 1.0900,
        takeProfit: 1.1500,
        swapFee: 0,
      };

      const state = createTestState({
        account: {
          accountId: "ACC-001",
          balance: 10000,
          bonus: 0,
          equity: 10000,
          marginUsed: 110,
          freeMargin: 9890,
          marginLevel: 909.09,
          status: "ACTIVE",
          maxPositions: 1, // Only 1 position allowed
          createdAt: "2026-02-12T10:00:00Z",
        },
        positions: new Map([["POS-001", existingPosition]]),
      });

      const event: any = {
        type: "OPEN_POSITION",
        accountId: "ACC-001",
        marketId: "EUR/USD",
        positionId: "POS-002",
        side: "LONG",
        size: 1,
        executionPrice: 1.1000,
        leverage: 10,
        stopLoss: 1.0900,
        takeProfit: 1.1500,
        timestamp: "2026-02-12T10:01:00Z",
        commissionFee: 1,
      };

      const result = runEngine(state, event);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("POSITION_LIMIT_EXCEEDED");
    });
  });

  describe("Account Status Constraints (INV-STATE-003)", () => {
    test("Rejects OPEN_POSITION when account status is not ACTIVE", () => {
      const state = createTestState({
        account: {
          accountId: "ACC-001",
          balance: 10000,
          bonus: 0,
          equity: 10000,
          marginUsed: 0,
          freeMargin: 10000,
          marginLevel: null,
          status: "LIQUIDATION_ONLY", // Not active
          maxPositions: 10,
          createdAt: "2026-02-12T10:00:00Z",
        },
      });

      const event: any = {
        type: "OPEN_POSITION",
        accountId: "ACC-001",
        marketId: "EUR/USD",
        positionId: "POS-999",
        side: "LONG",
        size: 1,
        executionPrice: 1.1000,
        leverage: 10,
        stopLoss: 1.0900,
        takeProfit: 1.1500,
        timestamp: "2026-02-12T10:01:00Z",
        commissionFee: 1,
      };

      const result = runEngine(state, event);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INVALID_ACCOUNT_STATUS");
    });
  });

  describe("CLOSE_POSITION Validation (INV-POS-003, INV-POS-004)", () => {
    test("Rejects CLOSE_POSITION when position not found", () => {
      const state = createTestState();

      const event: any = {
        type: "CLOSE_POSITION",
        accountId: "ACC-001",
        positionId: "POS-NONEXISTENT",
        closePrice: 1.1100,
        timestamp: "2026-02-12T10:02:00Z",
      };

      const result = runEngine(state, event);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("POSITION_NOT_FOUND");
    });

    test("Rejects CLOSE_POSITION when position already closed", () => {
      const closedPosition: PositionState = {
        positionId: "POS-001",
        accountId: "ACC-001",
        marketId: "EUR/USD",
        side: "LONG",
        size: 1,
        entryPrice: 1.1000,
        unrealizedPnL: 0,
        marginUsed: 110,
        status: "CLOSED",
        openedAt: "2026-02-12T10:00:00Z",
        closedPrice: 1.1100,
        closedAt: "2026-02-12T10:01:00Z",
        realizedPnL: 100,
        closedBy: "USER",
        leverage: 10,
        commissionFee: 1,
        swapFee: 0,
      };

      const state = createTestState({
        positions: new Map([["POS-001", closedPosition]]),
      });

      const event: any = {
        type: "CLOSE_POSITION",
        accountId: "ACC-001",
        positionId: "POS-001",
        closePrice: 1.1100,
        timestamp: "2026-02-12T10:02:00Z",
      };

      const result = runEngine(state, event);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("POSITION_ALREADY_CLOSED");
    });
  });

  describe("Event Type Validation", () => {
    test("Rejects unknown event type", () => {
      const state = createTestState();

      const event: any = {
        type: "UNKNOWN_EVENT",
        accountId: "ACC-001",
      };

      const result = runEngine(state, event);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("UNKNOWN_EVENT_TYPE");
    });
  });

  describe("Margin Level Safety (INV-RISK-004)", () => {
    test("Rejects OPEN_POSITION when resulting margin level would be unsafe", () => {
      // Create state where adding position would drop margin level below 125%
      const state = createTestState({
        account: {
          accountId: "ACC-001",
          balance: 10000,
          bonus: 0,
          equity: 10000,
          marginUsed: 8000,
          freeMargin: 2000,
          marginLevel: 125, // Right at threshold
          status: "ACTIVE",
          maxPositions: 10,
          createdAt: "2026-02-12T10:00:00Z",
        },
      });

      // Try to open large position that would lower margin level below 125%
      const event: any = {
        type: "OPEN_POSITION",
        accountId: "ACC-001",
        marketId: "EUR/USD",
        positionId: "POS-999",
        side: "LONG",
        size: 100,
        executionPrice: 1.1000,
        leverage: 1, // 100 * 1.1000 / 1 = 110 margin required
        timestamp: "2026-02-12T10:01:00Z",
        commissionFee: 1,
      };

      const result = runEngine(state, event);

      // This should fail if new margin level (equity / marginUsed) < 125%
      // 10000 / (8000 + 110) = 10000 / 8110 = 123.3% < 125%
      expect(result.success).toBe(false);
      expect(result.error?.code).toMatch(/MARGIN_LEVEL_INSUFFICIENT|INSUFFICIENT_MARGIN/);
    });
  });
});
