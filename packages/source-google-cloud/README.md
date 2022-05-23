# @chunkd/source-gcp

Load a chunks of a file from a AWS using `aws-sdk`

## Usage

```typescript
import { SourceAwsS3 } from '@chunkd/source-google-cloud';
import { Storage } from '@google-cloud/storage';

const source = SourceGoogleStorage.fromUri('gs://bucket/path/to/cog.tif', new Storage());

// Load the first 1KB
await source.fetchBytes(0, 1024);
```
