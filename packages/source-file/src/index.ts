import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { Source, SourceError, SourceMetadata } from '@chunkd/source';

// File Stat will always return a size and lastModified
type SourceMetadataWithSize = SourceMetadata & { size: number; lastModified: string };

export class SourceFile implements Source {
  type = 'file';
  url: URL;

  constructor(loc: URL | string) {
    this.url = typeof loc === 'string' ? pathToFileURL(resolve(loc)) : loc;
  }

  metadata?: SourceMetadataWithSize;
  _head?: Promise<SourceMetadataWithSize>;
  head(): Promise<SourceMetadataWithSize> {
    if (this._head) return this._head;
    this._head = fs.stat(this.url).then((stats) => {
      this.metadata = { size: stats.size, lastModified: stats.mtime.toString() };
      return this.metadata;
    });

    return this._head;
  }

  async fetch(offset: number, length?: number): Promise<ArrayBuffer> {
    if (offset < 0 && length != null) {
      throw new SourceError(
        `Cannot fetch negative offset: ${offset} with length: ${length} from: ${this.url.href}`,
        400,
        this,
      );
    }

    const metadata = await this.head();

    // If reading negative offsets we need the length of the file before we can read it.
    if (offset < 0) {
      length = Math.abs(offset);
      offset = metadata.size + offset;
    }

    const size = metadata.size;
    // If no length given read the entire file
    if (length == null) length = size - offset;

    // console.log({ length, offset });
    const fd = await fs.open(this.url, 'r');
    try {
      const { buffer } = await fd.read(Buffer.allocUnsafe(length ?? size), 0, length, offset);
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } finally {
      await fd.close();
    }
  }
}
