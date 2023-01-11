import { AwsCredentialConfig, FsAwsS3, FsAwsS3ProviderBase } from '@chunkd/source-aws';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { S3Client } from '@aws-sdk/client-s3';
import { S3LikeV3 } from './s3.v3.js';

export class FsAwsS3ProviderV3 extends FsAwsS3ProviderBase {
  /**
   *The default session duration if none is provided on the configuration
   * By default AWS uses 3600 seconds (1 hour)
   */
  defaultSessionDuration: number | undefined;
  /** Aws SDK Version  */
  version = 'v3';

  createFileSystem(cs: AwsCredentialConfig): FsAwsS3 {
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

    const s3Like = new S3LikeV3(client);
    return new FsAwsS3(s3Like);
  }
}
