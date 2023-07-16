import { SourceMemory } from '@chunkd/source-memory';
import assert from 'node:assert';
import { afterEach, describe, it } from 'node:test';
import sinon from 'sinon';
import { SourceFactory } from '../../source.view.js';
import { SourceCache } from '../cache.js';

describe('SourceCache', () => {
  const sandbox = sinon.createSandbox();
  afterEach(() => sandbox.restore());

  it('should cache requests', async () => {
    const sf = new SourceFactory();
    const source = new SourceMemory(new URL('memory://test.json'), Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = sf.view(source);

    const spy = sandbox.spy(source, 'fetch');
    const cache = new SourceCache({ size: 1024 * 1024 });
    sf.use(cache);

    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(spy.callCount, 1);
    assert.deepEqual(spy.lastCall.args, [0, 1]);

    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');

    assert.equal(spy.callCount, 1);
    assert.equal(cache.cacheA.size, 1);
    const cacheEntry = [...cache.cacheA.entries()][0];
    assert.equal(cacheEntry[0].startsWith('memory://'), true);
    assert.equal(cacheEntry[1].hits, 4);
    assert.equal(cacheEntry[1].size, 1);
    assert.equal(cacheEntry[1].saves, 0);
  });

  it('should empty cache when it fills', async () => {
    const sf = new SourceFactory();
    const source = new SourceMemory(new URL('memory://test.json'), Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = sf.view(source);

    const spy = sandbox.spy(source, 'fetch');
    const cache = new SourceCache({ size: 1 });
    sf.use(cache);

    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');

    assert.equal(cache.size, 1);
    assert.equal(spy.callCount, 1);
    assert.deepEqual(spy.lastCall.args, [0, 1]);

    assert.equal(Buffer.from(await view.fetch(2, 1)).toString(), 'h');
    assert.equal(Buffer.from(await view.fetch(2, 1)).toString(), 'h');
    assert.equal(spy.callCount, 2);

    assert.equal(cache.size, 1);
    assert.equal(cache.cacheA.size, 1);
    assert.equal(cache.cacheB.size, 1);
    assert.equal(cache.resets, 1);

    // Should drop 0:1 from the cache
    assert.equal(Buffer.from(await view.fetch(3, 1)).toString(), 'e');
    assert.equal(Buffer.from(await view.fetch(3, 1)).toString(), 'e');
    assert.equal(spy.callCount, 3);

    assert.equal(cache.resets, 2);
    // 0:1 is out of cache now
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(spy.callCount, 4);
  });
});
