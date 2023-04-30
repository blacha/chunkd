import { S3Client, GetObjectCommand, HeadObjectCommand, GetObjectOutput, HeadObjectOutput } from '@aws-sdk/client-s3';
import { ContentRange, Source, SourceMetadata } from '@chunkd/source';

function parseMetadata(res: GetObjectOutput | HeadObjectOutput): SourceMetadata {
  const metadata: SourceMetadata = {};
  if ('ContentRange' in res && res.ContentRange) metadata.size = ContentRange.parseSize(res.ContentRange);
  else if (res.ContentLength) metadata.size = res.ContentLength;

  if (res.ETag) metadata.eTag = res.ETag;
  if (res.Metadata && Object.keys(res.Metadata).length > 0) metadata.metadata = res.Metadata;
  if (res.ContentType) metadata.contentType = res.ContentType;
  if (res.ContentDisposition) metadata.contentDisposition = res.ContentDisposition;
  if (res.LastModified) metadata.lastModified = res.LastModified.toISOString();
  Object.defineProperty(metadata, '$response', {
    enumerable: false,
    value: res,
  });
  return metadata;
}

function getStatusCode(e: unknown): number | null {
  if (typeof e !== 'object' || e == null) return null;
  if ('statusCode' in e && typeof e.statusCode === 'number') return e.statusCode;
  if ('$metadata' in e) {
    const metadata = e.$metadata;
    if (typeof metadata !== 'object' || metadata == null) return null;
    if ('httpStatusCode' in metadata && typeof metadata.httpStatusCode === 'number') return metadata.httpStatusCode;
  }
  return null;
}

export class SourceAwsS3 implements Source {
  type = 'aws:s3';
  url: URL;
  client: S3Client;
  metadata?: SourceMetadata | undefined;

  static getBucketKey(url: URL): { Bucket: string; Key: string } {
    return {
      Bucket: url.hostname,
      // pathnames start with "/" AWS does not like that
      // Also AWS will take files called "%F0%9F%A6%84.json" over the UTF-8 "🦄.json"
      Key: decodeURI(url.pathname.slice(1)),
    };
  }

  /** optionally set this source as requesterPays */
  requestPayer?: 'requester';

  constructor(url: URL, client: S3Client = new S3Client({})) {
    this.url = url;
    this.client = client;
  }

  _head?: Promise<SourceMetadata>;
  head(): Promise<SourceMetadata> {
    if (this._head) return this._head;

    const request = new HeadObjectCommand({
      ...SourceAwsS3.getBucketKey(this.url),
      Key: this.url.pathname.slice(1),
      RequestPayer: this.requestPayer,
    });
    this._head = this.client.send(request).then((response) => {
      this.metadata = parseMetadata(response);
      return parseMetadata(response);
    });
    return this._head;
  }

  async fetch(offset: number, length?: number): Promise<ArrayBuffer> {
    const fetchRange = ContentRange.toRange(offset, length);

    try {
      const request = new GetObjectCommand({
        ...SourceAwsS3.getBucketKey(this.url),
        Range: fetchRange,
        RequestPayer: this.requestPayer,
      });

      const response = await this.client.send(request);
      if (this.metadata == null) this.metadata = parseMetadata(response);

      const lastEtag = this.metadata?.eTag;
      // If the file has been modified since the last time we requested data this can cause conflicts so error out
      if (lastEtag && response.ETag && lastEtag !== response.ETag) {
        throw new Error(`ETag conflict ${this.url} ${fetchRange} expected: ${lastEtag} got: ${response.ETag}`, {
          cause: { statusCode: 409 },
        });
      }
      // Use `fetch` response object to convert stream to arrayBuffer
      return new Response(response.Body as unknown as BodyInit).arrayBuffer();
    } catch (e) {
      throw new Error(`Failed to fetchBytes from:${this.url} range: ${fetchRange}`, {
        cause: { statusCode: getStatusCode(e) ?? 500, error: e },
      });
    }
  }
}
