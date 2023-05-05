import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SourceMemory } from '@chunkd/source-memory';
import { SourceFactory } from '../source.view.js';

describe('Sources', () => {
  it('should be passthrough with no middleware', async () => {
    const sources = new SourceFactory();
    const source = new SourceMemory(new URL('memory://test.json'), Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = sources.view(source);
    const firstByte = await view.fetch(0, 1);
    assert.equal(Buffer.from(firstByte)[0], '{'.charCodeAt(0));
  });
});
