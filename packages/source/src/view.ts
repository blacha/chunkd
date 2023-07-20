import { SourceCallback, SourceMiddleware, SourceRequest } from './middleware.js';
import { Source, SourceMetadata } from './source.js';

/**
 * Wrap a source with middleware to modify requests to the sources
 *
 * @see @chunkd/middleware
 */
export class SourceView implements Source {
  source: Source;
  middleware: SourceMiddleware[];

  static is(s: Source): s is SourceView {
    if ('middleware' in s) return true;
    return false;
  }

  constructor(source: Source, middleware: SourceMiddleware[] = []) {
    this.source = source;
    this.middleware = middleware;
  }

  get type(): string {
    return this.source.type;
  }

  get url(): URL {
    return this.source.url;
  }

  get metadata(): SourceMetadata | undefined {
    return this.source.metadata;
  }

  head(): Promise<SourceMetadata> {
    return this.source.head();
  }

  async close(): Promise<void> {
    return this.source.close?.();
  }

  async fetch(offset: number, length?: number): Promise<ArrayBuffer> {
    const middleware = this.middleware;
    if (middleware == null || middleware.length === 0) return this.source.fetch(offset, length);
    const handler: SourceCallback = (req: SourceRequest) => this.source.fetch(req.offset, req.length);
    return this.run(handler, offset, length);
  }

  /** Run a request using all the middleware */
  async run(handler: SourceCallback, offset: number, length?: number): Promise<ArrayBuffer> {
    const middleware = this.middleware;
    if (middleware == null) return handler({ source: this, offset, length });

    function runMiddleware(middleware: SourceMiddleware, next: SourceCallback): SourceCallback {
      return (req: SourceRequest): Promise<ArrayBuffer> => middleware.fetch(req, next);
    }

    for (let i = middleware.length - 1; i >= 0; i--) handler = runMiddleware(middleware[i], handler);
    return handler({ source: this, offset, length });
  }
}
