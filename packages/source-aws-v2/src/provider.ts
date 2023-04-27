import { AwsCredentialConfig, FsAwsS3, FsAwsS3ProviderBase } from '@chunkd/source-aws';
import { AwsCredentials } from './credentials.js';

export class FsAwsS3ProviderV2 extends FsAwsS3ProviderBase {
  version = 'v2';

  createFileSystem(cs: AwsCredentialConfig): FsAwsS3 {
    return AwsCredentials.fsFromRole(cs.roleArn, cs.externalId, cs.roleSessionDuration);
  }
}
