# @chunkd/source-url


Load a chunks of a file from a URL Source using `fetch`

## Usage

```javascript
import { SourceHttp } from '@chunkd/source-http';

const source = new SourceHttp('https://example.com/cog.tif');

await source.loadBytes(0, 1024)
```

#### Nodejs <18
Node.js <18 does not come with a default `fetch` function, Users can specify a `fetch` like object

```javascript
import {fetch} from 'node-fetch';

SourceHttp.fetch = fetch;
```
