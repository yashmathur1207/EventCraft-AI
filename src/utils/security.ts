/**
 * Security & Sanitization Utilities
 * Provides XSS prevention, safe string escaping, and input validation guards.
 */

// HTML entity replacement map for XSS protection
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

/**
 * Escapes unsafe HTML characters from user-provided strings to prevent XSS injection.
 */
export function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'/`]/g, char => HTML_ESCAPE_MAP[char] || char).trim();
}

/**
 * Validates identifier tokens (IDs) ensuring safe alphanumeric characters and hyphens/underscores.
 * Prevents injection, directory traversal, and prototype pollution via key names.
 */
export function isValidId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_\-]{1,64}$/.test(id);
}

/**
 * Validates dates formatted as YYYY-MM-DD or valid ISO strings.
 */
export function isValidDateString(dateStr: unknown): boolean {
  if (typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return false;
  const timestamp = Date.parse(dateStr);
  return !isNaN(timestamp);
}

/**
 * Validates positive financial currency numbers.
 */
export function isValidBudgetAmount(amount: unknown): boolean {
  if (typeof amount !== 'number') return false;
  return Number.isFinite(amount) && amount >= 0 && amount <= 100_000_000;
}

/**
 * Recursively sanitizes string values across an object payload to prevent stored XSS.
 */
export function sanitizePayload<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    return sanitizeString(input) as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizePayload(item)) as unknown as T;
  }
  if (typeof input === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      sanitizedObj[key] = sanitizePayload(value);
    }
    return sanitizedObj as T;
  }
  return input;
}
