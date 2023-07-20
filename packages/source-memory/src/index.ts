import { Source, SourceError, SourceMetadata, tryParseUrl } from '@chunkd/source';

function parseMemoryUrl(s: string | URL): URL {
  if (typeof s !== 'string') return s;
  const url = tryParseUrl(s);
  if (url) return url;
  return new URL('memory://' + s);
}

export class SourceMemory implements Source {
  url: URL;
  type = 'memory';
  data: ArrayBuffer;
  metadata: SourceMetadata;

  static toArrayBuffer(buf: Buffer | Uint8Array | ArrayBuffer): ArrayBuffer {
    if (buf instanceof ArrayBuffer) return buf;
    if (buf.byteLength === buf.buffer.byteLength) return buf.buffer;
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }

  constructor(url: URL | string, bytes: Buffer | Uint8Array | ArrayBuffer) {
    const buf = SourceMemory.toArrayBuffer(bytes ?? new Uint8Array());
    this.url = parseMemoryUrl(url);
    this.data = buf;
    this.metadata = { size: buf.byteLength };
  }

  head(): Promise<SourceMetadata> {
    return Promise.resolve({ size: this.data.byteLength });
  }

  async fetch(offset: number, length?: number): Promise<ArrayBuffer> {
    if (offset < 0) offset = this.data.byteLength + offset;

    if (offset > this.data.byteLength) {
      throw new SourceError('Read outside bounds', 400, this);
    }
    if (length && offset + length > this.data.byteLength) {
      throw new SourceError('Read outside bounds', 400, this);
    }
    return this.data.slice(offset, length == null ? undefined : offset + length);
  }
}
