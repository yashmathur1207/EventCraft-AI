import { describe, it, expect } from 'vitest';
import { 
  formatCurrency, 
  formatDate, 
  getDaysRemaining, 
  calculateReadinessScore 
} from './formatters';

describe('Formatters & Business Logic Utilities', () => {
  describe('formatCurrency', () => {
    it('formats currency numbers with correct prefix and thousand separators', () => {
      expect(formatCurrency(42000, '$')).toBe('$42,000');
      expect(formatCurrency(1250.75, '€')).toBe('€1,251');
      expect(formatCurrency(0, '$')).toBe('$0');
    });

    it('handles negative and null values gracefully', () => {
      expect(formatCurrency(-500, '$')).toBe('$-500');
      expect(formatCurrency(NaN, '$')).toBe('$0');
    });
  });

  describe('formatDate', () => {
    it('formats ISO dates into readable Month Day, Year format', () => {
      const formatted = formatDate('2026-09-18');
      expect(formatted).toContain('Sep');
      expect(formatted).toContain('2026');
    });

    it('returns empty string for empty inputs', () => {
      expect(formatDate('')).toBe('');
    });
  });

  describe('getDaysRemaining', () => {
    it('returns Date TBD for empty date strings', () => {
      expect(getDaysRemaining('').text).toBe('Date TBD');
    });

    it('computes positive days remaining for future dates', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const res = getDaysRemaining(future.toISOString().slice(0, 10));
      expect(res.days).toBeGreaterThanOrEqual(9);
      expect(res.isPast).toBe(false);
      expect(res.text).toContain('days to go');
    });

    it('identifies past dates correctly', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      const res = getDaysRemaining(past.toISOString().slice(0, 10));
      expect(res.isPast).toBe(true);
      expect(res.text).toContain('days ago');
    });
  });

  describe('calculateReadinessScore', () => {
    it('calculates 100% readiness when all milestones, vendors, and RSVPs are completed', () => {
      const mockEvent = {
        milestones: [{ completed: true }, { completed: true }],
        budgetItems: [{ actualCost: 1000 }],
        vendors: [{ status: 'confirmed' }, { status: 'contract_signed' }],
        guests: [{ rsvpStatus: 'attending' }, { rsvpStatus: 'declined' }]
      };

      const score = calculateReadinessScore(mockEvent);
      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('returns 0 when given empty or null event', () => {
      expect(calculateReadinessScore(null as any)).toBe(0);
    });
  });
});
