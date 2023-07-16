import { ContentRange, Source, SourceMetadata } from '@chunkd/source';

/** Minimal typings for fetch */
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
export type FetchLike = (url: string | URL, opts?: FetchLikeOptions) => Promise<FetchLikeResponse>;

/** Load the ETag and content-range from the response */
export function getMetadataFromResponse(response: FetchLikeResponse): SourceMetadata {
  const metadata: SourceMetadata = { size: -1 };
  const contentRange = response.headers.get('content-range');
  if (contentRange != null) metadata.size = ContentRange.parseSize(contentRange);
  metadata.eTag = response.headers.get('etag') ?? undefined;
  metadata.contentType = response.headers.get('content-type') ?? undefined;
  metadata.contentDisposition = response.headers.get('content-disposition') ?? undefined;
  return metadata;
}

export class SourceHttp implements Source {
  type = 'http';
  url: URL;

  constructor(url: URL | string) {
    this.url = typeof url === 'string' ? new URL(url) : url;
  }

  /** Optional metadata, only populated if a .head() or .fetchBytes() has already been returned */
  metadata?: SourceMetadata;

  private _head?: Promise<SourceMetadata>;
  head(): Promise<SourceMetadata> {
    if (this._head) return this._head;
    this._head = SourceHttp.fetchFunc(this.url, { method: 'HEAD' }).then((res) => {
      if (!res.ok) {
        delete this._head;
        throw new Error(`Failed to HEAD ${this.url}`, { cause: { statusCode: res.status, msg: res.statusText } });
      }
      this.metadata = getMetadataFromResponse(res);
      return this.metadata;
    });
    return this._head;
  }

  async fetch(offset: number, length?: number): Promise<ArrayBuffer> {
    const Range = ContentRange.toRange(offset, length);
    const headers = { Range };
    const response = await SourceHttp.fetchFunc(this.url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${this.url} ${Range}`, {
        cause: { statusCode: response.status, message: response.statusText },
      });
    }

    const metadata = getMetadataFromResponse(response);
    if (this.metadata == null) {
      this.metadata = metadata;
    } else if (this.metadata.eTag && this.metadata.eTag !== metadata.eTag) {
      // ETag has changed since the last read!
      throw new Error(`ETag conflict ${this.url} ${Range} expected: ${this.metadata.eTag} got: ${metadata.eTag}`, {
        cause: { statusCode: 409 },
      });
    }
    return response.arrayBuffer();
  }

  // Allow overwriting the fetcher used (eg testing/node-js)
  static fetchFunc: FetchLike = (a, b) => fetch(a, b);
}
