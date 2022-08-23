import { FsAwsS3, FsAwsS3Provider } from '@chunkd/source-aws';
import { FileSystem } from '@chunkd/core';
import { AwsCredentials } from './s3.credentials.js';

export interface CredentialSource {
  /** Prefix type generally s3 */
  type: 's3';
  /** FileSystem prefix should always start with `s3://...` */
  prefix: string;
  /** Role to use to access */
  roleArn: string;
  /** ExternalId if required */
  externalId?: string;
  /** Max role session duration */
  roleSessionDuration?: number;
  /** Can this be used for "read" or "read-write" access */
  flags: 'r' | 'rw';
}

export interface CredentialSourceJson {
  prefixes: CredentialSource[];
  v: 2;
}

export class FsAwsS3ProviderV2 implements FsAwsS3Provider {
  /** Should the resulting file system be registered onto the top level file system */
  isRegisterable = true;
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

  async find(path: string): Promise<FsAwsS3 | null> {
    if (this.path === path) return null;

    const cfg = await this.config;
    if (cfg == null) return null;

    const ro = cfg.prefixes.find((f) => path.startsWith(f.prefix));

    if (ro == null) return null;
    const fs = AwsCredentials.fsFromRole(ro.roleArn, ro.externalId, ro.roleSessionDuration);
    if (this.onFileSystemCreated) this.onFileSystemCreated(ro, fs);
    return fs;
  }
}
