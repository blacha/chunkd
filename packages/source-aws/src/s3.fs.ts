import { FileInfo, FileSystem, isRecord, ListOptions, parseUri, WriteOptions } from '@chunkd/core';
import type { Readable } from 'stream';
import { FsAwsS3Provider } from './credentials.js';
import { getCompositeError, SourceAwsS3 } from './s3.source.js';
import { ListRes, S3Like, toPromise } from './type.js';

export class FsAwsS3 implements FileSystem<SourceAwsS3> {
  static protocol = 's3';
  protocol = FsAwsS3.protocol;
  /** Max list requests to run before erroring */
  static MaxListCount = 100;

  credentials: FsAwsS3Provider | undefined;

  /** AWS-SDK s3 to use */
  s3: S3Like;

  constructor(s3: S3Like, credentials?: FsAwsS3Provider) {
    this.s3 = s3;
    this.credentials = credentials;
  }

  source(filePath: string): SourceAwsS3 {
    const source = SourceAwsS3.fromUri(filePath, this.s3);
    if (source == null) throw new Error(`Failed to create aws s3 source from uri: ${filePath}`);
    return source;
  }

  /** Is this file system a s3 file system */
  static is(fs: FileSystem): fs is FsAwsS3 {
    return fs.protocol === FsAwsS3.protocol;
  }

  /** Is this pat a s3 path */
  static isPath(path?: string): boolean {
    if (path == null) return false;
    return path.startsWith('s3://');
  }

  /** Parse a s3:// URI into the bucket and key components */

  async *list(filePath: string, opts?: ListOptions): AsyncGenerator<string> {
    for await (const obj of this.details(filePath, opts)) yield obj.path;
  }

  async *details(filePath: string, opts?: ListOptions): AsyncGenerator<FileInfo> {
    const loc = parseUri(filePath);
    if (loc == null) return;
    let ContinuationToken: string | undefined = undefined;
    const Delimiter: string | undefined = opts?.recursive === false ? '/' : undefined;
    const Bucket = loc.bucket;
    const Prefix = loc.key;

    let count = 0;
    try {
      while (true) {
        count++;
        const res: ListRes = await toPromise(this.s3.listObjectsV2({ Bucket, Prefix, ContinuationToken, Delimiter }));

        if (res.CommonPrefixes != null) {
          for (const prefix of res.CommonPrefixes) {
            if (prefix.Prefix == null) continue;
            yield { path: `s3://${Bucket}/${prefix.Prefix}`, isDirectory: true };
          }
        }

        if (res.Contents != null) {
          for (const obj of res.Contents) {
            if (obj.Key == null) continue;
            yield { path: `s3://${Bucket}/${obj.Key}`, size: obj.Size };
          }
        }

        // Nothing left to fetch
        if (!res.IsTruncated) break;

        // Abort if too many lists
        if (count >= FsAwsS3.MaxListCount) {
          throw new Error(`Failed to finish listing within ${FsAwsS3.MaxListCount} list attempts`);
        }
        ContinuationToken = res.NextContinuationToken;
      }
    } catch (e) {
      const ce = getCompositeError(e, `Failed to list: "${filePath}"`);
      if (this.credentials != null && ce.code === 403) {
        const newFs = await this.credentials.find(filePath);
        if (newFs) return newFs.details(filePath, opts);
      }
      throw ce;
    }
  }

  async read(filePath: string): Promise<Buffer> {
    const opts = parseUri(filePath);
    if (opts == null || opts.key == null) throw new Error(`Failed to read:  "${filePath}"`);

    try {
      const res = await this.s3.getObject({ Bucket: opts.bucket, Key: opts.key }).promise();
      return res.Body as Buffer;
    } catch (e) {
      const ce = getCompositeError(e, `Failed to read: "${filePath}"`);
      if (this.credentials != null && ce.code === 403) {
        const newFs = await this.credentials.find(filePath);
        if (newFs) return newFs.read(filePath);
      }
      throw ce;
    }
  }

  async write(filePath: string, buf: Buffer | Readable | string, ctx?: WriteOptions): Promise<void> {
    const opts = parseUri(filePath);
    if (opts == null || opts.key == null) throw new Error(`Failed to write: "${filePath}"`);

    try {
      await toPromise(
        this.s3.upload({
          Bucket: opts.bucket,
          Key: opts.key,
          Body: buf,
          ContentEncoding: ctx?.contentEncoding,
          ContentType: ctx?.contentType,
        }),
      );
    } catch (e) {
      const ce = getCompositeError(e, `Failed to write: "${filePath}"`);
      if (this.credentials != null && ce.code === 403) {
        const newFs = await this.credentials.find(filePath);
        if (newFs) return newFs.write(filePath, buf, ctx);
      }
      throw ce;
    }
  }

  exists(filePath: string): Promise<boolean> {
    return this.head(filePath).then((f) => f != null);
  }

  stream(filePath: string): Readable {
    const opts = parseUri(filePath);
    if (opts == null || opts.key == null) throw new Error(`S3: Unable to read "${filePath}"`);

    return this.s3.getObject({ Bucket: opts.bucket, Key: opts.key }).createReadStream();
  }

  async head(filePath: string): Promise<FileInfo | null> {
    const opts = parseUri(filePath);
    if (opts == null || opts.key == null) throw new Error(`Failed to head: "${filePath}"`);
    try {
      const res = await toPromise(this.s3.headObject({ Bucket: opts.bucket, Key: opts.key }));
      return { size: res.ContentLength, path: filePath };
    } catch (e) {
      if (isRecord(e) && e.code === 'NotFound') return null;

      const ce = getCompositeError(e, `Failed to head: "${filePath}"`);
      if (this.credentials != null && ce.code === 403) {
        const newFs = await this.credentials.find(filePath);
        if (newFs) return newFs.head(filePath);
      }
      throw ce;
    }
  }
}
