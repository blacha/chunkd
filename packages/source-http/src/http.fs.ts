import { CompositeError, FileInfo, FileSystem, isRecord } from '@chunkd/core';
import type { Readable } from 'node:stream';
import { SourceHttp } from './http.source.js';

export type FsError = { code: string } & Error;
function getCompositeError(e: unknown, msg: string): CompositeError {
  if (!isRecord(e)) return new CompositeError(msg, 500, e);
  if (e.code === 'ENOENT') return new CompositeError(msg, 404, e);
  if (e.code === 'EACCES') return new CompositeError(msg, 403, e);
  return new CompositeError(msg, 500, e);
}

export class FsHttp implements FileSystem<SourceHttp> {
  static protocol = 'http';
  protocol = FsHttp.protocol;

  static is(fs: FileSystem): fs is FsHttp {
    return fs.protocol === FsHttp.protocol;
  }

  source(filePath: string): SourceHttp {
    return new SourceHttp(filePath);
  }

  async *list(filePath: string): AsyncGenerator<string> {
    throw new Error(`Unable to "list" on ${filePath}`);
  }

  async *details(filePath: string): AsyncGenerator<FileInfo> {
    throw new Error(`Unable to "details" on ${filePath}`);
  }

  async head(filePath: string): Promise<(FileInfo & { isDirectory: boolean }) | null> {
    const res = await SourceHttp.fetch(filePath, { method: 'HEAD' });
    if (!res.ok) throw getCompositeError(new Error(res.statusText), `Failed to head: ${filePath}`);
    return { path: filePath, size: Number(res.headers.get('content-length')), isDirectory: false };
  }

  async read(filePath: string): Promise<Buffer> {
    const res = await SourceHttp.fetch(filePath, { method: 'GET' });
    if (!res.ok) throw getCompositeError(new Error(res.statusText), `Failed to head: ${filePath}`);
    return Buffer.from(await res.arrayBuffer());
  }

  exists(filePath: string): Promise<boolean> {
    return this.head(filePath).then((f) => f != null);
  }

  async write(filePath: string): Promise<void> {
    throw new Error(`Unable to "write" on ${filePath}`);
  }

  stream(filePath: string): Readable {
    throw new Error(`Unable to "stream" on ${filePath}`);

    // TODO
    // const res = await SourceHttp.fetch(filePath, { method: 'HEAD' });
    // if (!res.ok || res.body == null) throw getCompositeError(new Error(res.statusText), `Failed to head: ${filePath}`);

    // return res.body as unknown as Readable;
  }
}
