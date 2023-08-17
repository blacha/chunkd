import { SourceView } from '@chunkd/source';
import { SourceMemory } from '@chunkd/source-memory';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { SourceChunk } from '../chunk.js';

describe('SourceChunk', () => {
  it('should chunk requests', async (t) => {
    const source = new SourceMemory('memory://test.json', Buffer.from(JSON.stringify({ hello: 'world' })));
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
    const source = new SourceMemory('memory://test.json', Buffer.from(JSON.stringify({ hello: 'world' })));
    const view = new SourceView(source, [new SourceChunk({ size: 4 })]);
    const spy = t.mock.method(source, 'fetch');

    assert.equal(Buffer.from(await view.fetch(0, 8)).toString(), '{"hello"');
    assert.equal(spy.mock.callCount(), 2);
    assert.deepEqual(spy.mock.calls[0].arguments, [0, 4]);
    assert.deepEqual(spy.mock.calls[1].arguments, [4, 4]);
  });

  it('should end at the size of the file', async () => {
    const dataTest = JSON.stringify({ hello: 'world', data: Buffer.alloc(16).toString('base64') });
    const source = new SourceMemory('memory://test.json', Buffer.from(dataTest));

    // Validate different chunk sizes all read the entire file fine.
    for (let i = 1; i < dataTest.length; i++) {
      const view = new SourceView(source, [new SourceChunk({ size: i })]);
      const data = await view.fetch(0, dataTest.length);
      assert.equal(dataTest, Buffer.from(data).toString());
    }
  });
});
