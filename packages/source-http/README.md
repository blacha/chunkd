# @chunkd/source-http

Load a chunks of a file from a HTTP(s) Source using `fetch`

## Usage

```typescript
import { SourceHttp } from '@chunkd/source-http';

const source = new SourceHttp(new URL('https://example.com/cog.tif'));

const firstBuffer = await source.fetchBytes(0, 1024); // Load the first 1KB from the source
const lastBuffer = await source.fetchBytes(-1024); // load the last 1KB from the source

const size = source.metadata?.size; // File size if metadata has been fetched
```

### Relative URLs

for relative urls, use `document.baseURI`

```typescript
const source = new SourceHttp(new URL('../cog.tif', document.baseURI));
```

### Advanced Usage

For caching, block alignment and fetch grouping see [@chunkd/middleware](../middleware)

###

## Nodejs <18

Node.js <18 does not come with a default `fetch` function, a `fetch` method must be provided before being able to be used.

```javascript
import {SourceHttp} from '@chunkd/source-http';
import { fetch } from 'node-fetch';

SourceHttp.fetch = fetch;
```
