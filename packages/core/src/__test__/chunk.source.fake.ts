import * as fs from 'fs';
import { ChunkSourceBase } from '../chunk.source.js';

export class FakeChunkSource extends ChunkSourceBase {
  protocol = 'fake';
  type = 'fake';
  uri = 'fake';
  chunkSize = 100;

  async fetchBytes(offset: number, length: number): Promise<ArrayBuffer> {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = offset + i;
    }
    return Promise.resolve(bytes.buffer);
  }

  size = Promise.resolve(100);

  name = 'FakeSource';
}

let Id = 0;
export class TestFileChunkSource extends ChunkSourceBase {
  protocol = 'test';
  id = Id++;
  type = 'test-file';
  uri = '/test/file';
  chunkSize: number = 1024 * 1024 * 1024;
  name: string;
  fileName: string;

  constructor(fileName: string) {
    super();
    this.fileName = fileName;
    this.name = `Fake:${this.id}:` + this.fileName;
  }
  async fetchBytes(offset: number, length: number): Promise<ArrayBuffer> {
    const fileData = await fs.promises.readFile(this.fileName);
    return fileData.buffer.slice(fileData.byteOffset + offset, fileData.byteOffset + offset + length);
  }

  get size(): Promise<number> {
    return Promise.resolve()
      .then(() => fs.promises.stat(this.fileName))
      .then((f) => f.size);
  }
}
