import { describe, it, expect } from 'vitest';
import { 
  sanitizeString, 
  isValidId, 
  isValidDateString, 
  isValidBudgetAmount, 
  sanitizePayload 
} from './security';

describe('Security Utilities', () => {
  describe('sanitizeString', () => {
    it('escapes dangerous HTML script tags to prevent XSS', () => {
      const malicious = '<script>alert("XSS")</script>';
      const sanitized = sanitizeString(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('escapes image error injection vectors', () => {
      const payload = '<img src=x onerror=alert(1)>';
      const sanitized = sanitizeString(payload);
      expect(sanitized).toBe('&lt;img src=x onerror=alert(1)&gt;');
    });

    it('handles non-string inputs safely without crashing', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(12345)).toBe('');
    });
  });

  describe('isValidId', () => {
    it('approves legitimate alphanumeric IDs with hyphens/underscores', () => {
      expect(isValidId('evt-wedding-01')).toBe(true);
      expect(isValidId('m_1234_abc')).toBe(true);
      expect(isValidId('user-99')).toBe(true);
    });

    it('rejects path traversal and SQL injection attempts in IDs', () => {
      expect(isValidId('../../../etc/passwd')).toBe(false);
      expect(isValidId('evt-01; DROP TABLE events;')).toBe(false);
      expect(isValidId('<script>')).toBe(false);
      expect(isValidId('')).toBe(false);
    });
  });

  describe('isValidDateString', () => {
    it('validates legitimate YYYY-MM-DD date strings', () => {
      expect(isValidDateString('2026-09-18')).toBe(true);
      expect(isValidDateString('2026-12-31')).toBe(true);
    });

    it('rejects invalid or malformed dates', () => {
      expect(isValidDateString('invalid-date')).toBe(false);
      expect(isValidDateString('09/18/2026')).toBe(false);
      expect(isValidDateString('')).toBe(false);
    });
  });

  describe('isValidBudgetAmount', () => {
    it('accepts valid positive finite budget figures', () => {
      expect(isValidBudgetAmount(0)).toBe(true);
      expect(isValidBudgetAmount(42000)).toBe(true);
      expect(isValidBudgetAmount(150.50)).toBe(true);
    });

    it('rejects negative amounts, NaN, Infinity, and extreme out-of-range values', () => {
      expect(isValidBudgetAmount(-500)).toBe(false);
      expect(isValidBudgetAmount(NaN)).toBe(false);
      expect(isValidBudgetAmount(Infinity)).toBe(false);
      expect(isValidBudgetAmount('500')).toBe(false);
      expect(isValidBudgetAmount(200_000_000)).toBe(false);
    });
  });

  describe('sanitizePayload', () => {
    it('recursively sanitizes nested objects and arrays against stored XSS', () => {
      const dirty = {
        name: '<b>Julian</b>',
        guests: [
          { name: '<script>alert(1)</script>', notes: 'Valid note' }
        ],
        meta: {
          tagline: '"A great evening"'
        }
      };

      const clean = sanitizePayload(dirty);
      expect(clean.name).toBe('&lt;b&gt;Julian&lt;&#x2F;b&gt;');
      expect(clean.guests[0].name).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
      expect(clean.meta.tagline).toBe('&quot;A great evening&quot;');
    });

    it('prevents prototype pollution vectors', () => {
      const malicious = JSON.parse('{"__proto__": {"polluted": true}, "title": "Celebration"}');
      const safe = sanitizePayload(malicious);
      expect(({} as any).polluted).toBeUndefined();
      expect(safe.title).toBe('Celebration');
    });
  });
});
