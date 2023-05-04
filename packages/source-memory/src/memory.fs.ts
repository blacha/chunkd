import { CompositeError, FileInfo, FileSystem, ListOptions, SourceMemory, WriteOptions } from '@chunkd/core';
import { Readable } from 'stream';

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

export class FsMemory implements FileSystem<SourceMemory> {
  protocol = 'memory';

  files: Map<string, { buffer: Buffer; opts?: WriteOptions }> = new Map();

  async read(filePath: string): Promise<Buffer> {
    const data = this.files.get(filePath);
    if (data == null) throw new CompositeError('Not found', 404, new Error());
    return data.buffer;
  }

  stream(filePath: string): Readable {
    const buf = this.files.get(filePath);
    if (buf == null) throw new CompositeError('Not found', 404, new Error());
    return toReadable(buf.buffer);
  }

  async write(filePath: string, buffer: string | Buffer | Readable, opts?: WriteOptions): Promise<void> {
    this.files.set(filePath, { opts: opts, buffer: await getBuffer(buffer) });
  }

  async *list(filePath: string, opt?: ListOptions): AsyncGenerator<string> {
    const folders = new Set();
    for (const file of this.files.keys()) {
      if (file.startsWith(filePath)) {
        if (opt?.recursive === false) {
          const subPath = file.slice(filePath.length);
          const parts = subPath.split('/');
          if (parts.length === 1) yield file;
          else {
            const folderName = parts[0];
            if (folders.has(folderName)) continue;
            folders.add(folderName);
            yield filePath + folderName + '/';
          }
        } else {
          yield file;
        }
      }
    }
  }

  async *details(filePath: string, opt?: ListOptions): AsyncGenerator<FileInfo> {
    for await (const file of this.list(filePath, opt)) {
      const data = await this.head(file);
      if (data == null) {
        yield { path: file, isDirectory: true };
      } else {
        yield data;
      }
    }
  }

  async exists(filePath: string): Promise<boolean> {
    const dat = await this.head(filePath);
    return dat != null;
  }

  async head(filePath: string): Promise<FileInfo | null> {
    const obj = this.files.get(filePath);
    if (obj == null) return null;
    return {
      path: filePath,
      size: obj.buffer.length,
      metadata: obj.opts?.metadata,
      contentType: obj.opts?.contentType,
      contentEncoding: obj.opts?.contentEncoding,
    };
  }

  async delete(filePath: string): Promise<void> {
    this.files.delete(filePath);
  }

  source(filePath: string): SourceMemory {
    const obj = this.files.get(filePath);
    if (obj == null) throw new CompositeError('File not found', 404, new Error());
    const source = new SourceMemory(filePath, obj.buffer);
    return source;
  }
}
