import { Source, SourceMetadata } from '@chunkd/source';

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

  constructor(url: URL, bytes: Buffer | Uint8Array | ArrayBuffer) {
    const buf = SourceMemory.toArrayBuffer(bytes ?? new Uint8Array());
    this.url = url;
    this.data = buf;
    this.metadata = { size: buf.byteLength };
  }

  head(): Promise<SourceMetadata> {
    return Promise.resolve({ size: this.data.byteLength });
  }

  async fetch(offset: number, length?: number): Promise<ArrayBuffer> {
    if (offset < 0) offset = this.data.byteLength + offset;
    return this.data.slice(offset, length == null ? undefined : offset + length);
  }
}
