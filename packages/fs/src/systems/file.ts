import { SourceFile } from '@chunkd/source-file';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { FileInfo, FileSystem, ListOptions } from '../file.system.js';
export function isRecord<T = unknown>(value: unknown): value is Record<string, T> {
  return typeof value === 'object' && value !== null;
}

export class FsFile implements FileSystem {
  name = 'file';

  source(filePath: URL): SourceFile {
    return new SourceFile(filePath);
  }

  async *list(filePath: URL, opts?: ListOptions): AsyncGenerator<URL> {
    try {
      const files = await fs.promises.readdir(filePath, { withFileTypes: true });
      for (const file of files) {
        const targetPath = new URL(file.name, filePath);
        if (file.isDirectory() && opts?.recursive !== false) yield* this.list(new URL(targetPath + '/'));
        else yield targetPath;
      }
    } catch (e) {
      throw new Error(`Failed to list: ${filePath}`, { cause: e });
    }
  }

  async *details(filePath: URL, opts?: ListOptions): AsyncGenerator<FileInfo & { isDirectory: boolean }> {
    for await (const file of this.list(filePath, opts)) {
      const res = await this.head(file);
      if (res == null) continue;
      yield res;
    }
  }

  async head(filePath: URL): Promise<(FileInfo & { isDirectory: boolean }) | null> {
    try {
      const stat = await fs.promises.stat(filePath);
      return { path: filePath, size: stat.size, isDirectory: stat.isDirectory() };
    } catch (e) {
      if (isRecord(e) && e.code === 'ENOENT') return null;
      throw new Error(`Failed to stat: ${filePath}`, { cause: e });
    }
  }

  async read(filePath: URL): Promise<Buffer> {
    try {
      return await fs.promises.readFile(filePath);
    } catch (e) {
      throw new Error(`Failed to read: ${filePath}`, { cause: e });
    }
  }

  async write(filePath: URL, buf: Buffer | Readable | string): Promise<void> {
    try {
      if (Buffer.isBuffer(buf) || typeof buf === 'string') {
        await fs.promises.mkdir(path.dirname(filePath.pathname), { recursive: true });
        await fs.promises.writeFile(filePath, buf);
      } else {
        await new Promise(async (resolve, reject) => {
          buf.once('error', reject); // Has to be run before any awaits
          await fs.promises.mkdir(path.dirname(filePath.pathname), { recursive: true });
          const st = fs.createWriteStream(filePath);
          st.on('finish', resolve);
          st.on('error', reject);
          buf.pipe(st);
        });
      }
    } catch (e) {
      throw new Error(`Failed to write: ${filePath}`, { cause: e });
    }
  }

  async delete(filePath: URL): Promise<void> {
    try {
      return await fs.promises.unlink(filePath);
    } catch (e) {
      throw new Error(`Failed to read: ${filePath}`, { cause: e });
    }
  }

  readStream(filePath: URL): fs.ReadStream {
    return fs.createReadStream(filePath);
  }
}
