import { FileInfo, WriteOptions } from '@chunkd/core';
import { Readable } from 'stream';
import { FileSystemAbstraction } from './fs.abstraction';

export type FileSystemAction = FileSystemActionRead | FileSystemActionWrite | FileSystemActionHead;

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
