import type { Readable } from 'node:stream';
import { PassThrough, Stream } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';

import { FetchLikeResponse, SourceHttp } from '@chunkd/source-http';

import { FsError } from '../error.js';
import { FileInfo, FileSystem } from '../file.system.js';

export class FsHttp implements FileSystem {
  name = 'http';

  source(loc: URL): SourceHttp {
    return new SourceHttp(loc);
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async *list(loc: URL): AsyncGenerator<URL> {
    throw new FsError(`NotImplemented to list: ${loc.href}`, 500, loc, 'list', this);
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async *details(loc: URL): AsyncGenerator<FileInfo> {
    throw new FsError(`NotImplemented to details: ${loc.href}`, 500, loc, 'list', this);
  }

  async head(loc: URL): Promise<FileInfo<FetchLikeResponse> | null> {
    try {
      const res = await SourceHttp.fetch(loc, { method: 'HEAD' });
      if (!res.ok) {
        throw new FsError(`Failed to head: ${loc.href}`, res.status, loc, 'read', this, new Error(res.statusText));
      }
      return { url: loc, size: Number(res.headers.get('content-length')), isDirectory: false, $response: res };
    } catch (e) {
      if (FsError.is(e) && e.system === this) throw e;
      throw new FsError(`Failed to head: ${loc.href}`, 500, loc, 'read', this, e);
    }
  }

  async read(loc: URL): Promise<Buffer> {
    try {
      const res = await SourceHttp.fetch(loc, { method: 'GET' });
      if (!res.ok) {
        throw new FsError(`Failed to read: ${loc.href}`, res.status, loc, 'read', this, new Error(res.statusText));
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (FsError.is(e) && e.system === this) throw e;
      throw new FsError(`Failed to read: ${loc.href}`, 500, loc, 'read', this, e);
    }
  }

  write(loc: URL): Promise<void> {
    throw new FsError(`NotImplemented to write: ${loc.href}`, 500, loc, 'list', this);
  }

  delete(loc: URL): Promise<void> {
    throw new FsError(`NotImplemented to delete: ${loc.href}`, 500, loc, 'list', this);
  }

  readStream(loc: URL): Readable {
    const pt = new PassThrough();
    SourceHttp.fetch(loc, { method: 'GET' })
      .then((res) => {
        if (!res.ok) {
          pt.emit(
            'error',
            new FsError(
              `Failed to readStream: ${loc.href}`,
              res.status,
              loc,
              'readStream',
              this,
              new Error(res.statusText),
            ),
          );
          return;
        }
        if (res.body == null) {
          pt.end();
          return;
        }

        const st = Stream.Readable.fromWeb(res.body as unknown as ReadableStream);
        st.pipe(pt);
      })
      .catch((e) => {
        pt.emit('error', new FsError(`Failed to readStream: ${loc.href}`, 500, loc, 'readStream', this, e));
      });
    return pt;
  }
}
