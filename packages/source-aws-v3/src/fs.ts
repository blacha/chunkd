import { S3Client } from '@aws-sdk/client-s3';
import { FsAwsS3 as FsAwsS3Base } from '@chunkd/source-aws';
import { FsAwsS3ProviderV3 } from './provider.js';
import { S3LikeV3 } from './s3.v3.js';

export class FsAwsS3V3 extends FsAwsS3Base {
  client: S3Client;
  credentials: FsAwsS3ProviderV3;
  constructor(client: S3Client = new S3Client({})) {
    super(new S3LikeV3(client));
    this.client = client;
    this.credentials = new FsAwsS3ProviderV3();
  }
}
