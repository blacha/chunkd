import assert from 'node:assert';
import { describe, it } from 'node:test';

import { AwsS3CredentialProvider, getPublicS3 } from '../credentials.js';
import { AwsCredentialConfig } from '../types.js';

describe('AwsS3CredentialProvider', () => {
  const baseConfig: AwsCredentialConfig = { type: 's3', prefix: 's3://' };
  it('should set requester pays', () => {
    const creds = new AwsS3CredentialProvider();

    const fs = creds.createFileSystem({ ...baseConfig, access: 'public' });
    assert.ok(fs.s3 === getPublicS3());
    assert.ok(fs.requestPayer === 'public');
  });

  it('should support requester pays', () => {
    const creds = new AwsS3CredentialProvider();

    const fs = creds.createFileSystem({ ...baseConfig, roleArn: 'arn:...', access: 'requesterPays' });
    assert.ok(fs.s3 !== getPublicS3());
    assert.ok(fs.requestPayer === 'requester');
  });

  it('should support requester pays from the current role', () => {
    const creds = new AwsS3CredentialProvider();

    const fs = creds.createFileSystem({ ...baseConfig, roleArn: undefined, access: 'requesterPays' });
    assert.ok(fs.s3 !== getPublicS3());
    assert.ok(fs.requestPayer === 'requester');
  });

  it('should require a roleArn', () => {
    const creds = new AwsS3CredentialProvider();
    assert.throws(() => creds.createFileSystem({ ...baseConfig }));
  });
});
