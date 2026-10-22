import type { SourceCallback, SourceMiddleware, SourceRequest } from '@chunkd/source';

export interface CacheObject {
  promise: Promise<ArrayBuffer>;
  /** Number of cache hits */
  hits: number;
  /** Number of times it has been promoted from the swapping LRU */
  saves: number;
  /** Byte sizes */
  size: number;
}

export class SourceCache implements SourceMiddleware {
  name = 'source:cache';
  maxSize: number;
  /** Number of bytes cached in cacheA, when this overflows maxSize cacheA is moved to cacheB and cacheB is dropped */
  size = 0;
  /** Number of times `this.cacheB` has been cleared */
  resets = 0;
  /** Primary cache of objects */
  cacheA: Map<string, CacheObject> = new Map();
  cacheB: Map<string, CacheObject> = new Map();
  /** List of protocols to cache */
  protocols: Set<string>;

  constructor(opts: { size: number; protocols?: string[] }) {
    this.maxSize = opts.size;
    this.protocols = new Set<string>(opts.protocols ?? []);
  }

  fetch(req: SourceRequest, next: SourceCallback): Promise<ArrayBuffer> {
    if (this.protocols.size > 0 && !this.protocols.has(req.source.url.protocol)) return next(req);
    if (req.length == null) return next(req);

    const cacheKey = `${req.source.url.toString()}@${req.offset}+${req.length}`;

    let existing = this.cacheA.get(cacheKey);
    if (existing) {
      existing.hits++;
      return existing.promise;
    }

    existing = this.cacheB.get(cacheKey);
    if (existing) {
      existing.hits++;
      existing.saves++;

      this.size += existing.size;
      this.cacheA.set(cacheKey, existing);
      return existing.promise;
    }

    const promise = next(req);
    existing = { promise, hits: 0, saves: 0, size: req.length };
    this.size += existing.size;

    promise.catch(() => this.evict(cacheKey, existing));

    if (this.size > this.maxSize) {
      this.size = existing.size;
      this.cacheB = this.cacheA;
      this.cacheA = new Map();
      this.resets++;
    }
    this.cacheA.set(cacheKey, existing);
    return existing.promise;
  }

  /** Remove a cache entry if it matches the current entry in cacheA or cacheB */
  evict(cacheKey: string, existing?: CacheObject): boolean {
    let evicted = false;
    const currentA = this.cacheA.get(cacheKey);
    if (currentA && (existing == null || currentA === existing)) {
      this.cacheA.delete(cacheKey);
      this.size -= currentA.size;
      evicted = true;
    }
    const currentB = this.cacheB.get(cacheKey);
    if (currentB && (existing == null || currentB === existing)) {
      this.cacheB.delete(cacheKey);
      evicted = true;
    }
    return evicted;
  }
}
