import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SourceMemory } from '@chunkd/source-memory';
import { SourceFactory, SourceView } from '../source.view.js';

describe('Sources', () => {
  it('should be passthrough with no middleware', async () => {
    const sources = new SourceFactory();
    const source = new SourceMemory(new URL('memory://test.json'), Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = sources.wrap(source);
    const firstByte = await view.fetch(0, 1);
    assert.equal(Buffer.from(firstByte)[0], '{'.charCodeAt(0));
  });

  it('should wrap sources', () => {
    const sources = new SourceFactory();
    const mem = new SourceMemory(new URL('memory://test.json'), Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = sources.wrap(mem);
    assert.equal(SourceView.is(view), true);
    assert.equal(SourceView.is(mem), false);
  });
});
