import { ChunkSource, ChunkSourceBase } from '@chunkd/core';
import { promises as fs } from 'fs';
import { basename, resolve } from 'path';

export class SourceFile extends ChunkSourceBase {
  type = 'file';
  protocol = 'file';

  static DefaultChunkSize = 16 * 1024;
  chunkSize: number = SourceFile.DefaultChunkSize;

  fileName: string;
  fd: Promise<fs.FileHandle> | null = null;

  /** Automatically close the file descriptor after reading */
  closeAfterRead = false;

  static isSource(source: ChunkSource): source is SourceFile {
    return source.type === 'file';
  }

  constructor(fileName: string) {
    super();
    this.fileName = fileName;
  }

  /** Close the file handle */
  async close(): Promise<void> {
    const fd = await this.fd;
    if (fd == null) return;
    await fd.close();
    this.fd = null;
  }

  /** Full reference path to the file */
  get uri(): string {
    return resolve(this.fileName);
  }

  /** name of the file */
  get name(): string {
    return basename(this.fileName);
  }

  private _size: Promise<number> | undefined;
  get size(): Promise<number> {
    if (this._size) return this._size;
    this._size = Promise.resolve().then(async () => {
      const stat = await fs.stat(this.fileName);
      return stat.size;
    });
    return this._size;
  }

  async fetchBytes(offset: number, length?: number): Promise<ArrayBuffer> {
    if (offset < 0 && length != null) throw new Error('Cannot fetch negative offsets with length');

    if (offset < 0) {
      length = Math.abs(offset);
      const size = await this.size;
      offset = size + offset;
    }
    if (length == null) throw new Error('Length is required for reading from files');
    if (this.fd == null) this.fd = fs.open(this.fileName, 'r');
    const fd = await this.fd;
    const { buffer } = await fd.read(Buffer.allocUnsafe(length), 0, length, offset);
    if (this.closeAfterRead) await this.close();
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }
}
