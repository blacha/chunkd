import { FileSystem, FileSystemProvider } from '@chunkd/core';
import { AwsCredentialConfig, AwsCredentialProvider } from './credentials.js';
import { FsAwsS3 } from './s3.fs.js';

export function isPromise<T>(t: AwsCredentialProvider | Promise<T>): t is Promise<T> {
  return 'then' in t && typeof t['then'] === 'function';
}

/** Basic JSON validation of the configuration */
export function validateConfig(cfg: AwsCredentialProvider, path: string): AwsCredentialProvider {
  if (cfg == null) throw new Error('Unknown configuration from:' + path);
  if (cfg.v !== 2) throw new Error('Configuration is not v2 from:' + path);
  if (!Array.isArray(cfg.prefixes)) throw new Error('Configuration prefixes invalid from:' + path);

  return cfg;
}

export class FsConfigFetcher {
  path: string;
  fs: FileSystem;

  constructor(path: string, fs: FileSystem) {
    this.path = path;
    this.fs = fs;
  }

  _config: Promise<AwsCredentialProvider> | null;
  get config(): Promise<AwsCredentialProvider> {
    if (this._config == null) {
      this._config = this.fs
        .read(this.path)
        .then((f) => JSON.parse(f.toString()))
        .then((cfg) => validateConfig(cfg, this.path));
    }
    return this._config;
  }

  async findCredentials(path: string): Promise<AwsCredentialConfig | null> {
    const cfg = await this.config;
    for (const credentials of cfg.prefixes) {
      if (path.startsWith(credentials.prefix)) return credentials;
    }
    return null;
  }
}

export type AwsCredentialProviderLoader = () => Promise<AwsCredentialProvider>;
export abstract class FsAwsS3ProviderBase implements FileSystemProvider<FsAwsS3> {
  configs: (AwsCredentialConfig | FsConfigFetcher)[] = [];

  fileSystems: Map<string, FsAwsS3> = new Map();

  /** Given a config create a file system */
  abstract createFileSystem(acc: AwsCredentialConfig): FsAwsS3;
  /** Version for session name generally v2 or v3 for aws-sdk versions */
  abstract version: 'v2' | 'v3' | string;

  /** Create a random new roleSessionName */
  createRoleSessionName(): string {
    return `fsa-${this.version}-${Date.now()}-${Math.random().toString(32).slice(2)}`;
  }

  /** Optional callback when file systems are created */
  onFileSystemCreated?: (acc: AwsCredentialConfig, fs: FileSystem) => void;

  /**
   * Register a credential configuration to be used
   * 
   * @param cfg Credential information
   *
   * @example
   * ```typescript

   * // Add a hard coded credential configuration
   * register({ prefix: 's3://foo/bar', roleArn: 'aws:iam::...:role/internal-user-read'})
   * ```
   */
  register(f: Omit<AwsCredentialConfig, 'type'>): void {
    this.configs.push({ ...f, type: 's3' });
  }

  /**
   * Load a credential configuration file from disk
   *
   * @param path location to configuration file
   *
   * @see AwsCredentialProvider
   *
   * @example
   * ```typescript
   * registerConfig('s3://foo/bar/config.json', fsa);
   * ```
   */
  registerConfig(path: string, fs: FileSystem): void {
    this.configs.push(new FsConfigFetcher(path, fs));
  }

  /** Look up the credentials for a path */
  async findCredentials(path: string): Promise<AwsCredentialConfig | null> {
    for (const cfg of this.configs) {
      if ('findCredentials' in cfg) {
        const credentials = await cfg.findCredentials(path);
        if (credentials) return credentials;
      } else if (path.startsWith(cfg.prefix)) {
        return cfg;
      }
    }
    return null;
  }

  async find(path: string): Promise<FsAwsS3 | null> {
    const cs = await this.findCredentials(path);
    if (cs == null) return null;

    const cacheKey = `${cs.roleArn}__${cs.externalId}__${cs.roleSessionDuration}`;
    let existing = this.fileSystems.get(cacheKey);
    if (existing == null) {
      existing = this.createFileSystem(cs);
      this.fileSystems.set(cacheKey, existing);
      this.onFileSystemCreated?.(cs, existing);
    }

    return existing;
  }
}
