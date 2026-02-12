/**
 * rounding.ts - Decimal rounding utilities
 * 
 * Invariant:
 * - INV-CALC-002: Banker's rounding (round half to even)
 * - INV-DATA-005: All financial values use 2 decimal precision
 * 
 * Rationale:
 * Banker's rounding minimizes systematic error in financial calculations.
 * When a value is exactly halfway between two roundable positions,
 * it rounds to the nearest even number instead of always rounding up.
 * 
 * Examples:
 * - 2.5 → 2 (even)
 * - 3.5 → 4 (even)
 * - 2.45 → 2.44 or 2.46 depending on rounding
 * - 2.455 → 2.46 (rounds to even hundredths)
 * - 2.465 → 2.46 (rounds to even hundredths)
 * 
 * This distributes rounding errors evenly rather than systematically
 * biasing toward higher or lower values.
 */

/**
 * Banker's rounding to specified decimal places
 * Rounds 0.5 to nearest even number
 * 
 * Invariant: INV-CALC-002 - Prevents systematic rounding bias
 * 
 * Pure function: YES (no state access, no side effects)
 * Deterministic: YES (same input → same output)
 * 
 * @param value Number to round
 * @param decimals Number of decimal places (default: 2 for currency)
 * @returns Rounded value using banker's rounding
 */
export function bankersRound(value: number, decimals: number = 2): number {
  // Handle edge cases
  if (!isFinite(value)) {
    return value;
  }

  const factor = Math.pow(10, decimals);
  const adjusted = value * factor;
  const fractional = adjusted - Math.floor(adjusted);

  // If exactly halfway (fractional part is 0.5 ± epsilon)
  if (Math.abs(fractional - 0.5) < 1e-10) {
    // Round to even
    const floor = Math.floor(adjusted);
    const isEven = floor % 2 === 0;
    return isEven
      ? Math.floor(adjusted) / factor
      : Math.ceil(adjusted) / factor;
  }

  // Otherwise, use standard rounding
  return Math.round(adjusted) / factor;
}

/**
 * Ensure value has exactly 2 decimal places
 * Invariant: INV-DATA-005 - All financial values use 2 decimal precision
 * 
 * Used for: P&L, margins, fees, balances
 * 
 * @param value Number to format
 * @returns Value rounded to 2 decimal places
 */
export function formatCurrency(value: number): number {
  return bankersRound(value, 2);
}

/**
 * Aggregate rounding check - verifies no penny is lost across multiple roundings
 * 
 * Example: sum of 100 rounded values should equal rounded sum
 * (with small tolerance for floating-point error)
 * 
 * @param values Array of values to round
 * @returns Object with sum of rounded and rounded sum for comparison
 */
export function validateRoundingConsistency(values: number[]): {
  sumThenRound: number;
  roundThenSum: number;
  difference: number;
} {
  const roundedValues = values.map((v) => formatCurrency(v));
  const sumThenRound = formatCurrency(
    values.reduce((sum, v) => sum + v, 0)
  );
  const roundThenSum = roundedValues.reduce((sum, v) => sum + v, 0);

  return {
    sumThenRound,
    roundThenSum,
    difference: Math.abs(sumThenRound - roundThenSum),
  };
}
