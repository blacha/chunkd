# @chunkd/fs

File system abstraction layer

Makes it easier to work with local file system or remote async applications with filesystem like interfaces

- [File](./src/systems/file) - Read/Write the local file system
- [Memory](./src/systems/file) - memory as a mock file system
- [Http](./src/systems/http.ts) -HTTP(s) requests to a remote web server
- [AWS](https://www.npmjs.com/package/@chunkd/fs-aws) - AWS S3 as a remote file system

## Usage

### Basic

Read a text file

```typescript
import { fsa } from '@chunkd/fs';

const bytes = await fsa.read(fsa.toUrl('../foo.txt'));
```

List a folder

```typescript
for await (const url of fsa.list(fsa.toUrl('/'))) {
  const bytes = await fsa.read(url)
}
```

### Multiple file systems

Register multiple file systems

```typescript
import { fsa, FsMemory } from '@chunkd/fs';

fsa.register('memory://', new FsMemory());

await fsa.write(fsa.toUrl('memory://foo.txt'), 'Hello World');

// Stream the file from memory into the local file system
await fsa.write(fsa.toUrl('/foo.txt'), fsa.readStream(fsa.toUrl(()'memory://foo.txt')));
```

### Remote file systems

Remote file systems can also be used

```typescript
import { fsa, FsHttp } from '@chunkd/fs';
import { FsAwsS3 } from '@chunkd/fs-aws';

fsa.register('https://', new FsHttp());
fsa.register('s3://', new FsAwsS3());

// Stream a file from https://example.com into AWS S3
await fsa.write(fsa.toUrl('s3://example/foo.txt'), fsa.readStream(fsa.toUrl('https://example.com/foo.txt')));
```

### Multiple S3 Credentials

Multiple s3 clients can be registered with different credentials and then be used to stream files between AWS accounts or roles

```typescript
import {fsa} from '@chunkd/fs'
import {FsAwsS3} from '@chunkd/fs-aws';

fsa.register('s3://bucket-a/', new FsAwsS3(new S3Client({ credentials: bucketA })));
fsa.register('s3://bucket-b/', new FsAwsS3(new S3Client({ credentials: bucketB })));

fsa.write(fsa.toUrl('s3://bucket-a/foo.txt'), fsa.readStream(fsa.toUrl('s3://bucket-b/foo.txt')));
```

### Errors

All file system errors should be wrapped into a `FsError`

```typescript
try {
  await fsa.read('s3://foo/bar.txt')
} catch(e) {
  if(FsError.is(e)) {
    e.status // Http Status code eg 403
    e.cause // original error
    e.action // `read`
    e.url // `s3://foo/bar.txt`
  }
}

# Interface

All file systems implement then following interface interface

```typescript
export interface FileSystem {
  /** Read a file into a buffer */
  read(location: URL): Promise<Buffer>;
  /** Create a read stream */
  readStream(location: URL): Readable;
  /** Write a file from either a buffer or stream */
  write(location: URL, buffer: Buffer | Readable | string, opts?: Partial<WriteOptions>): Promise<void>;
  /** list all files in path */
  list(location: URL, opt?: ListOptions): AsyncGenerator<URL>;
  /** list all files with file info in path */
  details(location: URL, opt?: ListOptions): AsyncGenerator<FileInfo>;
  /** Get information about the path  */
  head(location: URL): Promise<FileInfo | null>;
  /** Create a chunk source to read chunks out of */
  source(location: URL): Source;
  /** Delete a file from the location */
  delete(location: URL): Promise<void>;
}
```
