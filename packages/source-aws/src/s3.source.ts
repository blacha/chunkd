import {
  ChunkSource,
  ChunkSourceBase,
  ChunkSourceMetadata,
  CompositeError,
  ErrorCodes,
  isRecord,
  parseUri,
} from '@chunkd/core';
import { GetObjectRes, HeadRes, S3Like, toPromise } from './type.js';

export function getCompositeError(e: unknown, msg: string): CompositeError {
  if (!isRecord(e)) return new CompositeError(msg, 500, e);
  if (typeof e.statusCode === 'number') return new CompositeError(msg, e.statusCode, e);
  if (isRecord(e.$metadata) && typeof e.$metadata.httpStatusCode === 'number') {
    return new CompositeError(msg, e.$metadata.httpStatusCode, e);
  }
  return new CompositeError(msg, 500, e);
}

export class SourceAwsS3 extends ChunkSourceBase {
  static type = 'aws:s3';
  type = SourceAwsS3.type;
  protocol = 's3';

  static DefaultChunkSize = 64 * 1024;
  static DefaultMaxChunkCount = 32;

  // HTTP gets are slow, get a larger amount
  chunkSize: number = SourceAwsS3.DefaultChunkSize;
  maxChunkCount = SourceAwsS3.DefaultMaxChunkCount;

  bucket: string;
  key: string;
  remote: S3Like;

  constructor(bucket: string, key: string, remote: S3Like) {
    super();
    this.bucket = bucket;
    this.key = key;
    this.remote = remote;
  }

  get uri(): string {
    return this.name;
  }

  get name(): string {
    return `s3://${this.bucket}/${this.key}`;
  }

  static isSource(source: ChunkSource): source is SourceAwsS3 {
    return source.type === SourceAwsS3.type;
  }

  metadata: ChunkSourceMetadata | null;
  parseResponse(res: HeadRes | GetObjectRes): ChunkSourceMetadata {
    const metadata: ChunkSourceMetadata = {};
    if ('ContentRange' in res && res.ContentRange != null) metadata.size = this.parseContentRange(res.ContentRange);
    if ('ContentLength' in res && res.ContentLength != null) metadata.size = res.ContentLength;
    if (res.ETag) metadata.etag = res.ETag;
    return metadata;
  }

  private _head: Promise<HeadRes> | null;
  head(): Promise<HeadRes> {
    if (this._head) return this._head;
    this._head = toPromise(this.remote.headObject({ Bucket: this.bucket, Key: this.key })).then((res) => {
      this.metadata = this.parseResponse(res);
      return res;
    });
    return this._head;
  }

  /** Read the content length from the last request */
  get size(): Promise<number> {
    return this.head().then(() => this.metadata?.size ?? -1);
  }

  /**
   * Parse a URI and create a source
   *
   * @example
   * ```typescript
   * fromUri('s3://foo/bar/baz.tiff')
   * ```
   *
   * @param uri URI to parse
   */
  static fromUri(uri: string, remote: S3Like): SourceAwsS3 | null {
    const res = parseUri(uri);
    if (res == null || res.key == null) return null;
    if (res.protocol !== 's3') return null;
    return new SourceAwsS3(res.bucket, res.key, remote);
  }

  async fetchBytes(offset: number, length?: number): Promise<ArrayBuffer> {
    const fetchRange = this.toRange(offset, length);
    try {
      const resp = await this.remote.getObject({ Bucket: this.bucket, Key: this.key, Range: fetchRange }).promise();
      if (!Buffer.isBuffer(resp.Body)) throw new Error('Failed to fetch object, Body is not a buffer');

      if (this.metadata == null) this.metadata = this.parseResponse(resp);

      const lastEtag = this.metadata?.etag;

      // If the file has been modified since the last time we requested data this can cause conflicts so error out
      if (lastEtag && resp.ETag && lastEtag !== resp.ETag) {
        throw new CompositeError(
          `ETag conflict ${this.name} ${fetchRange} expected: ${lastEtag} got: ${resp.ETag}`,
          ErrorCodes.Conflict,
          undefined,
        );
      }

      const buffer = resp.Body;
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } catch (err) {
      // Already a composite error just rethrow
      if (err instanceof CompositeError) throw err;
      throw getCompositeError(err, `Failed to fetch ${this.name} ${fetchRange}`);
    }
  }
}
