import assert from 'node:assert';
import { describe, it } from 'node:test';
import { SourceAwsS3 } from '../index.js';

describe('SourceAwsS3', () => {
  it('should create s3 links from string url', () => {
    assert.equal(new SourceAwsS3('s3://foo/bar.txt').url.href, 's3://foo/bar.txt');
  });
});
