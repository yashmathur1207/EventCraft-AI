import { describe, it, expect, vi } from 'vitest';
import { 
  securityHeadersMiddleware, 
  corsMiddleware, 
  createRateLimiter,
  payloadSanitizationMiddleware
} from './security';
import { Request, Response } from 'express';

describe('Server Security Middleware', () => {
  it('applies standard security and transport headers', () => {
    const headers: Record<string, string> = {};
    const res = {
      setHeader: vi.fn((key: string, val: string) => {
        headers[key] = val;
      })
    } as unknown as Response;

    const next = vi.fn();
    securityHeadersMiddleware({} as Request, res, next);

    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-XSS-Protection']).toBe('1; mode=block');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['X-Frame-Options']).toBe('SAMEORIGIN');
    expect(next).toHaveBeenCalled();
  });

  it('sets CORS headers on normal requests', () => {
    const headers: Record<string, string> = {};
    const res = {
      header: vi.fn((key: string, val: string) => {
        headers[key] = val;
      })
    } as unknown as Response;

    const next = vi.fn();
    corsMiddleware({ method: 'GET' } as Request, res, next);

    expect(headers['Access-Control-Allow-Origin']).toBe('*');
    expect(next).toHaveBeenCalled();
  });

  it('handles OPTIONS preflight in CORS middleware', () => {
    const res = {
      header: vi.fn(),
      sendStatus: vi.fn()
    } as unknown as Response;

    const next = vi.fn();
    corsMiddleware({ method: 'OPTIONS' } as Request, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('sanitizes malicious script tags in request bodies', () => {
    const req = {
      body: {
        title: 'Launch Event <script>alert("xss")</script>',
        nested: { note: '<img src=x onerror=alert(1)>' }
      }
    } as Request;

    const next = vi.fn();
    payloadSanitizationMiddleware(req, {} as Response, next);

    expect(req.body.title).not.toContain('<script>');
    expect(req.body.nested.note).not.toContain('<img');
    expect(next).toHaveBeenCalled();
  });

  it('enforces sliding-window rate limit threshold', () => {
    const limiter = createRateLimiter(2, 60000);
    const req = { ip: '127.0.0.10' } as Request;

    const createMockRes = () => {
      const res: any = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      return res;
    };

    const next = vi.fn();

    // Request 1: Allowed
    limiter(req, createMockRes(), next);
    expect(next).toHaveBeenCalledTimes(1);

    // Request 2: Allowed
    limiter(req, createMockRes(), next);
    expect(next).toHaveBeenCalledTimes(2);

    // Request 3: Blocked (429)
    const blockedRes = createMockRes();
    limiter(req, blockedRes, next);
    expect(next).toHaveBeenCalledTimes(2); // not called again
    expect(blockedRes.status).toHaveBeenCalledWith(429);
    expect(blockedRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
