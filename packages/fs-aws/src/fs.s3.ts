import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import {
  FileInfo,
  FileSystem,
  FileSystemAction,
  FileSystemProvider,
  FsError,
  ListOptions,
  WriteOptions,
  isRecord,
} from '@chunkd/fs';
import { SourceAwsS3 } from '@chunkd/source-aws';
import type { Readable } from 'node:stream';
import { PassThrough } from 'node:stream';

function isReadable(r: any): r is Readable {
  return r != null && typeof r['read'] === 'function';
}

export function toFsError(e: unknown, msg: string, url: URL, action: FileSystemAction, system: FileSystem): FsError {
  if (!isRecord(e)) return new FsError(msg, 500, url, action, system, e);
  if (typeof e.statusCode === 'number') return new FsError(msg, e.statusCode, url, action, system, e);
  if (isRecord(e.$metadata) && typeof e.$metadata.httpStatusCode === 'number') {
    return new FsError(msg, e.$metadata.httpStatusCode, url, action, system, e);
  }
  return new FsError(msg, 500, url, action, system, e);
}
/** One megabyte in bytes */
const OneMegaByte = 1024 * 1204;

export class FsAwsS3 implements FileSystem {
  name = 's3';

  /** Concurrency for uploads */
  uploadQueueSize = 4;
  /** Number of bytes to split uploads on */
  uploadPartSize = 10 * OneMegaByte;

  /** Max number of list requests to run before throwing a error */
  static MaxListCount = -1;

  /** When testing write permissions add a suffix to the file name, this file will be deleted up after writing completes */
  static WriteTestSuffix = '.fsa-test';

  /** Attempt to lookup credentials when permission failures happen */
  credentials?: FileSystemProvider<FsAwsS3>;

  /** Buckets we have already tested writing too and should skip testing multiple times */
  writeTests = new Set<string>();

  /** Request Payment option */
  requestPayer?: 'requester';

  /**
   * When testing write permissions add a suffix to the file name, this file will be deleted up after writing completes
   * @see {@link FsAwsS3.WriteTestSuffix}
   **/
  writeTestSuffix = FsAwsS3.WriteTestSuffix;

  /**
   * Max number of list requests to run before throwing a error
   *
   * @see {@link FsAwsS3.MaxListCount}
   */
  maxListCount = FsAwsS3.MaxListCount;

  /** AWS-SDK s3 to use */
  s3: S3Client;

  constructor(s3: S3Client) {
    this.s3 = s3;
  }

  source(loc: URL): SourceAwsS3 {
    return new SourceAwsS3(loc, this.s3);
  }

  async *list(loc: URL, opts?: ListOptions): AsyncGenerator<URL> {
    for await (const obj of this.details(loc, opts)) yield new URL(obj.path);
  }

  async *details(loc: URL, opts?: ListOptions): AsyncGenerator<FileInfo> {
    let ContinuationToken: string | undefined = undefined;
    const Delimiter: string | undefined = opts?.recursive === false ? '/' : undefined;
    const Bucket = loc.hostname;
    const Prefix = decodeURIComponent(loc.pathname.slice(1));

    let count = 0;
    try {
      while (true) {
        count++;
        // TODO: why is this type assignment needed
        const res: ListObjectsV2CommandOutput = await this.s3.send(
          new ListObjectsV2Command({ Bucket, Prefix, ContinuationToken, Delimiter, RequestPayer: this.requestPayer }),
        );

        if (res.CommonPrefixes != null) {
          for (const prefix of res.CommonPrefixes) {
            if (prefix.Prefix == null) continue;
            yield { path: new URL(`s3://${Bucket}/${prefix.Prefix}`), isDirectory: true };
          }
        }

        if (res.Contents != null) {
          for (const obj of res.Contents) {
            if (obj.Key == null) continue;
            yield {
              path: new URL(`s3://${Bucket}/${obj.Key}`),
              size: obj.Size,
              eTag: obj.ETag,
              lastModified: obj.LastModified?.toISOString(),
            };
          }
        }

        // Nothing left to fetch
        if (!res.IsTruncated) break;

        // Abort if too many lists
        if (this.maxListCount > 0 && count >= this.maxListCount) {
          throw new Error(
            `Failed to finish listing within ${this.maxListCount} list attempts, see FsAwsS3.MaxListCount`,
          );
        }
        ContinuationToken = res.NextContinuationToken;
      }
    } catch (e) {
      const ce = toFsError(e, `Failed to list: "${loc}"`, loc, 'list', this);

      if (this.credentials != null && ce.code === 403) {
        const newFs = await this.credentials.find(loc);
        if (newFs) {
          yield* newFs.details(loc, opts);
          return;
        }
      }
      throw ce;
    }
  }

  async read(loc: URL): Promise<Buffer> {
    try {
      const res = await this.s3.send(
        new GetObjectCommand({
          Bucket: loc.hostname,
          Key: decodeURIComponent(loc.pathname.slice(1)),
          RequestPayer: this.requestPayer,
        }),
      );

      return Buffer.from(await new Response(res.Body as BodyInit).arrayBuffer());
    } catch (e) {
      const ce = toFsError(e, `Failed to read: "${loc}"`, loc, 'read', this);
      if (this.credentials != null && ce.code === 403) {
        const newFs = await this.credentials.find(loc);
        if (newFs) return newFs.read(loc);
      }
      throw ce;
    }
  }

  /** Test writing a small text file to a bucket to see if we have write permissions. */
  async _writeTest(testPath: URL): Promise<void | FsAwsS3> {
    /** No credential provider so cannot lookup credentials if it fails */
    if (this.credentials == null) return;
    // Already tested this bucket no need to test again.
    if (this.writeTests.has(testPath.hostname)) return;

    const loc = new URL(this.writeTestSuffix, testPath);

    try {
      await new Upload({
        client: this.s3,
        queueSize: this.uploadQueueSize,
        partSize: this.uploadPartSize,
        params: {
          Bucket: loc.hostname,
          Key: decodeURIComponent(loc.pathname.slice(1)),
          Body: Buffer.from('@chunkd/fs-aws writeTest file'),
          RequestPayer: this.requestPayer,
        },
      }).done();
      this.writeTests.add(testPath.hostname); // Write test worked!
      // Suffix was added so cleanup the file
      if (this.writeTestSuffix !== '') await this.delete(loc);
    } catch (e) {
      const ce = toFsError(e, `Failed to write to "${loc}"`, loc, 'write', this);
      if (ce.code === 403) {
        const newFs = await this.credentials.find(testPath);
        if (newFs) return newFs;
      }
      throw ce;
    }
  }

  async write(loc: URL, buf: Buffer | Readable | string, ctx?: WriteOptions): Promise<void> {
    // Streams cannot be read twice, so we cannot try to upload the file, fail then attempt to upload it again with new credentials
    if (this.credentials != null && isReadable(buf)) {
      const newFs = await this._writeTest(loc);
      if (newFs) return newFs.write(loc, buf, ctx);
    }

    try {
      await new Upload({
        client: this.s3,
        queueSize: this.uploadQueueSize,
        partSize: this.uploadPartSize,
        params: {
          Bucket: loc.hostname,
          Key: decodeURIComponent(loc.pathname.slice(1)),
          Body: buf,
          RequestPayer: this.requestPayer,
          ContentEncoding: ctx?.contentEncoding,
          ContentType: ctx?.contentType,
          Metadata: ctx?.metadata,
        },
      }).done();
    } catch (e) {
      const ce = toFsError(e, `Failed to write: "${loc}"`, loc, 'write', this);
      if (this.credentials != null && ce.code === 403) {
        const newFs = await this.credentials.find(loc);
        if (newFs) return newFs.write(loc, buf, ctx);
      }
      throw ce;
    }
  }

  async delete(loc: URL): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: loc.hostname,
          Key: decodeURIComponent(loc.pathname.slice(1)),
          RequestPayer: this.requestPayer,
        }),
      );
      return;
    } catch (e) {
      const ce = toFsError(e, `Failed to delete: "${loc}"`, loc, 'delete', this);
      if (ce.code === 404) return;
      if (this.credentials != null && ce.code === 403) {
        const newFs = await this.credentials.find(loc);
        if (newFs) return newFs.delete(loc);
      }
      throw ce;
    }
  }

  exists(loc: URL): Promise<boolean> {
    return this.head(loc).then((f) => f != null);
  }

  readStream(loc: URL): Readable {
    const pt = new PassThrough();
    this.s3
      .send(
        new GetObjectCommand({
          Bucket: loc.hostname,
          Key: decodeURIComponent(loc.pathname.slice(1)),
          RequestPayer: this.requestPayer,
        }),
      )
      .then((r) => {
        if (r.Body) (r.Body as Readable).pipe(pt);
        else pt.end();
      })
      .catch((e) => pt.emit('error', toFsError(e, `Failed to readStream: ${loc}`, loc, 'readStream', this)));
    return pt;
  }

  async head(loc: URL): Promise<FileInfo | null> {
    try {
      const res = await this.s3.send(
        new HeadObjectCommand({
          Bucket: loc.hostname,
          Key: decodeURIComponent(loc.pathname.slice(1)),
          RequestPayer: this.requestPayer,
        }),
      );

      const info: FileInfo = { size: res.ContentLength, path: loc };
      if (res.Metadata && Object.keys(res.Metadata).length > 0) info.metadata = res.Metadata;
      if (res.ContentEncoding) info.contentEncoding = res.ContentEncoding;
      if (res.ContentType) info.contentType = res.ContentType;
      if (res.ETag) info.eTag = res.ETag;
      if (res.LastModified) info.lastModified = res.LastModified.toISOString();

      return info;
    } catch (e) {
      if (isRecord(e) && e.code === 'NotFound') return null;

      const ce = toFsError(e, `Failed to head: ${loc}`, loc, 'head', this);
      if (ce.code === 404) return null;

      if (this.credentials != null && ce.code === 403) {
        const newFs = await this.credentials.find(loc);
        if (newFs) return newFs.head(loc);
      }
      throw ce;
    }
  }
}
