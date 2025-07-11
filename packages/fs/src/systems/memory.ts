import { SourceMemory } from '@chunkd/source-memory';
import { Readable } from 'stream';

import { FsError } from '../error.js';
import { FileInfo, FileSystem, ListOptions, WriteOptions } from '../file.system.js';

export function toReadable(r: string | Buffer | Readable): Readable {
  if (typeof r === 'string') r = Buffer.from(r);
  return Readable.from(r);
}

async function getBuffer(buffer: string | Buffer | Readable): Promise<Buffer> {
  if (typeof buffer === 'string') return Buffer.from(buffer);
  if (Buffer.isBuffer(buffer)) return buffer;
  return await toBuffer(buffer);
}

export async function toBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const buf: Buffer[] = [];

    stream.on('data', (chunk: Buffer) => buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(buf)));
    stream.on('error', (err) => reject(`error converting stream - ${String(err)}`));
  });
}

export class FsMemory implements FileSystem {
  name = 'memory';
  files: Map<string, { buffer: Buffer; opts?: WriteOptions }> = new Map();

  read(loc: URL): Promise<Buffer> {
    const data = this.files.get(loc.href);
    if (data == null) throw new FsError(`Not found: ${loc.href}`, 404, loc, 'read', this);
    return Promise.resolve(data.buffer);
  }

  readStream(loc: URL): Readable {
    const buf = this.files.get(loc.href);
    if (buf == null) throw new FsError(`Not found: ${loc.href}`, 404, loc, 'readStream', this);
    return toReadable(buf.buffer);
  }

  async write(loc: URL, buffer: string | Buffer | Readable, opts?: WriteOptions): Promise<void> {
    this.files.set(loc.href, { opts: opts, buffer: await getBuffer(buffer) });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async *list(loc: URL, opt?: ListOptions): AsyncGenerator<URL> {
    const isRecursive = opt?.recursive === false;
    const folders = new Set();
    for (const file of this.files.keys()) {
      if (file.startsWith(loc.href)) {
        if (isRecursive) {
          const subPath = file.slice(loc.href.length);
          const parts = subPath.split('/');
          if (parts.length === 1) yield new URL(file);
          else {
            const folderName = parts[0];
            if (folders.has(folderName)) continue;
            folders.add(folderName);
            // If the folderName is empty then loc is also a folder
            // eg list "a" when "a/b/c.txt" exists
            if (folderName === '') {
              yield new URL(loc.href + '/');
            } else yield new URL(folderName + '/', loc);
          }
        } else {
          yield new URL(file);
        }
      }
    }
  }

  async *details(loc: URL, opt?: ListOptions): AsyncGenerator<FileInfo> {
    for await (const file of this.list(loc, opt)) {
      const data = await this.head(file);
      if (data == null) {
        const info = { url: file, isDirectory: true, $response: null };
        Object.defineProperty(info, '$response', { enumerable: false });
        yield info;
      } else {
        yield data;
      }
    }
  }

  async exists(loc: URL): Promise<boolean> {
    const dat = await this.head(loc);
    return dat != null;
  }

  head(loc: URL): Promise<FileInfo | null> {
    const obj = this.files.get(loc.href);
    if (obj == null) return Promise.resolve(null);
    const info = {
      url: loc,
      size: obj.buffer.length,
      metadata: obj.opts?.metadata,
      contentType: obj.opts?.contentType,
      contentEncoding: obj.opts?.contentEncoding,
      $response: null,
    };
    Object.defineProperty(info, '$response', { enumerable: false });
    return Promise.resolve(info);
  }

  delete(loc: URL): Promise<void> {
    this.files.delete(loc.href);
    return Promise.resolve();
  }

  source(loc: URL): SourceMemory {
    const obj = this.files.get(loc.href);
    if (obj == null) throw new FsError(`Not found: ${loc.href}`, 404, loc, 'source', this);
    const source = new SourceMemory(loc, obj.buffer);
    return source;
  }
}
