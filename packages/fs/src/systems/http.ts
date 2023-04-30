import type { Readable } from 'stream';
import { SourceHttp } from '@chunkd/source-http';
import { FileInfo, FileSystem } from '../file.system.js';

export class FsHttp implements FileSystem {
  name = 'http';

  source(filePath: URL): SourceHttp {
    return new SourceHttp(filePath);
  }

  async *list(filePath: URL): AsyncGenerator<URL> {
    throw new Error(`Unable to "list" on ${filePath}`);
  }
  async *details(filePath: URL): AsyncGenerator<FileInfo> {
    throw new Error(`Unable to "details" on ${filePath}`);
  }

  async head(filePath: URL): Promise<(FileInfo & { isDirectory: boolean }) | null> {
    const res = await SourceHttp.fetch(filePath, { method: 'HEAD' });
    if (!res.ok) throw Error(`Failed to head: ${filePath}`, { cause: new Error(res.statusText) });
    return { path: filePath, size: Number(res.headers.get('content-length')), isDirectory: false };
  }

  async read(filePath: URL): Promise<Buffer> {
    const res = await SourceHttp.fetch(filePath, { method: 'GET' });
    if (!res.ok) throw Error(`Failed to head: ${filePath}`, { cause: new Error(res.statusText) });
    return Buffer.from(await res.arrayBuffer());
  }

  async write(filePath: URL): Promise<void> {
    throw new Error(`Unable to "write" on ${filePath}`);
  }

  async delete(filePath: URL): Promise<void> {
    throw new Error(`Unable to "delete" on ${filePath}`);
  }

  stream(filePath: URL): Readable {
    throw new Error(`Unable to "stream" on ${filePath}`);
  }
}
