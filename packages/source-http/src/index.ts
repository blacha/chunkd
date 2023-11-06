import { ContentRange, Source, SourceError, SourceMetadata } from '@chunkd/source';

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
  body: unknown;
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
  headers?: Record<string,string>;

  constructor(url: URL | string, headers?:  Record<string, string>) {
    this.url = typeof url === 'string' ? SourceHttp.tryUrl(url) : url;
    if (typeof headers !== 'undefined') {
      this.headers = headers;
    }
  }


  /** Attempt to parse a relative string into a URL */
  static tryUrl(s: string): URL {
    try {
      return new URL(s);
    } catch (_e) {
      if (typeof document !== 'undefined') return new URL(s, document.baseURI);
      // Should these throw if import.meta.url is not a http?
      return new URL(s, import.meta.url);
    }
  }

  /** Optional metadata, only populated if a .head() or .fetchBytes() has already been returned */
  metadata?: SourceMetadata;

  private _head?: Promise<SourceMetadata>;
  head(): Promise<SourceMetadata> {
    if (this._head) return this._head;
    this._head = SourceHttp.fetch(this.url, { method: 'HEAD', headers: this.headers }).then((res) => {
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
    try {
      const Range = {'range': ContentRange.toRange(offset, length)};
      const headers = { range: ContentRange.toRange(offset, length), ...this.headers};

      const response = await SourceHttp.fetch(this.url, { headers });

      if (!response.ok) {
        throw new SourceError(
          `Failed to fetch ${this.url} ${Range}`,
          response.status,
          this,
          new Error(response.statusText),
          );
      }

      const metadata = getMetadataFromResponse(response);
      if (this.metadata == null) {
        this.metadata = metadata;
      } else if (this.metadata.eTag && this.metadata.eTag !== metadata.eTag) {
        // ETag has changed since the last read!
        throw new SourceError(
          `ETag conflict ${this.url} ${Range} expected: ${this.metadata.eTag} got: ${metadata.eTag}`,
          409,
          this,
          );
      }
      return response.arrayBuffer();
    } catch (e) {
      if (SourceError.is(e) && e.source === this) throw e;
      throw new SourceError(`Failed to fetch: ${this.url}`, 500, this, e);
    }
  }

  // Allow overwriting the fetcher used (eg testing/node-js)
  static fetch: FetchLike = (a, b) => fetch(a, b);
}
