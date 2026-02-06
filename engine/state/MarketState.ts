/**
 * MarketState - Immutable market/instrument data
 * 
 * Invariants:
 * - INV-RISK-008: Size minimum limit
 * - INV-RISK-009: Size maximum limit
 * - INV-FIN-009: Leverage limits by asset class
 * - INV-DATA-004: Market price validity
 */

export interface MarketState {
  readonly marketId: string;
  readonly symbol: string;
  readonly assetClass: "FOREX" | "COMMODITIES" | "INDICES" | "CRYPTO" | "STOCKS";
  readonly markPrice: number; // INV-DATA-004
  readonly minSize: number; // INV-RISK-008
  readonly maxSize: number; // INV-RISK-009
  readonly maxLeverage: number; // INV-FIN-009
}

// TODO: Implement leverage validation by asset class in validation/validateRisk.ts
