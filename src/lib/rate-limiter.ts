/**
 * Rate Limiter with exponential backoff for API calls
 */

export class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastCallTime = 0;
  private minDelay: number;

  constructor(minDelayMs: number = 500) {
    this.minDelay = minDelayMs;
  }

  /**
   * Add a task to the queue with rate limiting
   */
  async execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const task = this.queue.shift();

    if (task) {
      // Ensure minimum delay between calls
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;
      if (timeSinceLastCall < this.minDelay) {
        await this.sleep(this.minDelay - timeSinceLastCall);
      }

      this.lastCallTime = Date.now();
      await task();
    }

    // Process next task
    this.processQueue();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error (429)
      const isRateLimit = error?.status === 429 || 
                         error?.message?.includes('429') ||
                         error?.message?.toLowerCase().includes('rate limit');

      // Check if it's a retryable error
      const isRetryable = isRateLimit || 
                         error?.status === 500 || 
                         error?.status === 503;

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelayMs * Math.pow(2, attempt);
      const jitter = Math.random() * 1000; // Add random jitter
      const totalDelay = delay + jitter;

      console.warn(
        `⚠️ [Retry] Attempt ${attempt + 1}/${maxRetries} failed. ` +
        `Retrying in ${Math.round(totalDelay)}ms... ` +
        `Error: ${error?.message || 'Unknown error'}`
      );

      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Global rate limiter instance for Gemini API
 * Limits to 1 request per 500ms (2 requests per second)
 */
export const geminiRateLimiter = new RateLimiter(500);
