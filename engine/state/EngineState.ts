/**
 * EngineState - Complete immutable engine state
 * 
 * Rules:
 * - No direct mutation - all updates return new state
 * - All fields are readonly
 * - Derived fields recalculated on every event
 * - Invariant: INV-STATE-001 (Account state consistency)
 */

import { AccountState } from "./AccountState";
import { PositionState } from "./PositionState";
import { MarketState } from "./MarketState";

export interface EngineState {
  readonly account: AccountState;
  readonly positions: ReadonlyMap<string, PositionState>;
  readonly markets: ReadonlyMap<string, MarketState>;
}

// TODO: Implement state builder functions for immutable updates
// TODO: Implement state validation function
// TODO: Create initial state template for testing
