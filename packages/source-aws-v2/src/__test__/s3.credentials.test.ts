import o from 'ospec';
import Sinon from 'sinon';
import aws from 'aws-sdk/lib/core.js';
import { AwsCredentials } from '../s3.credentials.js';

o.spec('AwsCredentials', () => {
  const sandbox = Sinon.createSandbox();

  o.beforeEach(() => sandbox.restore());
  o('should default to 3600 second duration', () => {
    const stub = sandbox.stub(aws, 'ChainableTemporaryCredentials');
    AwsCredentials.role('foo');
    o(stub.args[0][0].params.DurationSeconds).equals(3600);
    AwsCredentials.role('foo', undefined, 3600);
    o(stub.calledOnce).equals(true);

    AwsCredentials.role('foo', undefined, 3601);
    o(stub.callCount).equals(2);
    o(stub.args[1][0].params.DurationSeconds).equals(3601);
  });

  o('should create a role from a object', () => {
    const stub = sandbox.stub(aws, 'ChainableTemporaryCredentials');

    AwsCredentials.fsFromRole({ roleArn: 'arn:abc', externalId: 'abc', durationSeconds: 50 });
    o(stub.calledOnce).equals(true);

    o(stub.args[0][0].params.RoleArn).equals('arn:abc');
    o(stub.args[0][0].params.ExternalId).equals('abc');
    o(stub.args[0][0].params.DurationSeconds).equals(50);

    AwsCredentials.fsFromRole({ roleArn: 'arn:foo' });
    o(stub.calledTwice).equals(true);

    o(stub.args[1][0].params.RoleArn).equals('arn:foo');
    o(stub.args[1][0].params.ExternalId).equals(undefined);
    o(stub.args[1][0].params.DurationSeconds).equals(3600);
  });

  o('should cache by roleArn', () => {
    const stub = sandbox.stub(aws, 'ChainableTemporaryCredentials');
    AwsCredentials.role('arn:foo:bar');
    AwsCredentials.role('arn:foo:bar');
    o(stub.calledOnce).equals(true);
    AwsCredentials.role('arn:foo:baz');
    o(stub.callCount).equals(2);
    AwsCredentials.role('arn:foo:baz', 'external');
    o(stub.callCount).equals(3);
  });
});
