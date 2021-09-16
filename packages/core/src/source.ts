import { ByteSize } from './bytes.js';
import { LogType } from './log.js';

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
   *  source.fetchBytes(0, 1024)
   *  source.fetchBytes(1024, 20)
   *  source.fetchBytes(-1024)
   *
   * @param offset Byte to start reading form
   * @param length optional number of bytes to read
   * @param log optional logger to track requests with
   */
  fetchBytes(offset: number, length?: number, log?: LogType): Promise<ArrayBuffer>;
  /** are the following bytes loaded into memory */
  hasBytes(offset: number, length: number): boolean;
  /** Load bytes from a remote source into memory */
  loadBytes(offset: number, length: number, log?: LogType): Promise<void>;
  /** Read bytes out of the sources */
  bytes(offset: number, length: number): Uint8Array;
  /** Read a uint64 from the source this reduces precision to `number` */
  getUint64(offset: number): number;
  /** Read a uint by number of bytes */
  getUint(offset: number, bytes: ByteSize): number;
  /** close the source */
  close?(): Promise<void>;
}
