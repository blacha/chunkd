import { S3Client } from '@aws-sdk/client-s3';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { FileSystem, FileSystemProvider } from '@chunkd/fs';

import { FsAwsS3 } from './fs.s3.js';
import { AwsCredentialConfig, AwsCredentialProvider } from './types.js';

export function isPromise<T>(t: AwsCredentialProvider | Promise<T>): t is Promise<T> {
  return 'then' in t && typeof t['then'] === 'function';
}

/** Basic JSON validation of the configuration */
export function validateConfig(cfg: AwsCredentialProvider, loc: URL): AwsCredentialProvider {
  if (cfg == null) throw new Error('Unknown configuration from:' + loc.href);
  if (cfg.v !== 2) throw new Error('Configuration is not v2 from:' + loc.href);
  if (!Array.isArray(cfg.prefixes)) throw new Error('Configuration prefixes invalid from:' + loc.href);

  return cfg;
}

export class FsConfigFetcher {
  loc: URL;
  fs: FileSystem;

  _config?: Promise<AwsCredentialProvider>;

  constructor(loc: URL, fs: FileSystem) {
    this.loc = loc;
    this.fs = fs;
  }

  get config(): Promise<AwsCredentialProvider> {
    if (this._config != null) return this._config;
    this._config = this.fs
      .read(this.loc)
      .then((f) => JSON.parse(f.toString()) as AwsCredentialProvider)
      .then((cfg) => validateConfig(cfg, this.loc));

    return this._config;
  }

  async findCredentials(loc: URL): Promise<AwsCredentialConfig | null> {
    const href = loc.href;
    const cfg = await this.config;
    for (const credentials of cfg.prefixes) {
      if (href.startsWith(credentials.prefix)) return credentials;
    }
    return null;
  }
}

let PublicClient: S3Client | undefined;
/** Creating a public s3 client is somewhat hard, where the signing method needs to be overriden */
export function getPublicS3(): S3Client {
  if (PublicClient) return PublicClient;
  PublicClient = new S3Client({ signer: { sign: (req) => Promise.resolve(req) } });
  return PublicClient;
}

export type AwsCredentialProviderLoader = () => Promise<AwsCredentialProvider>;
export class AwsS3CredentialProvider implements FileSystemProvider<FsAwsS3> {
  /**
   * The default session duration if none is provided by the configuration
   * By default AWS uses 3600 seconds (1 hour)
   *
   * @default 3600 seconds
   */
  defaultSessionDuration: number | undefined;
  configs: (AwsCredentialConfig | FsConfigFetcher)[] = [];

  fileSystems: Map<string, FsAwsS3> = new Map();

  /** Given a config create a file system */
  createFileSystem(cs: AwsCredentialConfig): FsAwsS3 {
    // Public access
    if (cs.access === 'public') {
      const fs = new FsAwsS3(getPublicS3());
      fs.requestPayer = 'public';
      return fs;
    }

    // Requester pays off the current credentials
    if (cs.access === 'requesterPays' && cs.roleArn == null) {
      const fs = new FsAwsS3(new S3Client({}));
      if (cs.access === 'requesterPays') fs.requestPayer = 'requester';
      return fs;
    }

    // All other credentials need a role assumed
    if (cs.roleArn == null) throw new Error('No roleArn is defined for prefix: ' + cs.prefix);
    const client = new S3Client({
      credentials: fromTemporaryCredentials({
        params: {
          RoleArn: cs.roleArn,
          ExternalId: cs.externalId,
          RoleSessionName: this.createRoleSessionName(),
          DurationSeconds: cs.roleSessionDuration ?? this.defaultSessionDuration,
        },
      }),
    });

    const fs = new FsAwsS3(client);
    if (cs.access === 'requesterPays') fs.requestPayer = 'requester';
    return fs;
  }
  /** Version for session name generally v2 or v3 for aws-sdk versions */
  version = 'v3';

  /** Create a random new roleSessionName */
  createRoleSessionName(): string {
    return `fsa-${this.version}-${Date.now()}-${Math.random().toString(32).slice(2)}`;
  }

  /**
   * Optional callback when file systems are created
   *
   * @warning file systems are only created when a role is assumed,
   * if multiple locations use the same role this event will only fire on the first assumption
   */
  onFileSystemCreated?: (acc: AwsCredentialConfig, fs: FsAwsS3) => void;
  /**
   * Optional callback when file systems are requested,
   *
   * @param acc the configuration found
   * @param fs the file system found
   * @param path the URL that triggered the find
   */
  onFileSystemFound?: (acc: AwsCredentialConfig, fs?: FsAwsS3, path?: URL) => void;

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
   * @param loc location to configuration file
   *
   * @see {@link AwsCredentialProvider}
   *
   * @example
   * ```typescript
   * registerConfig('s3://foo/bar/config.json', fsa);
   * ```
   */
  registerConfig(loc: URL, fs: FsAwsS3): void {
    this.configs.push(new FsConfigFetcher(loc, fs));
  }

  /** Look up the credentials for a path */
  async findCredentials(loc: URL): Promise<AwsCredentialConfig | null> {
    const href = loc.href;
    for (const cfg of this.configs) {
      if ('findCredentials' in cfg) {
        const credentials = await cfg.findCredentials(loc);
        if (credentials) return credentials;
      } else if (href.startsWith(cfg.prefix)) {
        return cfg;
      }
    }
    return null;
  }

  async find(path: URL): Promise<FsAwsS3 | null> {
    const cs = await this.findCredentials(path);
    if (cs == null) return null;

    const cacheKey = `${cs.roleArn}__${cs.externalId}__${cs.roleSessionDuration}`;
    let existing = this.fileSystems.get(cacheKey);
    if (existing == null) {
      existing = this.createFileSystem(cs);
      this.fileSystems.set(cacheKey, existing);
      this.onFileSystemCreated?.(cs, existing);
    }
    this.onFileSystemFound?.(cs, existing, path);

    return existing;
  }
}
