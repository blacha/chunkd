import { ChunkSource } from './chunk.source';

export class SourceMemory extends ChunkSource {
  protocol = 'memory';
  chunkSize: number;
  uri: string;
  name: string;
  type = 'memory';
  data: ArrayBuffer;

  static toArrayBuffer(buf: Buffer | Uint8Array | ArrayBuffer): ArrayBuffer {
    if (buf instanceof ArrayBuffer) return buf;
    if (buf.byteLength === buf.buffer.byteLength) return buf.buffer;
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }

  constructor(name: string, bytes: ArrayBuffer | Buffer) {
    super();
    const buf = SourceMemory.toArrayBuffer(bytes);
    this.name = name;
    this.uri = `memory://${name}`;
    this.data = buf;
    this.chunkSize = buf.byteLength;
    this.chunks.set(0, new DataView(buf));
  }

  get size(): Promise<number> {
    return Promise.resolve(this.data.byteLength);
  }

  async fetchBytes(offset: number, length?: number): Promise<ArrayBuffer> {
    if (offset < 0) offset = this.data.byteLength + offset;
    return this.data.slice(offset, length == null ? undefined : offset + length);
  }
}
