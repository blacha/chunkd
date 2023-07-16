# @chunkd/source-memory

this is designed for unit tests to prevent file system access, and not recommended for large file workloads.

## Usage

```typescript
import { SourceMemory } from '@chunkd/source-memory';

const source = new SourceMemory(new URL('memory://foo/bar.json', JSON.stringify({ hello: 'world' })));

JSON.parse(await source.fetch()); // { hello: "world" }
```

### Advanced Usage

For caching, block alignment and fetch grouping see [@chunkd/middleware](https://www.npmjs.com/package/@chunkd/middleware) and [@chunkd/fs](https://www.npmjs.com/package/@chunkd/fs)
