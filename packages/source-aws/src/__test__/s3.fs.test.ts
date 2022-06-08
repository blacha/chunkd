import { FsAwsS3 } from '../s3.fs.js';
import o from 'ospec';
import S3 from 'aws-sdk/clients/s3.js';
import sinon from 'sinon';
import { parseUri } from '@chunkd/core';

/** Utility to convert async generators into arrays */
async function toArray<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const output: T[] = [];
  for await (const o of generator) output.push(o);
  return output;
}
o.spec('file.s3', () => {
  const sandbox = sinon.createSandbox();
  const s3 = new S3();
  const fs = new FsAwsS3(s3);

  o.afterEach(() => sandbox.restore());

  o.spec('parse', () => {
    o('should parse s3 uris', () => {
      o(parseUri('s3://bucket/key')).deepEquals({ bucket: 'bucket', key: 'key', protocol: 's3' });
      o(parseUri('s3://bucket/key/')).deepEquals({ bucket: 'bucket', key: 'key/', protocol: 's3' });
      o(parseUri('s3://bucket/key/is/deep.txt')).deepEquals({
        bucket: 'bucket',
        key: 'key/is/deep.txt',
        protocol: 's3',
      });
    });
    o('should parse bucket only uris', () => {
      o(parseUri('s3://bucket')).deepEquals({ bucket: 'bucket', protocol: 's3' });
      o(parseUri('s3://bucket/')).deepEquals({ bucket: 'bucket', protocol: 's3' });
    });
  });

  o.spec('exists', () => {
    o('should throw if max call count is reached', async () => {
      let callCount = 0;
      const stub = sandbox.stub(s3, 'listObjectsV2').returns({
        async promise() {
          return {
            Contents: [{ Key: 'File:' + callCount }],
            IsTruncated: true,
            NextContinuationToken: callCount++,
          };
        },
      } as any);
      try {
        await toArray(fs.list('s3://bucket'));
        o(true).equals(false)('Should error on invalid reads');
      } catch (e: any) {
        o(e.message).equals('Failed to list: "s3://bucket"');
        o(e.reason.message).equals('Failed to finish listing within 100 list attempts');
        o(stub.callCount).equals(100);
      }
    });
    o('should allow listing of bucket using multiple requests', async () => {
      let callCount = 0;
      const stub = sandbox.stub(s3, 'listObjectsV2').returns({
        async promise() {
          callCount++;
          if (callCount === 5) return { Contents: [{ Key: 'FirstFile:' + callCount }], IsTruncated: false };
          return {
            Contents: [{ Key: 'FirstFile:' + callCount }],
            IsTruncated: true,
            NextContinuationToken: callCount,
          };
        },
      } as any);

      const data = await toArray(fs.list('s3://bucket'));
      o(data).deepEquals([
        's3://bucket/FirstFile:1',
        's3://bucket/FirstFile:2',
        's3://bucket/FirstFile:3',
        's3://bucket/FirstFile:4',
        's3://bucket/FirstFile:5',
      ]);
      o(stub.callCount).equals(5);
      const [firstCall] = stub.args[0] as any;
      o(firstCall).deepEquals({
        Bucket: 'bucket',
        Prefix: undefined,
        ContinuationToken: undefined,
        Delimiter: undefined,
      });
      const [secondCall] = stub.args[1] as any;
      o(secondCall).deepEquals({ Bucket: 'bucket', Prefix: undefined, ContinuationToken: 1, Delimiter: undefined });
    });

    o('should allow listing of bucket', async () => {
      const stub = sandbox.stub(s3, 'listObjectsV2').returns({
        promise() {
          return { Contents: [{ Key: 'FirstFile' }], IsTruncated: false };
        },
      } as any);

      const data = await toArray(fs.list('s3://bucket'));
      o(data).deepEquals(['s3://bucket/FirstFile']);
      o(stub.callCount).equals(1);
      const [firstCall] = stub.args[0] as any;
      o(firstCall).deepEquals({
        Bucket: 'bucket',
        Prefix: undefined,
        ContinuationToken: undefined,
        Delimiter: undefined,
      });
    });

    o('should allow listing of bucket with prefix', async () => {
      const stub = sandbox.stub(s3, 'listObjectsV2').returns({
        promise() {
          return { Contents: [{ Key: 'keyFirstFile' }], IsTruncated: false };
        },
      } as any);

      const data = await toArray(fs.list('s3://bucket/key'));
      o(data).deepEquals(['s3://bucket/keyFirstFile']);
      o(stub.callCount).equals(1);
      const [firstCall] = stub.args[0] as any;
      o(firstCall).deepEquals({ Bucket: 'bucket', Prefix: 'key', ContinuationToken: undefined, Delimiter: undefined });
    });
  });

  o.spec('read', () => {
    o('should read a file', async () => {
      const getObjectStub = sandbox.stub(s3, 'getObject').returns({
        async promise() {
          return { Body: Buffer.from('Hello World') };
        },
      } as any);
      const data = await fs.read('s3://bucket/key');

      o(getObjectStub.callCount).equals(1);
      o(getObjectStub.args[0]).deepEquals([{ Bucket: 'bucket', Key: 'key' }] as any);
      o(data.toString()).equals('Hello World');
    });
    o('should error if no key was provided', async () => {
      try {
        await fs.read('s3://bucket');
        o(true).equals(false)('Should error on invalid reads');
      } catch (e: any) {
        o(e.message.includes('s3://bucket')).equals(true)('Should include s3://bucket');
      }
    });
  });
  o.spec('readStream', () => {
    o('should error if no key was provided', async () => {
      try {
        await fs.stream('s3://bucket');
        o(true).equals(false)('Should error on invalid reads');
      } catch (e: any) {
        o(e.message.includes('s3://bucket')).equals(true)('Should include s3://bucket');
      }
    });
  });

  o.spec('write', () => {
    o('should write a file', async () => {
      const stub = sandbox.stub(s3, 'upload').returns({
        async promise() {
          return '';
        },
      } as any);
      await fs.write('s3://bucket/key.txt', Buffer.from('Hello World'));
      o(stub.callCount).equals(1);
      o(stub.args[0][0].Bucket).deepEquals('bucket');
      o(stub.args[0][0].Key).deepEquals('key.txt');
      o(stub.args[0][0].Body?.toString()).deepEquals('Hello World');
    });

    o('should error if no key was provided', async () => {
      try {
        await fs.write('s3://bucket', Buffer.from('Hello World'));
        o(true).equals(false)('Should error on invalid writes');
      } catch (e: any) {
        o(e.message.includes('s3://bucket')).equals(true)('Should include s3://bucket');
      }
    });
  });

  o.spec('CompositeError', () => {
    o('bad statusCode', async () => {
      const stub = sandbox.stub(s3, 'getObject').returns({
        async promise() {
          throw {};
        },
      } as any);
      try {
        await fs.read('s3://test-bucket/foo.txt');
        o('Should have thrown error').equals('');
      } catch (err: any) {
        o(err.code).equals(500);
        o(stub.callCount).equals(1);
      }
    });

    o('statusCode', async () => {
      const stub = sandbox.stub(s3, 'getObject').returns({
        async promise() {
          throw { statusCode: 404 };
        },
      } as any);
      try {
        await fs.read('s3://test-bucket/foo.txt');
        o('Should have thrown error').equals('');
      } catch (err: any) {
        o(err.code).equals(404);
        o(err.reason.statusCode).equals(404);
        o(stub.callCount).equals(1);
      }
    });
  });
});
