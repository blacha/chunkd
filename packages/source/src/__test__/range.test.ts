import assert from 'node:assert';
import { describe, it } from 'node:test';

import { ContentRange } from '../range.js';

describe('ContentRange', () => {
  it('should create a range request', () => {
    assert.equal(ContentRange.toRange(0, 1024), 'bytes=0-1023');
  });

  it('should parse size from range response', () => {
    assert.equal(ContentRange.parseSize('bytes 0-1024/46661'), 46661);
    assert.equal(ContentRange.parseSize('bytes */30'), 30);
  });

  it('should throw on badly formated ranges', () => {
    assert.throws(() => ContentRange.parseSize(''));
    assert.throws(() => ContentRange.parseSize('test 1234'));
    assert.throws(() => ContentRange.parseSize('bytes 0-1024/*'));
  });
});
