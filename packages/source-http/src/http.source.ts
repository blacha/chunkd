import { ChunkSource, ChunkSourceBase } from '@chunkd/core';

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

  _size: Promise<number> | undefined;
  get size(): Promise<number> {
    if (this._size) return this._size;
    this._size = Promise.resolve().then(async () => {
      const res = await SourceHttp.fetch(this.uri, { method: 'HEAD' });
      return Number(res.headers.get('content-length'));
    });
    return this._size;
  }

  async fetchBytes(offset: number, length?: number): Promise<ArrayBuffer> {
    const Range = this.toRange(offset, length);
    const headers = { Range };
    const response = await SourceHttp.fetch(this.uri, { headers });

    if (response.ok) {
      const contentRange = response.headers.get('content-range');
      if (this._size == null && contentRange != null) {
        this._size = Promise.resolve(this.parseContentRange(contentRange));
      }
      return response.arrayBuffer();
    }

    throw new Error('Failed to fetch');
  }

  // Allow overwriting the fetcher used (eg testing/node-js)
  static fetch: FetchLike = (a, b) => fetch(a, b);
}
