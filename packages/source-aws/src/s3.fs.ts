import { FileInfo, FileSystem, isRecord } from '@chunkd/core';
import S3 from 'aws-sdk/clients/s3.js';
import { Credentials } from 'aws-sdk/lib/credentials.js';
import { ChainableTemporaryCredentials } from 'aws-sdk/lib/credentials/chainable_temporary_credentials.js';
import { EC2MetadataCredentials } from 'aws-sdk/lib/credentials/ec2_metadata_credentials.js';
import { SharedIniFileCredentials } from 'aws-sdk/lib/credentials/shared_ini_file_credentials.js';
import type { Readable } from 'stream';
import { getCompositeError, SourceAwsS3 } from './s3.source.js';
import { ListRes, S3Like } from './type.js';

const Ec2 = Symbol();
const x: typeof Ec2 = Ec2;
console.log(x);

export class FsAwsS3 implements FileSystem<SourceAwsS3> {
  static protocol = 's3';
  protocol = FsAwsS3.protocol;
  /** Max list requests to run before erroring */
  static MaxListCount = 100;

  static Ec2Credentials = Ec2;

  static credentials: Map<string, Credentials> = new Map();
  /**
   * Create a aws credential instance from a role arn
   *
   * if the AWS profile is "FsAwsS3.Ec2Credentials" use EC2MetadataCredentials, otherwise load credentials from the shared ini file
   */
  static getCredentials(roleArn: string, profile?: string | typeof Ec2, externalId?: string): Credentials {
    const credKey = `${roleArn}::${roleArn}::${externalId}`;
    let credentials = FsAwsS3.credentials.get(credKey);
    if (credentials == null) {
      const masterCredentials =
        profile === Ec2 ? new EC2MetadataCredentials() : new SharedIniFileCredentials({ profile });
      credentials = new ChainableTemporaryCredentials({
        params: {
          RoleArn: roleArn,
          ExternalId: externalId,
          RoleSessionName: 'fsa-' + Math.random().toString(32) + '-' + Date.now(),
        },
        masterCredentials,
      });
      FsAwsS3.credentials.set(credKey, credentials);
    }
    return credentials;
  }

  /**
   * Create a FsS3 instance from a role arn
   *
   * if the AWS profile is "ec2" use EC2MetadataCredentials, otherwise load credentials from the shared ini file
   *
   * @example
   * Fs3.fromRoleArn('arn:foo', 'ec2');
   * FsS3.fromRoleArn('arn:bar', process.env.AWS_PROFILE);
   */
  static fromRoleArn(roleArn: string, profile?: string | typeof Ec2, externalId?: string): FsAwsS3 {
    const credentials = FsAwsS3.getCredentials(roleArn, profile, externalId);
    return new FsAwsS3(new S3({ credentials }));
  }

  /** AWS-SDK s3 to use */
  s3: S3Like;

  constructor(s3: S3Like) {
    this.s3 = s3;
  }
  source(filePath: string): SourceAwsS3 | null {
    return SourceAwsS3.fromUri(filePath, this.s3);
  }

  /** Is this file system a s3 file system */
  static is(fs: FileSystem): fs is FsAwsS3 {
    return fs.protocol === FsAwsS3.protocol;
  }

  /** Is this pat a s3 path */
  static isPath(path?: string): boolean {
    if (path == null) return false;
    return path.startsWith('s3://');
  }

  /** Parse a s3:// URI into the bucket and key components */
  static parse(uri: string): { bucket: string; key?: string } {
    if (!uri.startsWith('s3://')) throw new Error(`Unable to parse s3 uri: "${uri}"`);
    const parts = uri.split('/');
    const bucket = parts[2];
    if (bucket == null || bucket.trim() === '') {
      throw new Error(`Unable to parse s3 uri: "${uri}"`);
    }

    if (parts.length === 3) return { bucket };

    const key = parts.slice(3).join('/');
    if (key == null || key.trim() === '') {
      return { bucket };
    }
    return { key, bucket };
  }
  parse = FsAwsS3.parse;

  async *list(filePath: string): AsyncGenerator<string> {
    for await (const obj of this.details(filePath)) yield obj.path;
  }

  async *details(filePath: string): AsyncGenerator<FileInfo> {
    const opts = this.parse(filePath);
    let ContinuationToken: string | undefined = undefined;
    const Bucket = opts.bucket;
    const Prefix = opts.key;

    let count = 0;
    try {
      while (true) {
        count++;
        const res: ListRes = await this.s3.listObjectsV2({ Bucket, Prefix, ContinuationToken }).promise();

        // Failed to get any content abort
        if (res.Contents == null) break;

        for (const obj of res.Contents) {
          if (obj.Key == null) continue;
          yield { path: `s3://${Bucket}/${obj.Key}`, size: obj.Size };
        }

        // Nothing left to fetch
        if (!res.IsTruncated) break;

        // Abort if too many lists
        if (count >= FsAwsS3.MaxListCount) {
          throw new Error(`Failed to finish listing within ${FsAwsS3.MaxListCount} list attempts`);
        }
        ContinuationToken = res.NextContinuationToken;
      }
    } catch (e) {
      throw getCompositeError(e, `Failed to list: "${filePath}"`);
    }
  }

  async read(filePath: string): Promise<Buffer> {
    const opts = this.parse(filePath);
    if (opts.key == null) throw new Error(`Failed to read:  "${filePath}"`);

    try {
      const res = await this.s3.getObject({ Bucket: opts.bucket, Key: opts.key }).promise();
      return res.Body as Buffer;
    } catch (e) {
      throw getCompositeError(e, `Failed to read: "${filePath}"`);
    }
  }

  async write(filePath: string, buf: Buffer | Readable | string): Promise<void> {
    const opts = this.parse(filePath);
    if (opts.key == null) throw new Error(`Failed to write: "${filePath}"`);

    try {
      await this.s3.upload({ Bucket: opts.bucket, Key: opts.key, Body: buf }).promise();
    } catch (e) {
      throw getCompositeError(e, `Failed to write: "${filePath}"`);
    }
  }

  exists(filePath: string): Promise<boolean> {
    return this.head(filePath).then((f) => f != null);
  }

  stream(filePath: string): Readable {
    const opts = this.parse(filePath);
    if (opts.key == null) throw new Error(`S3: Unable to read "${filePath}"`);

    return this.s3.getObject({ Bucket: opts.bucket, Key: opts.key }).createReadStream();
  }

  async head(filePath: string): Promise<FileInfo | null> {
    const opts = this.parse(filePath);
    if (opts.key == null) throw new Error(`Failed to exists: "${filePath}"`);
    try {
      const res = await this.s3.headObject({ Bucket: opts.bucket, Key: opts.key }).promise();
      return { size: res.ContentLength, path: filePath };
    } catch (e) {
      if (isRecord(e) && e.code === 'NotFound') return null;
      throw getCompositeError(e, `Failed to exists: "${filePath}"`);
    }
  }
}
