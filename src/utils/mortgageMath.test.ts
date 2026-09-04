import { describe, it, expect } from 'vitest';
import { calculateMonthlyPI } from './mortgageMath';

describe('mortgageMath', () => {
  describe('calculateMonthlyPI', () => {
    it('calculates the principal and interest payment correctly', () => {
      const principal = 300000;
      const annualRatePercent = 6.5;
      const loanTermYears = 30;
      
      const payment = calculateMonthlyPI(principal, annualRatePercent, loanTermYears);
      
      // Expected payment for $300k at 6.5% for 30 years is approximately $1896.20
      expect(payment).toBeGreaterThan(1895);
      expect(payment).toBeLessThan(1897);
    });

    it('returns 0 for zero principal', () => {
      const payment = calculateMonthlyPI(0, 5, 30);
      expect(payment).toBe(0);
    });
  });
});
