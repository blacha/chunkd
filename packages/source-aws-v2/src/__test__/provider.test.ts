import { AwsCredentialConfig } from '@chunkd/source-aws';
import o from 'ospec';
import { createSandbox } from 'sinon';
import { AwsCredentials } from '../credentials.js';
import { FsAwsS3V2 } from '../fs.js';
import { FsAwsS3ProviderV2 } from '../provider.js';

o.spec('FsAwsS3ProviderV2', () => {
  const sandbox = createSandbox();
  o.afterEach(() => {
    sandbox.restore();
  });
  o('should create file system', async () => {
    const provider = new FsAwsS3ProviderV2();

    const cfg: AwsCredentialConfig = {
      type: 's3',
      prefix: 's3://foo',
      roleArn: 'roleArn',
      externalId: 'externalId',
      roleSessionDuration: 30,
    };
    provider.configs = [cfg];

    const stub = sandbox.stub(AwsCredentials, 'fsFromRole').returns(new FsAwsS3V2());

    const credentials = await provider.find('s3://foo/bar');
    o(credentials).notEquals(null);
    o(stub.callCount).equals(1);
    o(stub.args[0]).deepEquals(['roleArn', 'externalId', 30]);
  });
});
