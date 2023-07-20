# @chunkd/fs-aws

File system abstraction for AWS S3 using `@aws-sdk/client-s3`

see [@chunkd/fs](../fs/README.md) for more usage

## Usage

```javascript
import { FsAwsS3 } from '@chunkd/fs-aws';
import S3Client from '@aws-sdk/clients-s3';

const fsS3 = new FsAwsS3(new S3Client());

// Read in the first 1KB of data

for await (const url of fsS3.list(new URL("s3://foo/bar/baz")) {
    // files
}

// Stream a file from one bucket to another
await fsS3.write(new URL("s3://foo/bar/baz.txt"), fsS3.readStream(new URL("s3://bar/baz.txt")))
```
