import { FileSystem } from './fs.js';

export interface FileSystemProvider<T extends FileSystem = FileSystem> {
  /** find a file system for a given prefix  */
  find(prefix: string): Promise<T | null>;
}
