/**
 * Simple in-memory cache for API responses
 * Auto-expires after TTL
 */
export class ResponseCache<T> {
  private cache = new Map<string, { data: T; expiresAt: number }>();

  constructor(private defaultTtlMs: number = 5 * 60 * 1000) { } // 5 minutes default

  set(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Document cache singleton
 */
export const documentCache = new ResponseCache(10 * 60 * 1000); // 10 minutes

/**
 * Session cache singleton
 */
export const sessionCache = new ResponseCache(15 * 60 * 1000); // 15 minutes

/**
 * Build cache key for list queries
 */
export function getCacheKey(
  endpoint: string,
  params?: Record<string, any>
): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }

  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${ key }=${ JSON.stringify(params[key]) }`)
    .join("&");

  return `${ endpoint }?${ sortedParams }`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${ (value * 100).toFixed(decimals) }%`;
}

/**
 * Get status badge color/variant
 */
export function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "indexed":
      return "default";
    case "processing":
      return "secondary";
    case "failed":
      return "destructive";
    case "uploaded":
      return "outline";
    default:
      return "default";
  }
}

/**
 * Get progress percentage from chunks
 */
export function getIndexingProgress(indexed: number, total: number): number {
  if (total === 0) return 0;
  return (indexed / total) * 100;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  intervalMs: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= intervalMs) {
      fn(...args);
      lastCallTime = now;
    } else {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        fn(...args);
        lastCallTime = Date.now();
      }, intervalMs - timeSinceLastCall);
    }
  };
}
