// import { CompositeError, FileInfo, FileSystem, ListOptions, SourceMemory, WriteOptions } from '@chunkd/core';
import { Readable } from 'stream';
import { FileInfo, FileSystem, ListOptions, WriteOptions } from '../file.system.js';
import { SourceMemory } from '@chunkd/source-memory';

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

  async read(filePath: URL): Promise<Buffer> {
    const data = this.files.get(filePath.href);
    if (data == null) throw new Error('Not found', { cause: new Error() });
    return data.buffer;
  }

  readStream(filePath: URL): Readable {
    const buf = this.files.get(filePath.href);
    if (buf == null) throw new Error('Not found', { cause: new Error() });
    return toReadable(buf.buffer);
  }

  async write(filePath: URL, buffer: string | Buffer | Readable, opts?: WriteOptions): Promise<void> {
    this.files.set(filePath.href, { opts: opts, buffer: await getBuffer(buffer) });
  }

  async *list(filePath: URL, opt?: ListOptions): AsyncGenerator<URL> {
    const folders = new Set();
    for (const file of this.files.keys()) {
      if (file.startsWith(filePath.href)) {
        if (opt?.recursive === false) {
          const subPath = file.slice(filePath.href.length);
          const parts = subPath.split('/');
          if (parts.length === 1) yield new URL(file);
          else {
            const folderName = parts[0];
            if (folders.has(folderName)) continue;
            folders.add(folderName);
            yield new URL(folderName + '/', filePath);
          }
        } else {
          yield new URL(file);
        }
      }
    }
  }

  async *details(filePath: URL, opt?: ListOptions): AsyncGenerator<FileInfo> {
    for await (const file of this.list(filePath, opt)) {
      const data = await this.head(file);
      if (data == null) {
        yield { path: file, isDirectory: true };
      } else {
        yield data;
      }
    }
  }

  async exists(filePath: URL): Promise<boolean> {
    const dat = await this.head(filePath);
    return dat != null;
  }

  async head(filePath: URL): Promise<FileInfo | null> {
    const obj = this.files.get(filePath.href);
    if (obj == null) return null;
    return {
      path: filePath,
      size: obj.buffer.length,
      metadata: obj.opts?.metadata,
      contentType: obj.opts?.contentType,
      contentEncoding: obj.opts?.contentEncoding,
    };
  }

  async delete(filePath: URL): Promise<void> {
    this.files.delete(filePath.href);
  }

  source(filePath: URL): SourceMemory {
    const obj = this.files.get(filePath.href);
    if (obj == null) throw new Error('File not found');
    const source = new SourceMemory(filePath, obj.buffer);
    return source;
  }
}
