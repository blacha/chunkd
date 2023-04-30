import { Source, SourceMetadata } from '@chunkd/source';
import { SourceMiddleware, SourceCallback, SourceRequest } from './type.js';

export class SourceFactory {
  middleware: SourceMiddleware[] = [];

  /** add a middleware to the end of the queue */
  use(mw: SourceMiddleware): void {
    this.middleware.push(mw);
  }
  /** Add a middleware to the front of the queue */
  unshift(mw: SourceMiddleware): void {
    this.middleware.unshift(mw);
  }

  view(s: Source): SourceView {
    return new SourceView(s, this);
  }
}

export class SourceView implements Source {
  source: Source;
  middleware: SourceFactory;

  constructor(source: Source, factory: SourceFactory) {
    this.source = source;
    this.middleware = factory;
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

  async fetch(offset: number, length?: number): Promise<ArrayBuffer> {
    const middleware = this.middleware.middleware;
    if (middleware.length === 0) return this.source.fetch(offset, length);
    const handler: SourceCallback = (req: SourceRequest) => this.source.fetch(req.offset, req.length);
    return this.run(handler, offset, length);
  }

  async run(handler: SourceCallback, offset: number, length?: number): Promise<ArrayBuffer> {
    const middleware = this.middleware.middleware;

    function runMiddleware(middleware: SourceMiddleware, next: SourceCallback): SourceCallback {
      return (req: SourceRequest): Promise<ArrayBuffer> => middleware.fetch(req, next);
    }

    for (let i = middleware.length - 1; i >= 0; i--) handler = runMiddleware(middleware[i], handler);
    return handler({ source: this, offset, length });
  }
}
