import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Interface for rate limiting
interface RateLimiter {
  limit(identifier: string): Promise<{ success: boolean }>;
}

// Create a simple in-memory rate limiter for development
// In production, you would use Redis/Upstash
class SimpleRateLimit implements RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly maxRequests = 10; // requests per window
  private readonly window = 60 * 1000; // 1 minute in ms

  async limit(identifier: string): Promise<{ success: boolean }> {
    const now = Date.now();
    const windowStart = now - this.window;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return { success: false };
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return { success: true };
  }
}

// Wrapper for Upstash Ratelimit to match our interface
class UpstashRateLimit implements RateLimiter {
  private ratelimit: Ratelimit;

  constructor(ratelimit: Ratelimit) {
    this.ratelimit = ratelimit;
  }

  async limit(identifier: string): Promise<{ success: boolean }> {
    const result = await this.ratelimit.limit(identifier);
    return { success: result.success };
  }
}

// Use Redis-based rate limiting in production
export const ratelimit: RateLimiter = process.env.UPSTASH_REDIS_REST_URL
  ? new UpstashRateLimit(new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
    }))
  : new SimpleRateLimit();
