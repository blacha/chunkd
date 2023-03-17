import { ByteSize } from './bytes.js';

export interface ChunkSource extends DataView {
  /** type of the source, @example `file` or `aws:s3` */
  type: string;
  /** Uri to the object */
  uri: string;
  /** Number of bytes in each chunk */
  chunkSize: number;
  /** Source size in bytes */
  size: Promise<number>;
  /** Is the source little endian */
  isLittleEndian: boolean;
  /**
   * Directly read from the source
   *
   * **Warning** this method will bypass any caching or chunking
   *
   * @example
   * ```typescript
   *  source.fetchBytes(0, 1024) // load the first 1024 bytes
   *  source.fetchBytes(1024, 20) // read 20 bytes at offset 1024
   *  source.fetchBytes(-1024) // load the last 1024 bytes
   *```
   * @param offset Byte to start reading form
   * @param length optional number of bytes to read
   */
  fetchBytes(offset: number, length?: number): Promise<ArrayBuffer>;
  /** are the following bytes loaded into memory */
  hasBytes(offset: number, length: number): boolean;
  /** Load bytes from a remote source into memory */
  loadBytes(offset: number, length: number): Promise<void>;
  /** Read bytes out of the sources */
  bytes(offset: number, length: number): Uint8Array;
  /** Read a uint64 from the source this reduces precision to `number` */
  getUint64(offset: number): number;
  /** Read a uint by number of bytes */
  getUint(offset: number, bytes: ByteSize): number;
  /** close the source */
  close?(): Promise<void>;
}

/** Metadata returned from some sources like HTTP or AWS */
export interface ChunkSourceMetadata {
  /** number of bytes of the file */
  size?: number;

  /** Entity tag */
  etag?: string;
}
