import fs from 'node:fs';
import { Readable } from 'node:stream';

import { SourceFile } from '@chunkd/source-file';

import { FsError } from '../error.js';
import { FileInfo, FileSystem, ListOptions } from '../file.system.js';
export function isRecord<T = unknown>(value: unknown): value is Record<string, T> {
  return typeof value === 'object' && value !== null;
}
/**
 * Attempt to parse a node file error into a HTTP status code
 *
 * @param e nodejs file system error
 * @returns 500 if unable to map the error code
 */
function getCode(e: unknown): number {
  if (typeof e !== 'object') return 500;
  if (e == null) return 500;
  if ('code' in e) {
    if (e.code === 'ENAMETOOLONG') return 404;
    if (e.code === 'ENOTDIR') return 404;
    if (e.code === 'ENOENT') return 404;
    if (e.code === 'EACCES') return 403;
  }

  return 500;
}

export class FsFile implements FileSystem {
  name = 'file';

  source(loc: URL): SourceFile {
    return new SourceFile(loc);
  }

  async *list(loc: URL, opts?: ListOptions): AsyncGenerator<URL> {
    const isRecursive = opts?.recursive !== false;
    let prefix: string | undefined;
    try {
      // Check if the listing location is a folder before trying to list
      const stat = await fs.promises.stat(loc).catch(() => null);

      // Trying to list a folder but doesn't exist
      if (stat == null && loc.href.endsWith('/')) {
        throw new FsError(`Failed to list: ${loc.href}`, 404, loc, 'list', this);
      }

      // Prefix search, list the parent folder and filter for the filename
      if (stat == null || !stat.isDirectory() || !loc.href.endsWith('/')) {
        // Not a folder so grab the folder name
        const baseUrl = new URL('.', loc);
        const baseStat = await this.head(baseUrl);
        // Parent folder doesn't exist
        if (baseStat == null || !baseStat.isDirectory) return;
        // Filter files to ensure they start with the prefix
        prefix = loc.href.slice(baseUrl.href.length);
        loc = baseUrl;
      }

      const files = await fs.promises.readdir(loc, { withFileTypes: true });
      for (const file of files) {
        if (prefix && !file.name.startsWith(prefix)) continue;
        if (file.isDirectory()) {
          if (isRecursive) {
            yield* this.list(new URL(file.name + '/', loc));
          } else {
            yield new URL(file.name + '/', loc);
          }
        } else {
          yield new URL(file.name, loc);
        }
      }
    } catch (e) {
      if (FsError.is(e)) throw e;
      throw new FsError(`Failed to list: ${loc.href}`, getCode(e), loc, 'list', this, e);
    }
  }

  async *details(loc: URL, opts?: ListOptions): AsyncGenerator<FileInfo<fs.Stats>> {
    for await (const file of this.list(loc, opts)) {
      const res = await this.head(file);
      if (res == null) continue;
      yield res;
    }
  }

  async head(loc: URL): Promise<FileInfo<fs.Stats> | null> {
    try {
      const stat = await fs.promises.stat(loc);
      const info = { url: loc, size: stat.size, isDirectory: stat.isDirectory(), $response: stat };
      Object.defineProperty(info, '$response', { enumerable: false });
      return info;
    } catch (e) {
      if (isRecord(e) && e.code === 'ENOENT') return null;
      throw new FsError(`Failed to stat ${loc.href}`, getCode(e), loc, 'head', this, e);
    }
  }

  async read(loc: URL): Promise<Buffer> {
    try {
      return await fs.promises.readFile(loc);
    } catch (e) {
      throw new FsError(`Failed to read: ${loc.href}`, getCode(e), loc, 'read', this, e);
    }
  }

  async write(loc: URL, buf: Buffer | Readable | string): Promise<void> {
    try {
      if (Buffer.isBuffer(buf) || typeof buf === 'string') {
        await fs.promises.mkdir(new URL('.', loc), { recursive: true });
        await fs.promises.writeFile(loc, buf);
      } else {
        await new Promise((resolve, reject) => {
          buf.once('error', reject); // Has to be run before any awaits
          fs.promises
            .mkdir(new URL('.', loc), { recursive: true })
            .then(() => {
              const st = fs.createWriteStream(loc);
              st.on('finish', resolve);
              st.on('error', reject);
              buf.pipe(st);
            })
            .catch(reject);
        });
      }
    } catch (e) {
      throw new FsError(`Failed to write: ${loc.href}`, getCode(e), loc, 'write', this, e);
    }
  }

  async delete(loc: URL): Promise<void> {
    try {
      return await fs.promises.unlink(loc);
    } catch (e) {
      // Ignore 404 errors on deletion
      const code = getCode(e);
      if (code === 404) return;

      throw new FsError(`Failed to delete: ${loc.href}`, getCode(e), loc, 'delete', this, e);
    }
  }

  readStream(loc: URL): fs.ReadStream {
    return fs.createReadStream(loc);
  }
}
