import type { Readable } from 'stream';
import { ChunkSource } from './source';

export interface FileInfo {
  /** file path */
  path: string;
  /**
   * Size of file in bytes
   * undefined if no size found
   */
  size?: number;

  /** Is this file a directory */
  isDirectory?: boolean;
}

export interface WriteOptions {
  /** Encoding of the file eg "gzip" */
  contentEncoding?: string;
  /** Content type of the file eg "text/plain" */
  contentType?: string;
}

export interface ListOptions {
  /**
   * List recursively
   * @default true
   */
  recursive?: boolean;
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
  write(filePath: string, buffer: Buffer | Readable | string, opts?: WriteOptions): Promise<void>;
  /** list all files in path */
  list(filePath: string, opt?: ListOptions): AsyncGenerator<string>;
  /** list all files with file info in path */
  details(filePath: string, opt?: ListOptions): AsyncGenerator<FileInfo>;
  /** Get information about the path  */
  head(filePath: string): Promise<FileInfo | null>;
  /** Create a file source to read chunks out of */
  source(filePath: string): T;
}
