import { FileSystemAction, FileSystem } from './file.system.js';

export class FsError extends Error {
  /** Status code for the error eg 403 - Forbidden vs 404 Not found */
  readonly code: number;
  /** URL that the status code came from */
  readonly url: URL;
  /** fsa action that triggered the error */
  readonly action: FileSystemAction;
  /** File system that triggered the error */
  readonly system: FileSystem;

  constructor(msg: string, code: number, url: URL, action: FileSystemAction, system: FileSystem, cause?: unknown) {
    super(msg, { cause });
    this.code = code;
    this.url = url;
    this.action = action;
    this.system = system;

    /** Helper to determine if this class is a FsError, useful for when `instanceof` fails */
    Object.defineProperty(this, '_fsError', {
      enumerable: false, // hide it from for..in
      value: 'FsError',
    });
  }

  /** Check that a unknown is a FsError */
  static is(e: unknown): e is FsError {
    if (e instanceof FsError) return true;
    // Sometimes instanceof fails, so fall back to checking for a `$fsError` key
    if (typeof e !== 'object') return false;
    if (e == null) return false;
    return '_fsError' in e && e['_fsError'] === 'FsError';
  }
}
