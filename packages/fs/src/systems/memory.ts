import { Readable } from 'stream';
import { FileInfo, FileSystem, ListOptions, WriteOptions } from '../file.system.js';
import { SourceMemory } from '@chunkd/source-memory';
import { FsError } from '../error.js';

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

    stream.on('data', (chunk) => buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(buf)));
    stream.on('error', (err) => reject(`error converting stream - ${err}`));
  });
}

export class FsMemory implements FileSystem {
  name = 'memory';
  files: Map<string, { buffer: Buffer; opts?: WriteOptions }> = new Map();

  async read(loc: URL): Promise<Buffer> {
    const data = this.files.get(loc.href);
    if (data == null) throw new FsError(`Not found: ${loc}`, 404, loc, 'read', this);
    return data.buffer;
  }

  readStream(loc: URL): Readable {
    const buf = this.files.get(loc.href);
    if (buf == null) throw new FsError(`Not found: ${loc}`, 404, loc, 'readStream', this);
    return toReadable(buf.buffer);
  }

  async write(loc: URL, buffer: string | Buffer | Readable, opts?: WriteOptions): Promise<void> {
    this.files.set(loc.href, { opts: opts, buffer: await getBuffer(buffer) });
  }

  async *list(loc: URL, opt?: ListOptions): AsyncGenerator<URL> {
    const folders = new Set();
    for (const file of this.files.keys()) {
      if (file.startsWith(loc.href)) {
        if (opt?.recursive === false) {
          const subPath = file.slice(loc.href.length);
          const parts = subPath.split('/');
          if (parts.length === 1) yield new URL(file);
          else {
            const folderName = parts[0];
            if (folders.has(folderName)) continue;
            folders.add(folderName);
            yield new URL(folderName + '/', loc);
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
        yield { path: file, isDirectory: true };
      } else {
        yield data;
      }
    }
  }

  async exists(loc: URL): Promise<boolean> {
    const dat = await this.head(loc);
    return dat != null;
  }

  async head(loc: URL): Promise<FileInfo | null> {
    const obj = this.files.get(loc.href);
    if (obj == null) return null;
    return {
      path: loc,
      size: obj.buffer.length,
      metadata: obj.opts?.metadata,
      contentType: obj.opts?.contentType,
      contentEncoding: obj.opts?.contentEncoding,
    };
  }

  async delete(loc: URL): Promise<void> {
    this.files.delete(loc.href);
  }

  source(loc: URL): SourceMemory {
    const obj = this.files.get(loc.href);
    if (obj == null) throw new FsError(`Not found: ${loc}`, 404, loc, 'source', this);
    const source = new SourceMemory(loc, obj.buffer);
    return source;
  }
}
