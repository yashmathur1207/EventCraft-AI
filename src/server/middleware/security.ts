import { Request, Response, NextFunction } from 'express';
import { sanitizePayload } from '../../utils/security';

/**
 * Security middleware applying essential defense headers.
 * Protects against MIME-sniffing, cross-site scripting, and clickjacking.
 */
export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
}

/**
 * Input sanitization middleware:
 * Recursively deep-sanitizes request body payloads against XSS attacks
 * and prototype pollution before reaching route handlers.
 */
export function payloadSanitizationMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePayload(req.body);
  }
  next();
}

/**
 * CORS configuration middleware for iframe and proxy embedding.
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
}

/**
 * In-memory sliding-window rate limiter with automated memory cleanup.
 * Prevents memory leaks by purging expired IP bucket records every minute.
 */
interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

// Periodic cleanup timer: unref so it won't block process shutdown
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of rateLimitBuckets.entries()) {
    if (now > bucket.resetTime) {
      rateLimitBuckets.delete(ip);
    }
  }
}, 60 * 1000);
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'client';
    const now = Date.now();
    const bucket = rateLimitBuckets.get(ip);

    if (!bucket || now > bucket.resetTime) {
      rateLimitBuckets.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (bucket.count >= maxRequests) {
      const retryAfter = Math.ceil((bucket.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please slow down and try again shortly.'
      });
      return;
    }

    bucket.count++;
    next();
  };
}

export const apiRateLimiter = createRateLimiter(200, 60 * 1000); // 200 req/min for general API
export const aiRateLimiter = createRateLimiter(25, 60 * 1000);   // 25 req/min for generative AI
