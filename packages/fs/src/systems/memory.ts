import { Readable } from 'stream';

import { SourceMemory } from '@chunkd/source-memory';

import { FsError } from '../error.js';
import type {
  FileInfo,
  FileSystem,
  ListOptions,
  ReadResponse,
  ReadStreamResponse,
  WriteOptions,
} from '../file.system.js';
import { annotate } from '../file.system.js';

export function toReadable(r: string | Buffer | Readable): ReadStreamResponse {
  if (typeof r === 'string') r = Buffer.from(r);
  return Readable.from(r) as ReadStreamResponse;
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

function parseMetadata(loc: URL, cache: FsMemoryCache): FileInfo<null> {
  const obj = {
    ...cache.opts,
    url: loc,
    size: cache.buffer.length,
    $response: null,
  };
  Object.defineProperty(obj, '$response', { enumerable: false });

  return obj;
}

interface FsMemoryCache {
  buffer: Buffer;
  opts?: WriteOptions;
  eTag: string;
}
export class FsMemory implements FileSystem {
  name = 'memory';
  files: Map<string, FsMemoryCache> = new Map();

  read(loc: URL): ReadResponse {
    const cache = this.files.get(loc.href);
    if (cache == null) throw new FsError(`Not found: ${loc.href}`, 404, loc, 'read', this);
    const newBuf = cache.buffer.subarray();
    annotate.read(newBuf, parseMetadata(loc, cache));

    return Promise.resolve(newBuf) as ReadResponse;
  }

  readStream(loc: URL): ReadStreamResponse {
    const cache = this.files.get(loc.href);
    if (cache == null) throw new FsError(`Not found: ${loc.href}`, 404, loc, 'readStream', this);
    return annotate.readStream(toReadable(cache.buffer), { ...cache.opts, eTag: cache.eTag, url: loc });
  }

  async write(loc: URL, buffer: string | Buffer | Readable, opts?: WriteOptions): Promise<void> {
    if (opts?.ifNoneMatch) {
      if (this.files.has(loc.href)) throw new FsError(`Exists: ${loc.href}`, 412, loc, 'write', this);
    }

    if (opts?.ifMatch) {
      const file = this.files.get(loc.href);
      if (file != null && opts.ifMatch !== file.eTag) {
        throw new FsError(`Conflict: ${loc.href} `, 412, loc, 'write', this);
      }
    }
    const outBuffer = await getBuffer(buffer);
    this.files.set(loc.href, {
      opts: opts,
      buffer: outBuffer,
      eTag: Math.random().toString(32).slice(2) + '.' + outBuffer.byteLength,
    });
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
    const cache = this.files.get(loc.href);
    if (cache == null) return Promise.resolve(null);
    return Promise.resolve(parseMetadata(loc, cache));
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
