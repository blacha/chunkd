import { FileSystem } from './file.system.js';
import { Flag } from './flags.js';

export interface FileSystemProvider<T extends FileSystem = FileSystem> {
  /**
   * find a file system for a given prefix and permissions
   *
   * @param prefix location to search for
   * @param flag Permissions required (Read or ReadWrite)
   *
   * @returns File System with the required permission, null otherwise
   */
  find(prefix: URL, flag: Flag): Promise<T | null>;
}
