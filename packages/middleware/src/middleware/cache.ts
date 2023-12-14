import { SourceCallback, SourceMiddleware, SourceRequest } from '@chunkd/source';

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

    existing = { promise: next(req), hits: 0, saves: 0, size: req.length };
    this.size += existing.size;

    if (this.size > this.maxSize) {
      this.size = existing.size;
      this.cacheB = this.cacheA;
      this.cacheA = new Map();
      this.resets++;
    }
    this.cacheA.set(cacheKey, existing);
    return existing.promise;
  }
}
