import { Source } from '@chunkd/source';
import { Readable } from 'node:stream';

export type FileWriteTypes = Buffer | Readable | string;

export interface FileInfo {
  /** file path */
  path: URL;
  /**
   * Size of file in bytes
   * undefined if no size found
   */
  size?: number;

  /** Is this file a directory */
  isDirectory?: boolean;

  /** Additional metadata returned from the request */
  metadata?: Record<string, string>;
  /** Encoding of the file eg "gzip" */
  contentEncoding?: string;
  /** Content type of the file eg "text/plain" */
  contentType?: string;
  /** Entity tag */
  eTag?: string;
  /** ISO String of when the file was last modified */
  lastModified?: string;
}

export interface WriteOptions {
  /** Encoding of the file eg "gzip" */
  contentEncoding?: string;
  /** Content type of the file eg "text/plain" */
  contentType?: string;
  /** Additional metadata to be written */
  metadata?: Record<string, string>;
}

export interface ListOptions {
  /**
   * List recursively
   * @default true
   */
  recursive?: boolean;
}

export interface FileSystem {
  /**
   * name of the file system
   * @example
   * "file"
   * "s3"
   * "http"
   */
  name: string;
  /** Read a file into a buffer */
  read(filePath: URL): Promise<Buffer>;
  /** Create a read stream */
  readStream(filePath: URL): Readable;
  /** Write a file from either a buffer or stream */
  write(filePath: URL, buffer: Buffer | Readable | string, opts?: Partial<WriteOptions>): Promise<void>;
  /** list all files in path */
  list(filePath: URL, opt?: ListOptions): AsyncGenerator<URL>;
  /** list all files with file info in path */
  details(filePath: URL, opt?: ListOptions): AsyncGenerator<FileInfo>;
  /** Get information about the path  */
  head(filePath: URL): Promise<FileInfo | null>;
  /** Create a chunk source to read chunks out of */
  source(filePath: URL): Source;
  /** Delete a file from the location */
  delete(filePath: URL): Promise<void>;
}
