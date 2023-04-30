# @chunkd/fs-aws

File system abstraction for AWS S3 using `@aws-sdk/client-s3`

see [@chunkd/fs](../fs/README.md) for more usage

## Usage

```javascript
import { FsAwsS3 } from '@chunkd/fs-aws';

const fs = new FsAwsS3(new S3Client());

// Read in the first 1KB of data

for await (const url of fs.list(new URL("s3://foo/bar/baz")) {
    // files
}

// Stream a file from one bucket to another
await fs.write("s3://foo/bar/baz.txt", fs.stream("s3://bar/baz.txt"))
```
