# @chunkd/middleware

Middleware layer for sources to provided advanced features for all fetching logic

## Cache

[cache](./src/middleware/cache.ts) Cache responses from requests, with a LRU cache

```typescript
import { sources, SourceCache } from '@chunkd/middleware';
import { SourceHttp } from '@chunk/http';

/** Create a cache with 1MB of storage */
const cache = new SourceCache({ size: 1024 * 1024 * 1024 });
sources.use(cache);

const sourceHttp = sources.wrap(new SourceHttp('https://example.com/cog.tiff'));

// Cache Miss
sourceHttp.fetch(0, 1024);
// Cache hit
sourceHttp.fetch(0, 1024);

// Clear the cache
cache.clear();
// Cache Miss
sourceHttp.fetch(0, 1024);
```

## Absolute

[absolute](./src/middleware/absolute.ts) Convert reltive byte requests into absolute byte requests to enhance caching

```typescript
import { sources, SourceCache } from '@chunkd/middleware';
import { SourceHttp } from '@chunk/http';

const abs = new SourceAbsolute();
sources.use(abs);

const sourceHttp = sources.wrap(new SourceHttp('https://example.com/cog.tiff'));

await sourceHttp.head(); // Ensure the file size is know

sourceHttp.fetch(-10); // Instead of a request for -10 bytes it will now request Bytes=[fileSize-10]-[fileSize]
```

## Block aligned fetching (Chunking)

[chunked](./src/middleware/chunk.ts) block align reads and greatly increase cache efficiency

```typescript
// read files in 32KB chunks
const chunk = new SourceChunk({size: 32 * 1024 });
const cache = new SourceCache({size: 1024 * 1024 * 1024 });

source.use(chunk);
source.use(cache);

const sourceHttp = sources.wrap(new SourceHttp('https://example.com/cog.tiff'));

// Cache Miss, will fetch the first 32KB of the file
sourceHttp.fetch(0, 1024);
// Cache hit
sourceHttp.fetch(0, 1024);

// Cache hit
sourceHttp.fetch(1024, 1024);
// Cache hit
sourceHttp.fetch(2048, 1024);
```
