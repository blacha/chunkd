import { LogType } from './log';

export interface ChunkSource extends DataView {
  /** type of the source, @example `file` or `aws:s3` */
  type: string;
  /** Uri to the object */
  uri: string;
  /** Load bytes from a remote source into memory */
  loadBytes(offset: number, length: number, log?: LogType): Promise<void>;
  /** Source size in bytes */
  size: Promise<number>;
}
