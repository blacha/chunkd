import type { Readable } from 'stream';
import { ChunkSource } from '.';

export interface FileInfo {
  /** file path */
  path: string;
  /**
   * Size of file in bytes
   * undefined if no size found
   */
  size?: number;
}

export interface WriteOptions {
  /** Encoding of the file eg "gzip" */
  contentEncoding?: string;
  /** Content type of the file eg "text/plain" */
  contentType?: string;
}

export interface FileSystem<T extends ChunkSource = ChunkSource> {
  /**
   * Protocol used for communication
   * @example
   * file
   * s3
   * http
   */
  protocol: string;
  /** Read a file into a buffer */
  read(filePath: string): Promise<Buffer>;
  /** Create a read stream */
  stream(filePath: string): Readable;
  /** Write a file from either a buffer or stream */
  write(filePath: string, buffer: Buffer | Readable | string, opts?: Partial<WriteOptions>): Promise<void>;
  /** Recursively list all files in path */
  list(filePath: string): AsyncGenerator<string>;
  /** Recursively list all files in path with additional details */
  details(filePath: string): AsyncGenerator<FileInfo>;
  /** Does the path exists */
  exists(filePath: string): Promise<boolean>;
  /** Get information about the path  */
  head(filePath: string): Promise<FileInfo | null>;
  /** Create a file source to read chunks out of */
  source(filePath: string): T | null;
}
