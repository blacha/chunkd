import { Source, SourceMetadata } from '@chunkd/source';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export class SourceFile implements Source {
  type = 'file';
  fd?: Promise<fs.FileHandle> | null = null;
  url: URL;

  /** Automatically close the file descriptor after reading */
  closeAfterRead = false;

  constructor(filePath: URL | string, opts: { closeAfterRead: boolean } = { closeAfterRead: false }) {
    this.closeAfterRead = opts.closeAfterRead;
    this.url = typeof filePath === 'string' ? pathToFileURL(resolve(filePath)) : filePath;
  }

  /** Close the file handle */
  async close(): Promise<void> {
    if (this.fd == null) return;
    const fd = await this.fd;
    if (fd == null) return;
    await fd.close();
    this.fd = null;
  }

  metadata?: SourceMetadata;
  _head?: Promise<SourceMetadata>;
  head(): Promise<SourceMetadata> {
    if (this._head) return this._head;
    if (this.fd == null) this.fd = fs.open(this.url, 'r');
    this._head = this.fd?.then(async (fd) => {
      const stats = await fd.stat();
      this.metadata = { size: stats.size, lastModified: stats.mtime.toString() };
      return this.metadata;
    });

    return this._head;
  }

  async fetch(offset: number, length?: number): Promise<ArrayBuffer> {
    if (offset < 0 && length != null) {
      throw new Error(`Cannot fetch negative offset: ${offset} with length: ${length} from: ${this.url}`);
    }

    // If reading negative offsets we need the length of the file before we can read it.
    if (offset < 0) {
      length = Math.abs(offset);
      const metadata = await this.head();
      if (metadata.size == null) throw new Error(`Failed to fetch metadata from: ${this.url}`);
      offset = metadata.size + offset;
    } else if (this.metadata == null) await this.head();

    const size = this.metadata?.size;

    // If no length given read the entire file
    if (length == null && size != null) length = size - offset;

    if (length == null || size == null) throw new Error(`Length is required for reading from file: ${this.url}`);
    if (this.fd == null) this.fd = fs.open(this.url, 'r');
    const fd = await this.fd;
    const { buffer } = await fd.read(Buffer.allocUnsafe(length ?? size), 0, length, offset);
    if (this.closeAfterRead) await this.close();
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }
}
