import { Readable } from 'node:stream';

import { Source, SourceMetadata } from '@chunkd/source';

export type FileWriteTypes = Buffer | Readable | string;

export interface FileInfo<T = unknown> extends SourceMetadata {
  /** file path */
  url: URL;
  /** Is this file a directory */
  isDirectory?: boolean;
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
  /** Only write the file if  */
  ifMatch?: string;
  /** Only write the file if target does not exist */
  ifNoneMatch?: '*';
  /** Content-Disposition header */
  contentDisposition?: string;
  /** Cache-Control header */
  cacheControl?: string;
}

export interface ListOptions {
  /**
   * List recursively
   * @default true
   */
  recursive?: boolean;
}

export type ReadResponse<T = unknown> = Promise<Buffer & { $metadata?: FileInfo<T> }>;
export type ReadStreamResponse<T = unknown> = Readable & { $metadata?: FileInfo<T> };

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
  read<T = unknown>(buffer: Buffer, meta: FileInfo<T>): Awaited<ReadResponse<T>> {
    const ret = buffer as Awaited<ReadResponse<T>>;

    ret.$metadata = meta;
    Object.defineProperty(ret, '$response', { enumerable: false });

    return ret;
  },

  /** Annotate a read response with the common properties */
  readStream<T = unknown>(res: Readable, meta: FileInfo<T>): Awaited<ReadStreamResponse<T>> {
    const ret = res as Awaited<ReadStreamResponse<T>>;
    ret.$metadata = meta;
    Object.defineProperty(ret, '$response', { enumerable: false });
    return ret;
  },
};
