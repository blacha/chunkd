import { Credentials } from 'aws-sdk/lib/credentials.js';
import aws from 'aws-sdk/lib/core.js';

export class AwsCredentials {
  static DefaultRoleDurationSeconds = 3600;
  static cache: Map<string, Credentials> = new Map();

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
