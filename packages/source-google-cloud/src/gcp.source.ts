import { ChunkSource, ChunkSourceBase, parseUri } from '@chunkd/core';
import { Storage, File } from '@google-cloud/storage';
import { getCompositeError, toBuffer } from './stream.js';

export class SourceGoogleStorage extends ChunkSourceBase {
  static type = 'google-cloud:storage';
  type = SourceGoogleStorage.type;
  protocol = 'gs';

  static DefaultChunkSize = 64 * 1024;
  static DefaultMaxChunkCount = 32;

  // HTTP gets are slow, get a larger amount
  chunkSize: number = SourceGoogleStorage.DefaultChunkSize;
  maxChunkCount = SourceGoogleStorage.DefaultMaxChunkCount;

  bucket: string;
  key: string;
  file: File;

  constructor(bucket: string, key: string, storage: Storage) {
    super();
    this.bucket = bucket;
    this.key = key;

    this.file = storage.bucket(this.bucket).file(this.key);
  }

  get uri(): string {
    return this.name;
  }

  get name(): string {
    return `gs://${this.bucket}/${this.key}`;
  }

  static isSource(source: ChunkSource): source is SourceGoogleStorage {
    return source.type === SourceGoogleStorage.type;
  }

  _size: Promise<number> | undefined;
  get size(): Promise<number> {
    if (this._size) return this._size;
    this._size = Promise.resolve().then(async () => {
      const res = await this.file.getMetadata();
      return res[0].size ?? -1;
    });
    return this._size;
  }

  /**
   * Parse a URI and create a source
   *
   * @example
   * `gs://foo/bar/baz.tiff`
   *
   * @param uri URI to parse
   */
  static fromUri(uri: string, remote: Storage): SourceGoogleStorage | null {
    const res = parseUri(uri);
    if (res == null || res.key == null) return null;
    if (res.protocol !== 'gs') return null;
    return new SourceGoogleStorage(res.bucket, res.key, remote);
  }

  async fetchBytes(offset: number, length?: number): Promise<ArrayBuffer> {
    const fetchRange = this.toRange(offset, length);
    try {
      const resp = await this.file.createReadStream({
        start: offset,
        end: length == null ? undefined : offset + length,
      });

      const buffer = await toBuffer(resp);
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } catch (err) {
      throw getCompositeError(err, `Failed to fetch ${this.name} ${fetchRange}`);
    }
  }
}
