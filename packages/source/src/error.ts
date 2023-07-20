import { Source } from './source.js';

export class SourceError extends Error {
  /** Status code for the error eg 403 - Forbidden vs 404 Not found */
  readonly code: number;
  /** URL that the status code came from */
  readonly url: URL;
  /** File system that triggered the error */
  readonly source: Source;

  constructor(msg: string, code: number, source: Source, cause?: unknown) {
    super(msg, { cause });
    this.code = code;
    this.url = source.url;
    this.source = source;

    /** Helper to determine if this class is a SourceError, useful for when `instanceof` fails */
    Object.defineProperty(this, '_sourceError', {
      enumerable: false, // hide it from for..in
      value: 'SourceError',
    });
  }

  /** Check that a unknown is a FsError */
  static is(e: unknown): e is SourceError {
    if (e instanceof SourceError) return true;
    // Sometimes instanceof fails, so fall back to checking for a `_sourceError` key
    if (typeof e !== 'object') return false;
    if (e == null) return false;
    return '_sourceError' in e && e['_sourceError'] === 'SourceError';
  }
}
