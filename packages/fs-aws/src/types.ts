export interface AwsCredentialConfig {
  /**
   * Prefix type generally s3
   */
  type: 's3';

  /**
   * Location that these credentials are valid for,
   *
   * prefixes should always start with `s3://${bucket}/`
   *
   * @example
   * ```typescript
   * "s3://example/" // Matches all files in "s3://example/**"
   * "s3://example"  // Matches all files in all buckets starting with "s3://example*"
   * ```
   */
  prefix: string;

  /**
   * Role to use to access
   *
   * roleArn is not required if access is "public"
   */
  roleArn?: string;

  /**
   * Aws account this bucket belongs to
   */
  accountId?: string;

  /**
   * ExternalId if required
   */
  externalId?: string;

  /**
   * Max role session duration
   */
  roleSessionDuration?: number;

  /**
   * Can these credentials be used for "read" or "read-write" access
   */
  flags?: 'r' | 'rw';

  /**
   * Can this prefix be accessed without credentials or as requesterPays
   */
  access?: 'public' | 'requesterPays';
}

export interface AwsCredentialProvider {
  /** List of file system prefixes for credentials */
  prefixes: AwsCredentialConfig[];
  /** Version */
  v: 2;
}
