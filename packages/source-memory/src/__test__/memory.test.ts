import assert from 'node:assert';
import { describe, it } from 'node:test';

import { SourceMemory } from '../index.js';

describe('SourceMemory', () => {
  const chars = 'abc123';
  it('should read from Buffer', async () => {
    const source = new SourceMemory(new URL('memory://test.txt'), Buffer.from(chars));
    const bytes = await source.fetch(0, 1);
    assert.equal(Buffer.from(bytes)[0], 'a'.charCodeAt(0));

    const bytesAll = await source.fetch(0);
    assert.equal(Buffer.from(bytesAll).toString(), 'abc123');

    const bytesNegative = await source.fetch(-2);
    assert.equal(Buffer.from(bytesNegative).toString(), '23');
  });

  it('should read from Uint8Array', async () => {
    const array = new Uint8Array(chars.split('').map((c) => c.charCodeAt(0)));
    const source = new SourceMemory(new URL('memory://test.txt'), array);
    const bytes = await source.fetch(0, 1);
    assert.equal(bytes.byteLength, 1);
    assert.equal(Buffer.from(bytes)[0], 'a'.charCodeAt(0));

    const bytesAll = await source.fetch(0);
    assert.equal(Buffer.from(bytesAll).toString(), 'abc123');

    const bytesNegative = await source.fetch(-2);
    assert.equal(Buffer.from(bytesNegative).toString(), '23');
  });

  it('should allow string names', () => {
    const array = new Uint8Array(chars.split('').map((c) => c.charCodeAt(0)));

    const source = new SourceMemory('memory://test.txt', array);
    assert.equal(source.url.href, 'memory://test.txt');

    const sourceRel = new SourceMemory('test.txt', array);
    assert.equal(sourceRel.url.href, 'memory://test.txt');
  });
});
