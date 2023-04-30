# @chunkd/source-http

Load a chunks of a file from a HTTP(s) Source using `fetch`

## Usage

```javascript
import { SourceHttp } from '@chunkd/source-http';

const source = new SourceHttp('https://example.com/cog.tif');

await source.fetchBytes(0, 1024) // Load the first 1KB from the source
await source.fetchBytes(-1024) // load the last 1KB from the source

const size = source.metadata?.size; // File size if metadata has been fetched
```

#### Nodejs <18
Node.js <18 does not come with a default `fetch` function, Users can specify a `fetch` like object

```javascript
import {fetch} from 'node-fetch';

SourceHttp.fetch = fetch;
```
