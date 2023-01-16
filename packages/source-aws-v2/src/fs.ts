import { FsAwsS3 as FsAwsS3Base } from '@chunkd/source-aws';
import S3 from 'aws-sdk/clients/s3.js';
import { FsAwsS3ProviderV2 } from './provider.js';

export class FsAwsS3V2 extends FsAwsS3Base {
  credentials: FsAwsS3ProviderV2;
  constructor(client: S3 = new S3({})) {
    super(client);
    this.credentials = new FsAwsS3ProviderV2();
  }
}
