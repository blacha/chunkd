import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import { SourceMemory } from '@chunkd/source-memory';
import sinon from 'sinon';
import { SourceFactory } from '../../source.view.js';
import { SourceAbsolute } from '../absolute.js';
import { Source } from '@chunkd/source';

describe('SourceAbsolute', () => {
  const sandbox = sinon.createSandbox();
  afterEach(() => sandbox.restore());

  it('should convert negative length to absolute offsets', async () => {
    const sf = new SourceFactory();
    const source = new SourceMemory(new URL('memory://test.json'), Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = sf.view(source);

    const spy = sandbox.spy(source, 'fetch');

    const firstRequest = await view.fetch(-1);
    assert.equal(Buffer.from(firstRequest)[0], '}'.charCodeAt(0));
    assert.equal(spy.callCount, 1);
    assert.deepEqual(spy.lastCall.args, [-1, undefined]);

    sf.use(SourceAbsolute);

    const secondRequest = await view.fetch(-1);
    assert.equal(Buffer.from(secondRequest)[0], '}'.charCodeAt(0));
    assert.equal(spy.callCount, 2);
    assert.deepEqual(spy.lastCall.args, [16, 1]);
  });

  it('should not convert negative length if size is invalid', async () => {
    const sf = new SourceFactory();
    const source = new SourceMemory(new URL('memory://test.json'), Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = sf.view(source);
    sf.use(SourceAbsolute);

    const spy = sandbox.spy(source, 'fetch');

    // Metadata size is negative
    source.metadata.size = -1;
    assert.equal(Buffer.from(await view.fetch(-1))[0], '}'.charCodeAt(0));
    assert.equal(spy.callCount, 1);
    assert.deepEqual(spy.lastCall.args, [-1, undefined]);

    // Metadata is null
    delete (source as Source).metadata;
    assert.equal(Buffer.from(await view.fetch(-1))[0], '}'.charCodeAt(0));
    assert.equal(spy.callCount, 2);
    assert.deepEqual(spy.lastCall.args, [-1, undefined]);
  });
});
