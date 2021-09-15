# @chunkd/source-url


Load a chunks of a file from a URL Source using `fetch`

## Usage

```javascript
import { SourceHttp } from '@chunkd/source-http';

const source= new SourceHttp('https://example.com/cog.tif');

await source.loadBytes(0, 1024)
```

#### Nodejs
Nodejs does not come with a default `fetch` function, this package will use `node-fetch` when in used with nodejs
