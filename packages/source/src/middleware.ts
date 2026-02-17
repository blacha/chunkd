import { Source } from './source.js';

/** A {@link Source.fetch} fetch represented as a object */
export interface SourceRequest {
  /** Source that triggered the request */
  source: Source;
  /** Offset that is attempting to be read see {@link Source.fetch} */
  offset: number;
  /** Number of bytes to read, or undefined see {@link Source.fetch}  */
  length: number | undefined;
  /** Optional signal to abort requests */
  signal?: AbortSignal;
}
export type SourceCallback = (req: SourceRequest) => Promise<ArrayBuffer>;

export interface SourceMiddleware {
  name: string;
  fetch(req: SourceRequest, next: SourceCallback): Promise<ArrayBuffer>;

  /** When a source is closed, this call back is fired */
  onClose?(source: Source): Promise<void>;
}
