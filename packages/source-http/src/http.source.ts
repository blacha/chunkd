import { ChunkSource, ChunkSourceBase, ChunkSourceMetadata, CompositeError, ErrorCodes } from '@chunkd/core';

export interface FetchLikeOptions {
  method?: string;
  headers?: Record<string, string>;
}
export interface FetchLikeResponse {
  ok: boolean;
  statusText: string;
  status: number;
  headers: { get(k: string): string | null };
  arrayBuffer(): Promise<ArrayBuffer>;
}
export type FetchLike = (url: string, opts?: FetchLikeOptions) => Promise<FetchLikeResponse>;

export class SourceHttp extends ChunkSourceBase {
  type = 'url';
  protocol = 'http';

  static DefaultChunkSize = 32 * 1024;
  chunkSize: number = SourceHttp.DefaultChunkSize;

  uri: string;

  constructor(uri: string) {
    super();
    this.uri = uri;
  }

  static isSource(source: ChunkSource): source is SourceHttp {
    return source.type === 'url';
  }

  metadata: ChunkSourceMetadata | null;
  /** Load the ETag and content-range from the response */
  parseResponse(response: FetchLikeResponse): ChunkSourceMetadata {
    const metadata: ChunkSourceMetadata = {};
    const contentRange = response.headers.get('content-range');
    if (contentRange != null) metadata.size = this.parseContentRange(contentRange);
    metadata.etag = response.headers.get('etag') ?? undefined;
    return metadata;
  }

  private _head: Promise<FetchLikeResponse> | null;
  head(): Promise<FetchLikeResponse> {
    if (this._head) return this._head;
    this._head = SourceHttp.fetch(this.uri, { method: 'HEAD' }).then((res) => {
      this.metadata = this.parseResponse(res);
      return res;
    });
    return this._head;
  }

  get size(): Promise<number> {
    if (this.metadata?.size) return Promise.resolve(this.metadata.size);
    return this.head().then(() => this.metadata?.size ?? -1);
  }

  async fetchBytes(offset: number, length?: number): Promise<ArrayBuffer> {
    const Range = this.toRange(offset, length);
    const headers = { Range };
    const response = await SourceHttp.fetch(this.uri, { headers });

    if (response.ok) {
      const metadata = this.parseResponse(response);
      if (this.metadata == null) this.metadata = metadata;
      else if (this.metadata.etag && this.metadata.etag !== metadata.etag)
        throw new CompositeError(
          `ETag conflict ${this.uri} ${Range} expected: ${this.metadata.etag} got: ${metadata.etag}`,
          ErrorCodes.Conflict,
          null,
        );
      return response.arrayBuffer();
    }

    throw new CompositeError(`Failed to fetch ${this.uri} ${Range}`, response.status, response.statusText);
  }

  // Allow overwriting the fetcher used (eg testing/node-js)
  static fetch: FetchLike = (a, b) => fetch(a, b);
}
