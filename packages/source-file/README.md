# @chunkd/source-file

Load chunks of data from a file using `node:fs`

## Usage

```javascript
import { pathToFileURL } from 'node:path';
import { SourceFile } from '@chunkd/source-file';

const source = new SourceFile(pathToFileURL('./cog.tif'));

// Read in the first 1KB of data
await source.fetch(0, 1024);

// Read the last 1KB of data
await source.fetch(-1024);
```

### Advanced Usage

For caching, block alignment and fetch grouping see [@chunkd/middleware](https://www.npmjs.com/package/@chunkd/middleware) and [@chunkd/fs](https://www.npmjs.com/package/@chunkd/fs)
