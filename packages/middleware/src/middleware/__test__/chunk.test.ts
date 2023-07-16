import { SourceMemory } from '@chunkd/source-memory';
import assert from 'node:assert';
import { afterEach, describe, it } from 'node:test';
import sinon from 'sinon';
import { SourceFactory } from '../../source.view.js';
import { SourceChunk } from '../chunk.js';

describe('SourceChunk', () => {
  const sandbox = sinon.createSandbox();
  afterEach(() => sandbox.restore());

  it('should chunk requests', async () => {
    const sf = new SourceFactory();
    const source = new SourceMemory(new URL('memory://test.json'), Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = sf.wrap(source);

    const spy = sandbox.spy(source, 'fetch');
    sf.use(new SourceChunk({ size: 16 }));

    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(spy.callCount, 1);
    assert.deepEqual(spy.lastCall.args, [0, 16]);

    assert.equal(Buffer.from(await view.fetch(2, 5)).toString(), 'hello');
    assert.deepEqual(spy.lastCall.args, [0, 16]);
  });

  it('should create multiple requests', async () => {
    const sf = new SourceFactory();
    const source = new SourceMemory(new URL('memory://test.json'), Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = sf.wrap(source);
    const spy = sandbox.spy(source, 'fetch');

    sf.use(new SourceChunk({ size: 4 }));

    assert.equal(Buffer.from(await view.fetch(0, 8)).toString(), '{"hello"');
    assert.equal(spy.callCount, 2);
    assert.deepEqual(spy.args[0], [0, 4]);
    assert.deepEqual(spy.args[1], [4, 4]);
  });
});
