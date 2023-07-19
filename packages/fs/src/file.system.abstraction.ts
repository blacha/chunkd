import { Source, SourceMiddleware, SourceView } from '@chunkd/source';
import type { Readable } from 'node:stream';
import { pathToFileURL } from 'node:url';
import { FileInfo, FileSystem, FileWriteTypes, ListOptions, WriteOptions } from './file.system.js';
import { Flag } from './flags.js';
import { FsFile } from './systems/file.js';

export class FileSystemAbstraction implements FileSystem {
  name = 'fsa';
  /**
   * Is the systems array currently ordered
   * @see FileSystemAbstraction.sortSystems
   */
  private isOrdered = true;
  systems: { prefix: string; system: FileSystem; flag: Flag }[] = [];

  /** List of middleware to use for every source created */
  middleware: SourceMiddleware[] = [];

  /**
   * Attempt to parse a path like object as into a URL
   * Falling back onto `pathToFileURL` if the URL parsing failes
   */
  toUrl(str: string): URL {
    try {
      return new URL(str);
    } catch (e) {
      return pathToFileURL(str);
    }
  }

  /**
   * Register a file system to a specific path which can then be used with any `fsa` command
   *
   * @example
   * fsa.register('s3://', fsS3, 'rw')
   * fsa.register('s3://bucket-a/key-a', specificS3, 'r')
   * fsa.register('http://', fsHttp)
   *
   */
  register(prefix: string, system: FileSystem, flag: Flag = 'rw'): void {
    for (let i = 0; i < this.systems.length; i++) {
      const sys = this.systems[i];
      if (sys.prefix === prefix && sys.flag === flag) {
        this.systems.splice(i, 1, { prefix, system, flag });
        return;
      }
    }
    this.systems.push({ prefix, system, flag });
    this.isOrdered = false;
  }

  /**
   * Read a file into memory
   *
   * @param loc file to read
   * @returns Content of the file
   */
  read(loc: URL): Promise<Buffer> {
    return this.get(loc, 'r').read(loc);
  }

  /**
   * Read a file as JSON
   * @param loc file to read
   * @returns JSON Content of the file
   */
  async readJson<T>(loc: URL): Promise<T> {
    const obj = await this.read(loc);
    return JSON.parse(obj.toString());
  }

  /**
   * Create a read stream for a file
   *
   * @param loc file to read
   * @returns Stream of file contents
   */
  readStream(loc: URL): Readable {
    return this.get(loc, 'r').readStream(loc);
  }

  /**
   * Write a file to a location
   *
   * If a object or array is passed in, it will be JSON.stringified
   *
   * @param loc file to write
   * @param buffer buffer or stream to write
   */
  write(loc: URL, buffer: FileWriteTypes, opts?: WriteOptions): Promise<void> {
    return this.get(loc, 'rw').write(loc, buffer, opts);
  }

  /**
   * Delete a file from a location
   *
   * @param loc file to delete
   */
  delete(loc: URL): Promise<void> {
    return this.get(loc, 'rw').delete(loc);
  }

  /**
   * List recursively all files starting with the loc
   * @param loc file path to search
   * @returns list of files inside that path
   */
  list(loc: URL, opts?: ListOptions): AsyncGenerator<URL> {
    return this.get(loc, 'r').list(loc, opts);
  }

  /**
   * List recursively all files starting with the loc with basic
   * file information such as size
   *
   * @param loc file path to search
   * @returns list of files inside that path
   */
  details(loc: URL, opts?: ListOptions): AsyncGenerator<FileInfo> {
    return this.get(loc, 'r').details(loc, opts);
  }

  /**
   * Does this object exist
   *
   * @param loc path to check
   * @returns true if file exists, false otherwise
   */
  exists(loc: URL): Promise<boolean> {
    return this.get(loc, 'r')
      .head(loc)
      .then((f) => f != null);
  }

  /**
   * Fetch basic information about the file
   *
   * @param loc path to check
   * @returns basic information such as file size
   */
  head(loc: URL): Promise<FileInfo | null> {
    return this.get(loc, 'r').head(loc);
  }

  /**
   * create a chunked reading source from the file path
   * @param loc File to read
   * @returns
   */
  source(loc: URL): Source {
    return new SourceView(this.get(loc, 'r').source(loc), this.middleware);
  }

  /**
   * Sort the file systems based on the length of the prefix
   * forcing more specific prefixes to be first and matched first
   */
  private sortSystems(): void {
    if (this.isOrdered) return;
    // TODO a priority order would also be nice to override this sorting.
    this.systems.sort((a, b) => b.prefix.length - a.prefix.length);
    this.isOrdered = true;
  }

  /** Find the filesystem that would be used for a given path */
  get(loc: URL, flag: Flag): FileSystem {
    if (loc.href == null) throw new Error(`Invalid URL: ${loc}`);
    this.sortSystems();
    const fileHref = loc.href;
    for (const cfg of this.systems) {
      if (fileHref.startsWith(cfg.prefix)) {
        // If we want to write to the system but only have read-only access
        if (flag === 'rw' && cfg.flag === 'r') continue;
        return cfg.system;
      }
    }

    throw new Error(`Unable to find file system for location: ${loc}`);
  }
}

export const fsa = new FileSystemAbstraction();

const fsFile = new FsFile();
fsa.register('file://', fsFile);
