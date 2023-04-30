# @chunkd/source-file


Load chunks of data from a file using `node:fs`

## Usage

```javascript
import { SourceFile } from '@chunkd/source-file';

const source = new SourceFile('./cog.tif');


// Read in the first 1KB of data
await source.loadBytes(0, 1024);
```
