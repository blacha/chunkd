import {
  ChunkSource,
  FileInfo,
  FileSystem,
  joinAllUri,
  joinUri,
  ListOptions,
  toArray,
  WriteOptions,
} from '@chunkd/core';
import type { Readable } from 'stream';
import { Flag } from './flags.js';

export type FileWriteTypes = Buffer | Readable | string | Record<string, unknown> | Array<unknown>;

function isRecord(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== 'object') return false;
  if (obj == null) return false;
  return obj.constructor === Object;
}

export class FileSystemAbstraction implements FileSystem {
  protocol = 'abstract';
  /**
   * Is the systems array currently ordered
   * @see FileSystemAbstraction.sortSystems
   */
  private isOrdered = true;
  systems: { path: string; system: FileSystem; flag: Flag }[] = [];

  /**
   * Register a file system to a specific path which can then be used with any `fsa` command
   *
   * @example
   * fsa.register('s3://', fsS3, 'rw')
   * fsa.register('s3://bucket-a/key-a', specificS3, 'r')
   * fsa.register('http://', fsHttp)
   *
   */
  register(path: string, system: FileSystem, flag: Flag = 'rw'): void {
    for (let i = 0; i < this.systems.length; i++) {
      const sys = this.systems[i];
      if (sys.path === path && sys.flag === flag) {
        this.systems.splice(i, 1, { path, system, flag });
        return;
      }
    }
    this.systems.push({ path, system, flag });
    this.isOrdered = false;
  }

  toArray = toArray;
  /**
   * Read a file into memory
   *
   * @param filePath file to read
   * @returns Content of the file
   */
  read(filePath: string): Promise<Buffer> {
    return this.get(filePath, 'r').read(filePath);
  }

  /**
   * Read a file as JSON
   * @param filePath file to read
   * @returns JSON Content of the file
   */
  async readJson<T>(filePath: string): Promise<T> {
    const obj = await this.read(filePath);
    return JSON.parse(obj.toString());
  }

  /**
   * Create a read stream for a file
   *
   * @param filePath file to read
   * @returns Stream of file contents
   */
  stream(filePath: string): Readable {
    return this.get(filePath, 'r').stream(filePath);
  }

  /**
   * Write a file to a location
   *
   * If a object or array is passed in, it will be JSON.stringified
   *
   * @param filePath file to write
   * @param buffer buffer or stream to write
   */
  write(filePath: string, buffer: FileWriteTypes, opts?: WriteOptions): Promise<void> {
    if (Array.isArray(buffer) || isRecord(buffer)) {
      const content = JSON.stringify(buffer, null, 2);
      return this.get(filePath, 'rw').write(filePath, content, { contentType: 'application/json', ...opts });
    }
    return this.get(filePath, 'rw').write(filePath, buffer, opts);
  }

  /**
   * Delete a file from a location
   *
   * @param filePath file to delete
   */
  delete(filePath: string): Promise<void> {
    return this.get(filePath, 'rw').delete(filePath);
  }

  /**
   * List recursively all files starting with the filePath
   * @param filePath file path to search
   * @returns list of files inside that path
   */
  list(filePath: string, opts?: ListOptions): AsyncGenerator<string> {
    return this.get(filePath, 'r').list(filePath, opts);
  }

  /**
   * List recursively all files starting with the filePath with basic
   * file information such as size
   *
   * @param filePath file path to search
   * @returns list of files inside that path
   */
  details(filePath: string, opts?: ListOptions): AsyncGenerator<FileInfo> {
    return this.get(filePath, 'r').details(filePath, opts);
  }

  /**
   * Does this object exist
   *
   * @param filePath path to check
   * @returns true if file exists, false otherwise
   */
  exists(filePath: string): Promise<boolean> {
    return this.get(filePath, 'r')
      .head(filePath)
      .then((f) => f != null);
  }

  /**
   * Fetch basic information about the file
   *
   * @param filePath path to check
   * @returns basic information such as file size
   */
  head(filePath: string): Promise<FileInfo | null> {
    return this.get(filePath, 'r').head(filePath);
  }

  join = joinUri;
  joinAll = joinAllUri;

  /**
   * create a chunked reading source from the file path
   * @param filePath File to read
   * @returns
   */
  source(filePath: string): ChunkSource {
    return this.get(filePath, 'r').source(filePath);
  }

  /**
   * Sort the file systems based on the length of the prefix
   * forcing more specific prefixes to be first and matched first
   */
  private sortSystems(): void {
    if (this.isOrdered) return;
    // TODO a priority order would also be nice to override this sorting.
    this.systems.sort((a, b) => b.path.length - a.path.length);
    this.isOrdered = true;
  }

  /** Find the filesystem that would be used for a given path */
  get(filePath: string, flag: Flag): FileSystem {
    this.sortSystems();
    for (const cfg of this.systems) {
      if (filePath.startsWith(cfg.path)) {
        // If we want to write to the system but only have read-only access
        if (flag === 'rw' && cfg.flag === 'r') continue;
        return cfg.system;
      }
    }

    throw new Error(`Unable to find file system for path:${filePath}`);
  }
}

export const fsa = new FileSystemAbstraction();
