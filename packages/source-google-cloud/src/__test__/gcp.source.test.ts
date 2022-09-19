import o from 'ospec';
import { SourceGoogleStorage } from '../gcp.source.js';
import { Storage } from '@google-cloud/storage';

o.spec('SourceGoogleStorage', () => {
  const fakeRemote = new Storage();

  o('should round trip uri', () => {
    o(SourceGoogleStorage.fromUri('gs://foo/bar.tiff', fakeRemote)?.uri).equals('gs://foo/bar.tiff');
    o(SourceGoogleStorage.fromUri('gs://foo/bar/baz.tiff', fakeRemote)?.uri).equals('gs://foo/bar/baz.tiff');

    // No Key
    o(SourceGoogleStorage.fromUri('gs://foo', fakeRemote)).equals(null);

    // No Bucket
    o(SourceGoogleStorage.fromUri('gs:///foo', fakeRemote)).equals(null);

    // Not s3
    o(SourceGoogleStorage.fromUri('http://example.com/foo.tiff', fakeRemote)).equals(null);
  });
});
