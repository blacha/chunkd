import { Credentials } from 'aws-sdk/lib/credentials.js';
import aws from 'aws-sdk/lib/core.js';

export class AwsCredentials {
  static defaultRoleDuration = 3600;
  static cache: Map<string, Credentials> = new Map();

  static role(roleArn: string, externalId?: string, duration?: number): Credentials {
    duration = duration ?? AwsCredentials.defaultRoleDuration;

    const roleKey = `role::${roleArn}::${externalId}::${duration}`;
    let existing = AwsCredentials.cache.get(roleKey);
    if (existing == null) {
      existing = new aws.ChainableTemporaryCredentials({
        params: {
          RoleArn: roleArn,
          ExternalId: externalId,
          RoleSessionName: 'fsa-' + Math.random().toString(32) + '-' + Date.now(),
          DurationSeconds: duration,
        },
      });
      AwsCredentials.cache.set(roleKey, existing);
    }
    return existing;
  }
}
