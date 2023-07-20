import { SourceMemory } from '@chunkd/source-memory';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { SourceChunk } from '../chunk.js';
import { SourceView } from '@chunkd/source';

describe('SourceChunk', () => {
  it('should chunk requests', async (t) => {
    const source = new SourceMemory(new URL('memory://test.json'), Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = new SourceView(source, [new SourceChunk({ size: 16 })]);
    const spy = t.mock.method(source, 'fetch');

    assert.equal(Buffer.from(await view.fetch(0, 1)).toString(), '{');
    assert.equal(spy.mock.callCount(), 1);
    assert.deepEqual(spy.mock.calls[0].arguments, [0, 16]);

    assert.equal(Buffer.from(await view.fetch(2, 5)).toString(), 'hello');
    assert.equal(spy.mock.callCount(), 2);
    assert.deepEqual(spy.mock.calls[1].arguments, [0, 16]);
  });

  it('should create multiple requests', async (t) => {
    const source = new SourceMemory(new URL('memory://test.json'), Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = new SourceView(source, [new SourceChunk({ size: 4 })]);
    const spy = t.mock.method(source, 'fetch');

    assert.equal(Buffer.from(await view.fetch(0, 8)).toString(), '{"hello"');
    assert.equal(spy.mock.callCount(), 2);
    assert.deepEqual(spy.mock.calls[0].arguments, [0, 4]);
    assert.deepEqual(spy.mock.calls[1].arguments, [4, 4]);
  });
});
