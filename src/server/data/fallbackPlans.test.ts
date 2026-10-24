import { describe, it, expect } from 'vitest';
import { cleanAndParseJSON, generateFallbackPlan } from './fallbackPlans';

describe('fallbackPlans utilities', () => {
  describe('cleanAndParseJSON', () => {
    it('parses valid raw JSON string', () => {
      const result = cleanAndParseJSON('{"status": "ok", "count": 42}');
      expect(result).toEqual({ status: 'ok', count: 42 });
    });

    it('strips markdown code fences (```json ... ```)', () => {
      const markdownJson = '```json\n{"message": "success"}\n```';
      const result = cleanAndParseJSON(markdownJson);
      expect(result).toEqual({ message: 'success' });
    });

    it('strips generic markdown code fences without language tag', () => {
      const raw = '```\n{"items": [1, 2, 3]}\n```';
      const result = cleanAndParseJSON(raw);
      expect(result).toEqual({ items: [1, 2, 3] });
    });

    it('returns null for empty or undefined input', () => {
      expect(cleanAndParseJSON(undefined)).toBeNull();
      expect(cleanAndParseJSON('')).toBeNull();
    });
  });

  describe('generateFallbackPlan', () => {
    it('generates a complete, balanced event plan', () => {
      const plan = generateFallbackPlan({
        eventType: 'gala',
        title: 'Emerald Charity Ball',
        totalBudget: 20000,
        targetGuestCount: 100,
        date: '2026-11-20',
        location: 'Grand Ballroom'
      });

      expect(plan).toBeDefined();
      expect(plan.budgetCategories.length).toBeGreaterThanOrEqual(5);
      expect(plan.budgetItems.length).toBeGreaterThanOrEqual(8);
      expect(plan.milestones.length).toBeGreaterThanOrEqual(5);
      expect(plan.dayOfSchedule.length).toBeGreaterThanOrEqual(6);
      expect(plan.vendors.length).toBeGreaterThanOrEqual(3);
      expect(plan.creative.palette.length).toBeGreaterThanOrEqual(4);

      // Verify mathematical budget integrity (allocated sum === totalBudget)
      const allocatedTotal = plan.budgetCategories.reduce((sum, c) => sum + c.allocated, 0);
      expect(allocatedTotal).toBe(20000);
    });

    it('provides graceful defaults when optional params are omitted', () => {
      const plan = generateFallbackPlan({});
      expect(plan.theme).toBeDefined();
      expect(plan.priorityFocus).toBeDefined();
      expect(plan.creative.themeTitle).toBeDefined();
      expect(plan.creative.signatureItems.length).toBeGreaterThanOrEqual(1);
    });
  });
});
