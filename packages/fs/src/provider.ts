import { FileSystem } from './file.system.js';

export interface FileSystemProvider<T extends FileSystem = FileSystem> {
  /** find a file system for a given prefix  */
  find(prefix: URL): Promise<T | null>;
}
