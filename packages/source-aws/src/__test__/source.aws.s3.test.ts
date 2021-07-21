/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'source-map-support/register';
import o from 'ospec';
import { SourceAwsS3, S3Like, S3LikeResponse } from '..';

export class FakeRemote implements S3Like {
  static id = 0;
  id = FakeRemote.id++;
  requests: { Bucket: string; Key: string; Range: string }[] = [];
  data: Buffer;
  constructor(data: Buffer) {
    this.data = data;
  }

  getObject(ctx: { Bucket: string; Key: string; Range: string }): S3LikeResponse<{ Body: Buffer }> {
    this.requests.push(ctx);
    return { promise: (): any => Promise.resolve({ Body: this.data.slice() }) };
  }

  headObject(ctx: {
    Bucket: string;
    Key: string;
    Range: string;
  }): S3LikeResponse<{ ContentLength?: number | undefined }> {
    this.requests.push(ctx);
    return { promise: (): any => Promise.resolve({ ContentLength: this.data.byteLength }) };
  }
}

o.spec('CogSourceAwsS3', () => {
  const fakeRemote = new FakeRemote(Buffer.from([]));

  o('should round trip uri', () => {
    o(SourceAwsS3.fromUri('s3://foo/bar.tiff', fakeRemote)!.name).equals('s3://foo/bar.tiff');
    o(SourceAwsS3.fromUri('s3://foo/bar/baz.tiff', fakeRemote)!.name).equals('s3://foo/bar/baz.tiff');

    // No Key
    o(SourceAwsS3.fromUri('s3://foo', fakeRemote)).equals(null);

    // No Bucket
    o(SourceAwsS3.fromUri('s3:///foo', fakeRemote)).equals(null);

    // Not s3
    o(SourceAwsS3.fromUri('http://example.com/foo.tiff', fakeRemote)).equals(null);
  });
});
