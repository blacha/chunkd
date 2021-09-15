import { ChunkSource, ChunkSourceBase, LogType, CompositeError, isRecord } from '@chunkd/core';
import { S3Like } from './type.js';

export function getCompositeError(e: unknown, msg: string): CompositeError {
  if (!isRecord(e)) return new CompositeError(msg, 500, e);
  if (typeof e.statusCode !== 'number') return new CompositeError(msg, 500, e);
  return new CompositeError(msg, e.statusCode, e);
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

  _size: Promise<number> | undefined;
  get size(): Promise<number> {
    if (this._size) return this._size;
    this._size = Promise.resolve().then(async () => {
      const res = await this.remote.headObject({ Bucket: this.bucket, Key: this.key }).promise();
      return res.ContentLength || -1;
    });
    return this._size;
  }
  /**
   * Parse a s3 URI and return the components
   *
   * @example
   * `s3://foo/bar/baz.tiff`
   *
   * @param uri URI to parse
   */
  static parse(uri: string): { key: string; bucket: string } | null {
    if (!uri.startsWith('s3://')) return null;

    const parts = uri.split('/');
    const bucket = parts[2];
    if (bucket == null || bucket.trim() === '') return null;
    const key = parts.slice(3).join('/');
    if (key == null || key.trim() === '') return null;
    return { key, bucket };
  }

  /**
   * Parse a URI and create a source
   *
   * @example
   * `s3://foo/bar/baz.tiff`
   *
   * @param uri URI to parse
   */
  static fromUri(uri: string, remote: S3Like): SourceAwsS3 | null {
    const res = SourceAwsS3.parse(uri);
    if (res == null) return null;
    return new SourceAwsS3(res.bucket, res.key, remote);
  }

  async fetchBytes(offset: number, length?: number, logger?: LogType): Promise<ArrayBuffer> {
    const fetchRange = this.toRange(offset, length);
    try {
      const resp = await this.remote.getObject({ Bucket: this.bucket, Key: this.key, Range: fetchRange }).promise();
      if (!Buffer.isBuffer(resp.Body)) throw new Error('Failed to fetch object, Body is not a buffer');

      // Set the size of this object now that we know how big it is
      if (resp.ContentRange != null && this._size == null) {
        this._size = Promise.resolve(this.parseContentRange(resp.ContentRange));
      }

      const buffer = resp.Body;
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } catch (err) {
      logger?.error({ err, source: this.name, fetchRange }, 'FailedToFetch');
      throw getCompositeError(err, `Failed to fetch ${this.name} ${fetchRange}`);
    }
  }
}
