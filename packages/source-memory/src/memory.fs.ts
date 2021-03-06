import { CompositeError, FileInfo, FileSystem, ListOptions, SourceMemory } from '@chunkd/core';
import { Readable } from 'stream';

export function toReadable(r: string | Buffer | Readable): Readable {
  if (typeof r === 'string') r = Buffer.from(r);
  return Readable.from(r);
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

  files: Map<string, Buffer> = new Map();

  async read(filePath: string): Promise<Buffer> {
    const data = this.files.get(filePath);
    if (data == null) throw new CompositeError('Not found', 404, new Error());
    return data;
  }

  stream(filePath: string): Readable {
    const buf = this.files.get(filePath);
    if (buf == null) throw new CompositeError('Not found', 404, new Error());
    return toReadable(buf);
  }

  async write(filePath: string, buffer: string | Buffer | Readable): Promise<void> {
    if (typeof buffer === 'string') {
      this.files.set(filePath, Buffer.from(buffer));
      return;
    }
    if (Buffer.isBuffer(buffer)) {
      this.files.set(filePath, buffer);
      return;
    }
    const buf = await toBuffer(buffer);
    this.files.set(filePath, buf);
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
    const buf = this.files.get(filePath);
    if (buf == null) return null;
    return { path: filePath, size: buf.length };
  }

  source(filePath: string): SourceMemory {
    const bytes = this.files.get(filePath);
    if (bytes == null) throw new CompositeError('File not found', 404, new Error());
    const source = new SourceMemory(filePath, bytes);
    return source;
  }
}
