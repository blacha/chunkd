import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { CompositeError, FileInfo, FileSystem, isRecord } from '@chunkd/core';
import { SourceFile } from './file.source.js';

export type FsError = { code: string } & Error;
function getCompositeError(e: unknown, msg: string): CompositeError {
  if (!isRecord(e)) return new CompositeError(msg, 500, e);
  if (e.code === 'ENOENT') return new CompositeError(msg, 404, e);
  if (e.code === 'EACCES') return new CompositeError(msg, 403, e);
  return new CompositeError(msg, 500, e);
}

export class FsFile implements FileSystem<SourceFile> {
  static protocol = 'file';
  protocol = FsFile.protocol;

  static is(fs: FileSystem): fs is FsFile {
    return fs.protocol === FsFile.protocol;
  }

  source(filePath: string): SourceFile | null {
    return new SourceFile(filePath);
  }

  async *list(filePath: string): AsyncGenerator<string> {
    try {
      const files = await fs.promises.readdir(filePath, { withFileTypes: true });
      const resolve = path.resolve(filePath);
      for (const file of files) {
        const targetPath = path.join(resolve, file.name);
        if (file.isDirectory()) yield* this.list(targetPath);
        else yield targetPath;
      }
    } catch (e) {
      throw getCompositeError(e, `Failed to list: ${filePath}`);
    }
  }

  async *details(filePath: string): AsyncGenerator<FileInfo> {
    for await (const file of this.list(filePath)) {
      const res = await this.head(file);
      if (res == null) continue;
      yield res;
    }
  }

  async head(filePath: string): Promise<(FileInfo & { isDirectory: boolean }) | null> {
    try {
      const stat = await fs.promises.stat(filePath);
      return { path: filePath, size: stat.size, isDirectory: stat.isDirectory() };
    } catch (e) {
      if (isRecord(e) && e.code === 'ENOENT') return null;
      throw getCompositeError(e, `Failed to stat: ${filePath}`);
    }
  }

  async read(filePath: string): Promise<Buffer> {
    try {
      return await fs.promises.readFile(filePath);
    } catch (e) {
      throw getCompositeError(e, `Failed to read: ${filePath}`);
    }
  }

  exists(filePath: string): Promise<boolean> {
    return this.head(filePath).then((f) => f != null);
  }

  async write(filePath: string, buf: Buffer | Readable | string): Promise<void> {
    const folderPath = path.dirname(filePath);
    await fs.promises.mkdir(folderPath, { recursive: true });
    try {
      if (Buffer.isBuffer(buf) || typeof buf === 'string') {
        await fs.promises.writeFile(filePath, buf);
      } else {
        const st = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
          st.on('finish', resolve);
          st.on('error', reject);
          buf.pipe(st);
        });
      }
    } catch (e) {
      throw getCompositeError(e, `Failed to write: ${filePath}`);
    }
  }

  stream(filePath: string): fs.ReadStream {
    return fs.createReadStream(filePath);
  }
}
