import { FsAwsS3, FsAwsS3Provider } from '@chunkd/source-aws';
import { FileSystem } from '@chunkd/core';
import { AwsCredentials } from './s3.credentials.js';

export interface CredentialSource {
  /** Prefix type generally s3 */
  type: 's3';
  /** Prefix should always start with `s3://${bucket}` */
  prefix: string;
  /** Role to use to access */
  roleArn: string;
  /** Aws account this bucket belongs to */
  accountId: string;
  /** Bucket name */
  bucket: string;
  /** ExternalId if required */
  externalId?: string;
  /** Max role session duration */
  roleSessionDuration?: number;
  /** Can this be used for "read" or "read-write" access */
  flags?: 'r' | 'rw';
}

export interface CredentialSourceJson {
  prefixes: CredentialSource[];
  v: 2;
}

export class FsAwsS3ProviderV2 implements FsAwsS3Provider {
  path: string;
  fs: FileSystem;

  constructor(path: string, fs: FileSystem) {
    this.path = path;
    this.fs = fs;
  }

  onFileSystemCreated?: (ro: CredentialSource, fs: FileSystem) => void;

  _config: Promise<CredentialSourceJson> | null = null;
  get config(): Promise<CredentialSourceJson> {
    if (this._config == null) this._config = this.fs.read(this.path).then((buf) => JSON.parse(buf.toString()));
    return this._config;
  }

  /** Look up the credentials for a path */
  async findCredentials(path: string): Promise<CredentialSource | null> {
    if (this.path === path) return null;

    const cfg = await this.config;
    if (cfg == null) return null;
    if (cfg.v !== 2) throw new Error('Invalid bucket config version: ' + cfg.v + ' from: ' + this.path);
    if (cfg.prefixes == null || !Array.isArray(cfg.prefixes)) {
      throw new Error('Invalid bucket config missing "prefixes" from: ' + this.path);
    }
    for (const pref of cfg.prefixes) {
      if (path.startsWith(pref.prefix)) return pref;
    }
    return null;
  }

  async find(path: string): Promise<FsAwsS3 | null> {
    const cs = await this.findCredentials(path);
    if (cs == null) return null;
    const fs = AwsCredentials.fsFromRole(cs.roleArn, cs.externalId, cs.roleSessionDuration);
    if (this.onFileSystemCreated) this.onFileSystemCreated(cs, fs);
    return fs;
  }
}
