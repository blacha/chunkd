import { Credentials } from 'aws-sdk/lib/credentials.js';
import aws from 'aws-sdk/lib/core.js';
import S3 from 'aws-sdk/clients/s3.js';
import { FsAwsS3 } from '@chunkd/source-aws';

export interface RoleConfig {
  roleArn: string;
  externalId?: string;
  durationSeconds?: number;
}

export class AwsCredentials {
  static DefaultRoleDurationSeconds = 3600;
  static cache: Map<string, Credentials> = new Map();

  /**
   * Create a FsS3 instance from a role arn
   *
   * @example
   *```typescript
   * AwsCredentials.fromRoleArn('arn:foo', externalId, 900);
   * AwsCredentials.fromRoleArn('arn:bar');
   * AwsCredentials.fromRoleArn({ roleArn: 'arn:foo', externalId: 'bar', 'durationSeconds': 10})
   * ```
   */
  static fsFromRole(roleArn: RoleConfig): FsAwsS3;
  static fsFromRole(roleArn: string, externalId?: string, durationSeconds?: number): FsAwsS3;
  static fsFromRole(roleArn: string | RoleConfig, externalId?: string, durationSeconds?: number): FsAwsS3 {
    if (typeof roleArn === 'object') {
      return AwsCredentials.fsFromRole(roleArn.roleArn, roleArn.externalId, roleArn.durationSeconds);
    }
    const credentials = AwsCredentials.role(roleArn, externalId, durationSeconds);
    return new FsAwsS3(new S3({ credentials }));
  }

  /**
   * Create temporary credentials for a AWS Role
   * @param roleArn Role to assume
   * @param externalId Role ExternalId if it exists
   * @param durationSeconds Number of seconds to assume the role for default 3_600
   * @returns Credentials to use
   */
  static role(roleArn: string, externalId?: string, durationSeconds?: number): Credentials {
    durationSeconds = durationSeconds ?? AwsCredentials.DefaultRoleDurationSeconds;

    const roleKey = `role::${roleArn}::${externalId}::${durationSeconds}`;
    let existing = AwsCredentials.cache.get(roleKey);
    if (existing == null) {
      existing = new aws.ChainableTemporaryCredentials({
        params: {
          RoleArn: roleArn,
          ExternalId: externalId,
          RoleSessionName: 'fsa-' + Math.random().toString(32) + '-' + Date.now(),
          DurationSeconds: durationSeconds,
        },
      });
      AwsCredentials.cache.set(roleKey, existing);
    }
    return existing;
  }
}
