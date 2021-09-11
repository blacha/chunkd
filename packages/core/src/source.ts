import { ByteSize } from '.';
import { LogType } from './log';

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
