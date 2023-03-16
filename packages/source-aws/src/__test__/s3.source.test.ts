/* eslint-disable @typescript-eslint/no-non-null-assertion */
import o from 'ospec';
import { SourceAwsS3 } from '../index.js';
import { FakeRemote } from './fake.s3.js';

o.spec('SourceAwsS3', () => {
  const fakeRemote = new FakeRemote(Buffer.from([]));

  o('should round trip uri', () => {
    o(SourceAwsS3.fromUri('s3://foo/bar.tiff', fakeRemote)!.uri).equals('s3://foo/bar.tiff');
    o(SourceAwsS3.fromUri('s3://foo/bar/baz.tiff', fakeRemote)!.uri).equals('s3://foo/bar/baz.tiff');

    // No Key
    o(SourceAwsS3.fromUri('s3://foo', fakeRemote)).equals(null);

    // No Bucket
    o(SourceAwsS3.fromUri('s3:///foo', fakeRemote)).equals(null);

    // Not s3
    o(SourceAwsS3.fromUri('http://example.com/foo.tiff', fakeRemote)).equals(null);
  });

  o('should throw 409 if object changes during reads', async () => {
    const source = new SourceAwsS3('foo', 'bar.tiff', fakeRemote);
    source.chunkSize = 1024;

    await source.loadBytes(0, 1024);

    const etag = await source.etag;
    o(etag).equals('47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU');
    fakeRemote.etag = 'abc123';

    const ret = await source.loadBytes(1024, 1024).catch((f) => f);
    o(ret instanceof Error).equals(true);
    o(String(ret)).equals(
      'CompositeError: ETag conflict s3://foo/bar.tiff bytes=1024-2048 expected: 47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU got: abc123',
    );
  });
});
