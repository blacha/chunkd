# @chunkd/source-aws-v3

Load a chunks of a file from a AWS SDK v3 `aws-sdk/client-s3`

## Usage

```typescript
import { SourceAwsS3 } from '@chunkd/source-aws';
import { S3LikeV3 } from '@chunkd/source-aws-v3';

import { S3Client } from '@aws-sdk/clients-s3';

const s3 = new S3Client()
const source = new SourceAwsS3('bucket', 'path/to/cog.tif', new S3LikeV3(s3)));

// Load the first 1KB
await source.fetchBytes(0, 1024);
```


```typescript
import { fsa } from '@chunkd/fs';
import { FsAwsS3 } from '@chunkd/source-aws';
import { S3LikeV3 } from '@chunkd/source-aws-v3';

import { S3Client } from '@aws-sdk/clients-s3';

const s3 = new S3Client()

fsa.register('s3://', new FsAwsS3(new S3LikeV3(s3)));
```