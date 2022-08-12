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
});
