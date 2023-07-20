export interface AwsCredentialConfig {
  /** Prefix type generally s3 */
  type: 's3';
  /** Prefix should always start with `s3://${bucket}` */
  prefix: string;
  /** Role to use to access */
  roleArn: string;
  /** Aws account this bucket belongs to */
  accountId?: string;
  /** Bucket name */
  bucket?: string;
  /** ExternalId if required */
  externalId?: string;
  /** Max role session duration */
  roleSessionDuration?: number;
  /** Can these credentials be used for "read" or "read-write" access */
  flags?: 'r' | 'rw';
}

export interface AwsCredentialProvider {
  /** List of file system prefixes for credentials */
  prefixes: AwsCredentialConfig[];
  /** Version */
  v: 2;
}
