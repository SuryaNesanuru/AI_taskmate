import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a simple in-memory rate limiter for development
// In production, you would use Redis/Upstash
class SimpleRateLimit {
  private requests = new Map<string, number[]>();
  private readonly limit = 10; // requests per window
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
    
    if (validRequests.length >= this.limit) {
      return { success: false };
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return { success: true };
  }
}

// Use Redis-based rate limiting in production
export const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
    })
  : new SimpleRateLimit();