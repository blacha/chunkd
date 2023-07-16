# @chunkd/source-aws

Load chunks of data from s3 using `@aws-sdk/client-s3`

## Usage

```javascript
import { SourceAwsS3 } from '@chunkd/source-aws';

const source = new SourceAwsS3(new URL('s3://linz-imagery/catalog.json'));

// Read in the first 1KB of data
const bytes = await source.fetch(0, 1024);
```

### Advanced Usage

For caching, block alignment and fetch grouping see [@chunkd/middleware](https://www.npmjs.com/package/@chunkd/middleware) and [@chunkd/fs](https://www.npmjs.com/package/@chunkd/fs)
