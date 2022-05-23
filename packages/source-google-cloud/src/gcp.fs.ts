import { FileInfo, FileSystem, isRecord, parseUri, WriteOptions } from '@chunkd/core';
import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';
import { SourceGoogleStorage } from './gcp.source.js';
import { getCompositeError, toReadable } from './stream.js';

function join(filePathA: string, filePathB: string): string {
  return filePathA.replace(/\/$/, '') + '/' + filePathB.replace(/^\//, '');
}

export class FsGoogleStorage implements FileSystem<SourceGoogleStorage> {
  static protocol = 'gs';
  protocol = FsGoogleStorage.protocol;
  /** Max list requests to run before erroring */
  static MaxListCount = 100;

  /** Google storage client to use */
  storage: Storage;

  constructor(storage: Storage = new Storage()) {
    this.storage = storage;
  }

  source(filePath: string): SourceGoogleStorage {
    const ret = SourceGoogleStorage.fromUri(filePath, this.storage);
    if (ret == null) throw new Error('GoogleStorage: Failed to create for path: ${filePath}');
    return ret;
  }

  /** Is this file system a gs file system */
  static is(fs: FileSystem): fs is FsGoogleStorage {
    return fs.protocol === FsGoogleStorage.protocol;
  }

  /** Is this pat a gs path */
  static isPath(path?: string): boolean {
    if (path == null) return false;
    return path.startsWith('gs://');
  }

  /** Parse a gs:// URI into the bucket and key components */
  static parse = parseUri;
  parse = parseUri;

  async *list(filePath: string): AsyncGenerator<string> {
    for await (const obj of this.details(filePath)) yield obj.path;
  }

  async *details(filePath: string): AsyncGenerator<FileInfo> {
    const opts = this.parse(filePath);
    if (opts == null) throw new Error(`GoogleStorage: Failed to list: "${filePath}"`);

    const bucket = this.storage.bucket(opts.bucket);
    const [files, , metadata] = await bucket.getFiles({ prefix: opts.key, autoPaginate: false, delimiter: '/' });
    if (files != null && files.length > 0) {
      for (const file of files) {
        yield { path: join(`gs://${opts.bucket}`, file.name), size: Number(file.metadata.size) };
      }
    }

    // Recurse down
    if (metadata != null && metadata.prefixes != null) {
      for (const prefix of metadata.prefixes) yield* this.details(join(`gs://${opts.bucket}`, prefix));
    }
  }

  async read(filePath: string): Promise<Buffer> {
    const opts = parseUri(filePath);
    if (opts == null || opts.key == null) throw new Error(`GoogleStorage: Failed to read: "${filePath}"`);

    try {
      const fileData = this.storage.bucket(opts.bucket).file(opts.key);
      const res = await fileData.download();
      return res[0] as Buffer;
    } catch (e) {
      throw getCompositeError(e, `Failed to read: "${filePath}"`);
    }
  }

  async write(filePath: string, buf: Buffer | Readable | string, ctx?: WriteOptions): Promise<void> {
    const opts = parseUri(filePath);
    if (opts == null || opts.key == null) throw new Error(`GoogleStorage: Failed to write: "${filePath}"`);

    const file = this.storage.bucket(opts.bucket).file(opts.key);

    try {
      const writeStream = file.createWriteStream({ contentType: ctx?.contentType });
      const readable = toReadable(buf);
      await new Promise((resolve, reject) => {
        readable.pipe(writeStream).on('error', reject).on('finish', resolve);
      });
    } catch (e) {
      throw getCompositeError(e, `Failed to write: "${filePath}"`);
    }
  }

  exists(filePath: string): Promise<boolean> {
    return this.head(filePath).then((f) => f != null);
  }

  stream(filePath: string): Readable {
    const opts = parseUri(filePath);
    if (opts == null || opts.key == null) throw new Error(`GoogleStorage: Unable to read "${filePath}"`);
    return this.storage.bucket(opts.bucket).file(opts.key).createReadStream();
  }

  async head(filePath: string): Promise<FileInfo | null> {
    const opts = parseUri(filePath);
    if (opts == null || opts.key == null) throw new Error(`GoogleStorage: Failed to head: "${filePath}"`);
    try {
      const file = this.storage.bucket(opts.bucket).file(opts.key);
      const res = await file.getMetadata();
      return { size: res[0].size, path: filePath };
    } catch (e) {
      if (isRecord(e) && e.code === 'NotFound') return null;
      throw getCompositeError(e, `Failed to head: "${filePath}"`);
    }
  }
}
