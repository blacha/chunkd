import { Readable } from 'node:stream';

import { Source } from '@chunkd/source';

export type FileWriteTypes = Buffer | Readable | string;

export interface FileInfo<T = unknown> {
  /** file path */
  url: URL;
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

  /**
   * Raw response object
   *
   * For example in AWS S3 this is the HeadObjectResponse when doing head requests
   *
   * TODO: this should eventually shift to a symbol
   */
  $response?: T;
}

export interface WriteOptions {
  /** Encoding of the file eg "gzip" */
  contentEncoding?: string;
  /** Content type of the file eg "text/plain" */
  contentType?: string;
  /** Additional metadata to be written */
  metadata?: Record<string, string>;

  ifMatch?: string;
  ifNoneMatch?: string;
  contentDisposition?: string;
  cacheControl?: string;
}

export interface ListOptions {
  /**
   * List recursively
   * @default true
   */
  recursive?: boolean;
}

export type ReadResponse = Promise<Buffer & { $url: URL; $response?: unknown }>;
export type ReadStreamResponse = Readable & { $url: URL; $response?: unknown };

export interface FileSystem {
  /**
   * name of the file system
   *
   * @example
   * "file"
   * "s3"
   * "http"
   */
  name: string;
  /** Read a file into a buffer */
  read(location: URL): ReadResponse;
  /** Create a read stream */
  readStream(location: URL): ReadStreamResponse;
  /** Write a file from either a buffer or stream */
  write(location: URL, buffer: Buffer | Readable | string, opts?: Partial<WriteOptions>): Promise<void>;
  /** list all files in location */
  list(location: URL, opt?: ListOptions): AsyncGenerator<URL>;
  /** list all files with file info in location */
  details(location: URL, opt?: ListOptions): AsyncGenerator<FileInfo>;
  /** Get information about the location  */
  head(location: URL): Promise<FileInfo | null>;
  /** Create a chunk source to read chunks out of */
  source(location: URL): Source;
  /** Delete a file from the location */
  delete(location: URL): Promise<void>;
}

/** All actions on a file system */
export type FileSystemAction = 'read' | 'readStream' | 'write' | 'list' | 'details' | 'head' | 'source' | 'delete';

/** Annotate responses with more information */
export const annotate = {
  /** Annotate a read response with the common properties */
  read(buffer: Buffer, source: URL, response?: unknown): Awaited<ReadResponse> {
    const ret = buffer as Awaited<ReadResponse>;
    ret.$url = source;
    if (response) {
      ret.$response = response;
      Object.defineProperty(buffer, '$response', { enumerable: false });
    }
    Object.defineProperty(buffer, '$url', { enumerable: false });

    return ret;
  },

  /** Annotate a read response with the common properties */
  readStream(res: Readable, source: URL, response?: unknown): Awaited<ReadStreamResponse> {
    const ret = res as Awaited<ReadStreamResponse>;
    ret.$url = source;
    Object.defineProperty(res, '$url', { enumerable: false });

    if (response) {
      ret.$response = response;
      Object.defineProperty(res, '$response', { enumerable: false });
    }
    return ret;
  },
};
