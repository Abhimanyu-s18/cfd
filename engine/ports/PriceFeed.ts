/**
 * PriceFeed.ts - Market price interface
 * 
 * Engine does not fetch prices.
 * System provides prices via this interface.
 */

export interface PriceFeed {
  /**
   * Get current market price
   * Never called by engine - prices passed in via UpdatePricesEvent
   * Used for system-level orchestration only
   */
  getCurrentPrice(marketId: string): Promise<number>;
}

// TODO: Create Alpaca/yFinance implementations
