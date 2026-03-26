import fs from 'node:fs';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { SourceFile } from '@chunkd/source-file';

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
    // Attempted to write a file that already exists
    if (e.code === 'EEXIST') return 412;
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
      const baseDir = fileURLToPath(loc);
      for (const file of files) {
        if (prefix && !file.name.startsWith(prefix)) continue;
        const targetFile = pathToFileURL(path.join(baseDir, file.name));
        if (file.isDirectory()) {
          const targetDir = new URL(targetFile.href + '/');
          if (isRecursive) {
            yield* this.list(targetDir);
          } else {
            yield targetDir;
          }
        } else {
          yield targetFile;
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
      const info: FileInfo<fs.Stats> = {
        url: loc,
        size: stat.size,
        isDirectory: stat.isDirectory(),
        // Attempt to make a etag for local files
        eTag: stat.mtime.getTime() + '_' + stat.size,
        $response: stat,
      };
      Object.defineProperty(info, '$response', { enumerable: false });
      return info;
    } catch (e) {
      if (isRecord(e) && e.code === 'ENOENT') return null;
      throw new FsError(`Failed to stat ${loc.href}`, getCode(e), loc, 'head', this, e);
    }
  }

  async read(loc: URL): ReadResponse<fs.Stats> {
    try {
      const [ret, stat] = await Promise.all([fs.promises.readFile(loc), this.head(loc)]);
      return annotate.read<fs.Stats>(ret, stat as FileInfo<fs.Stats>);
    } catch (e) {
      throw new FsError(`Failed to read: ${loc.href}`, getCode(e), loc, 'read', this, e);
    }
  }

  // While not perfect it attempt to validate that the etag of a local file hasnt recently changed
  async assertETag(loc: URL, eTag?: string): Promise<void> {
    if (eTag == null) return;
    const obj = await this.head(loc);
    if (obj == null) return;
    if (obj.eTag === eTag) return;
    throw new FsError(`Conflict: ${loc.href}`, 412, loc, 'write', this);
  }

  async write(loc: URL, buf: Buffer | Readable | string, writeOpts?: Partial<WriteOptions>): Promise<void> {
    const flag = writeOpts?.ifNoneMatch ? 'wx' : undefined;
    try {
      if (Buffer.isBuffer(buf) || typeof buf === 'string') {
        await fs.promises.mkdir(new URL('.', loc), { recursive: true });
        await this.assertETag(loc, writeOpts?.ifMatch);
        await fs.promises.writeFile(loc, buf, { flag });
      } else {
        await new Promise((resolve, reject) => {
          buf.once('error', reject); // Has to be run before any awaits
          fs.promises
            .mkdir(new URL('.', loc), { recursive: true })
            .then(async () => {
              await this.assertETag(loc, writeOpts?.ifMatch);

              const st = fs.createWriteStream(loc, { flags: flag });
              st.on('finish', resolve);
              st.on('error', reject);
              buf.pipe(st);
            })
            .catch(reject);
        });
      }
    } catch (e) {
      if (FsError.is(e)) throw e; // assertETag will throw the conflict
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

  readStream(loc: URL): ReadStreamResponse {
    return annotate.readStream(fs.createReadStream(loc), { url: loc });
  }
}
