import type { Readable } from 'stream';
import { PassThrough, Stream } from 'stream';
import { SourceHttp } from '@chunkd/source-http';
import { FileInfo, FileSystem } from '../file.system.js';
import { FsError } from '../error.js';

export class FsHttp implements FileSystem {
  name = 'http';

  source(loc: URL): SourceHttp {
    return new SourceHttp(loc);
  }

  async *list(loc: URL): AsyncGenerator<URL> {
    throw new FsError(`NotImplemented to list: ${loc}`, 500, loc, 'list', this);
  }
  async *details(loc: URL): AsyncGenerator<FileInfo> {
    throw new FsError(`NotImplemented to details: ${loc}`, 500, loc, 'list', this);
  }

  async head(loc: URL): Promise<(FileInfo & { isDirectory: boolean }) | null> {
    try {
      const res = await SourceHttp.fetch(loc, { method: 'HEAD' });
      if (!res.ok) {
        throw new FsError(`Failed to head: ${loc}`, res.status, loc, 'read', this, new Error(res.statusText));
      }
      return { url: loc, size: Number(res.headers.get('content-length')), isDirectory: false };
    } catch (e) {
      if (FsError.is(e) && e.system === this) throw e;
      throw new FsError(`Failed to head: ${loc}`, 500, loc, 'read', this, e);
    }
  }

  async read(loc: URL): Promise<Buffer> {
    try {
      const res = await SourceHttp.fetch(loc, { method: 'GET' });
      if (!res.ok) {
        throw new FsError(`Failed to read: ${loc}`, res.status, loc, 'read', this, new Error(res.statusText));
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (FsError.is(e) && e.system === this) throw e;
      throw new FsError(`Failed to read: ${loc}`, 500, loc, 'read', this, e);
    }
  }

  async write(loc: URL): Promise<void> {
    throw new FsError(`NotImplemented to write: ${loc}`, 500, loc, 'list', this);
  }

  async delete(loc: URL): Promise<void> {
    throw new FsError(`NotImplemented to delete: ${loc}`, 500, loc, 'list', this);
  }

  readStream(loc: URL): Readable {
    const pt = new PassThrough();
    SourceHttp.fetch(loc, { method: 'GET' })
      .then((res) => {
        if (!res.ok) {
          pt.emit(
            'error',
            new FsError(`Failed to readStream: ${loc}`, res.status, loc, 'readStream', this, new Error(res.statusText)),
          );
          return;
        }
        if (res.body == null) {
          pt.end();
          return;
        }

        const st = Stream.Readable.fromWeb(res.body as any);
        st.pipe(pt);
      })
      .catch((e) => {
        pt.emit('error', new FsError(`Failed to readStream: ${loc}`, 500, loc, 'readStream', this, e));
      });
    return pt;
  }
}
