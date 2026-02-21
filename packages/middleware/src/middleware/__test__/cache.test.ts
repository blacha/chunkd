import assert from 'node:assert';
import { describe, it } from 'node:test';

import { SourceView } from '@chunkd/source';
import { SourceMemory } from '@chunkd/source-memory';

import { SourceCache } from '../cache.js';

describe('SourceCache', () => {
  it('should cache requests', async (t) => {
    const source = new SourceMemory('memory://test.json', Buffer.from(JSON.stringify({ hello: 'world' })));

    const spy = t.mock.method(source, 'fetch');
    const cache = new SourceCache({ size: 1024 * 1024 });
    const view = new SourceView(source, [cache]);

    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(spy.mock.callCount(), 1);
    assert.deepEqual(spy.mock.calls[0].arguments, [0, 1, undefined]);

    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');

    assert.equal(spy.mock.callCount(), 1);
    assert.equal(cache.cacheA.size, 1);
    const cacheEntry = [...cache.cacheA.entries()][0];
    assert.equal(cacheEntry[0].startsWith('memory://'), true);
    assert.equal(cacheEntry[1].hits, 4);
    assert.equal(cacheEntry[1].size, 1);
    assert.equal(cacheEntry[1].saves, 0);
  });

  it('should limit cache to specific protocols', async () => {
    const cache = new SourceCache({ size: 1, protocols: ['memory-b:'] });
    const source = new SourceMemory('memory://test.json', Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = new SourceView(source, [cache]);
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(cache.size, 0);

    const sourceB = new SourceMemory('memory-b://test.json', Buffer.from(JSON.stringify({ hello: 'world' })));
    const viewB = new SourceView(sourceB, [cache]);
    assert.equal(Buffer.from(await viewB.fetch(0, 1)).toString(), '{');
    assert.equal(Buffer.from(await viewB.fetch(0, 1)).toString(), '{');
    assert.equal(cache.size, 1);
  });

  it('should empty cache when it fills', async (t) => {
    const source = new SourceMemory('memory://test.json', Buffer.from(JSON.stringify({ hello: 'world' })));

    const spy = t.mock.method(source, 'fetch');
    const cache = new SourceCache({ size: 1 });
    const view = new SourceView(source, [cache]);

    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');

    assert.equal(cache.size, 1);
    assert.equal(spy.mock.callCount(), 1);
    assert.deepEqual(spy.mock.calls[0].arguments, [0, 1, undefined]);

    assert.equal(Buffer.from(await view.fetch(2, 1)).toString(), 'h');
    assert.equal(Buffer.from(await view.fetch(2, 1)).toString(), 'h');
    assert.equal(spy.mock.callCount(), 2);

    assert.equal(cache.size, 1);
    assert.equal(cache.cacheA.size, 1);
    assert.equal(cache.cacheB.size, 1);
    assert.equal(cache.resets, 1);

    // Should drop 0:1 from the cache
    assert.equal(Buffer.from(await view.fetch(3, 1)).toString(), 'e');
    assert.equal(Buffer.from(await view.fetch(3, 1)).toString(), 'e');
    assert.equal(spy.mock.callCount(), 3);

    assert.equal(cache.resets, 2);
    // 0:1 is out of cache now
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(spy.mock.callCount(), 4);
  });
});
