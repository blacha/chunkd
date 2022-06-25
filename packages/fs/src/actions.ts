import { FileInfo, WriteOptions } from '@chunkd/core';
import { Readable } from 'stream';
import { FileSystemAbstraction } from './fs.abstraction';

/** All possible actions */
export type FileSystemAction =
  | FileSystemActionRead
  | FileSystemActionWrite
  | FileSystemActionHead
  | FileSystemActionList
  | FileSystemActionDetails;

/** @see FileSystemAbstraction.read */
export interface FileSystemActionRead {
  request: {
    type: 'read';
    /** Path to read  */
    path: string;
  };
  response: {
    type: 'read';
    /** Buffer of data read from path */
    data: Buffer;
  };
}

/** @see FileSystemAbstraction.write */
export interface FileSystemActionWrite {
  request: { type: 'write'; path: string; data: Readable | string | Buffer; options?: WriteOptions };
  response: { type: 'write'; data: void };
}

/** @see FileSystemAbstraction.head */
export interface FileSystemActionHead {
  request: { type: 'head'; path: string };
  response: { type: 'head'; data: FileInfo | null };
}

/** @see FileSystemAbstraction.list */
export interface FileSystemActionList {
  request: { type: 'list'; path: string };
  response: { type: 'list'; data: AsyncGenerator<string> };
}

/** @see FileSystemAbstraction.details */
export interface FileSystemActionDetails {
  request: { type: 'details'; path: string };
  response: { type: 'details'; data: AsyncGenerator<FileInfo> };
}

export type FileSystemEventRequestHandler<T extends FileSystemAction = FileSystemAction> = (
  fsa: FileSystemAbstraction,
  req: T['request'],
) => T['response'] | Promise<T['response'] | null | undefined> | null | undefined;

export type FileSystemEventResponseHandler<T extends FileSystemAction = FileSystemAction> = (
  fsa: FileSystemAbstraction,
  req: T['request'],
  res: T['response'],
) => T['response'] | Promise<T['response'] | null | undefined> | null | undefined;

export type FileSystemEventErrorHandler<T extends FileSystemAction = FileSystemAction> = (
  fsa: FileSystemAbstraction,
  req: T['request'],
  err: Error,
) => T['response'] | Promise<T['response'] | null | undefined> | null | undefined;

export type FileSystemActions = {
  before?: FileSystemEventRequestHandler;
  after?: FileSystemEventResponseHandler;
  error?: FileSystemEventErrorHandler;
};
