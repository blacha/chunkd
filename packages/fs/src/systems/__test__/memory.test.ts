/* eslint-disable @typescript-eslint/no-non-null-assertion */
import assert from 'node:assert';
import { afterEach, describe, it } from 'node:test';

import { toArray } from '../../generator.js';
import { FsMemory } from '../memory.js';

function toHref(s: URL[]): string[] {
  return s.map((url) => url.href);
}

describe('FsMemory', () => {
  const memory = new FsMemory();

  afterEach(() => {
    memory.files.clear();
  });
  it('should write files', async () => {
    assert.equal(memory.files.size, 0);
    await memory.write(new URL('memory://foo.png'), Buffer.from('a'));
    assert.equal(memory.files.size, 1);

    const b = await memory.read(new URL('memory://foo.png'));
    assert.equal(b.toString(), 'a');
  });

  it('should write with metadata', async () => {
    await memory.write(new URL('memory://foo.png'), Buffer.from('a'), {
      contentType: 'text/plain',
      metadata: { 'X-LINZ-TEST': '123' },
    });

    const head = await memory.head(new URL('memory://foo.png'));
    assert.equal(head?.contentType, 'text/plain');
    assert.deepEqual(head?.metadata, { 'X-LINZ-TEST': '123' });
  });

  it('should stream files', async () => {
    await memory.write(new URL('memory://foo.png'), Buffer.from('a'));

    await memory.write(new URL('memory://bar.png'), memory.readStream(new URL('memory://foo.png')));
    assert.equal(memory.files.size, 2);

    const bar = await memory.read(new URL('memory://bar.png'));
    assert.equal(bar.toString(), 'a');
  });

  it('should list files', async () => {
    await memory.write(new URL('memory://a/b/c.png'), Buffer.from('a'));
    await memory.write(new URL('memory://a/d.png'), Buffer.from('a'));

    assert.deepEqual(toHref(await toArray(memory.list(new URL('memory://a/b')))), ['memory://a/b/c.png']);
  });

  it('should delete files', async () => {
    await memory.write(new URL('memory://a/b/c.png'), Buffer.from('a'));
    await memory.write(new URL('memory://a/d.png'), Buffer.from('a'));
    assert.deepEqual(toHref(await toArray(memory.list(new URL('memory://a/b')))), ['memory://a/b/c.png']);

    await memory.delete(new URL('memory://a/b/c.png'));
    assert.deepEqual(toHref(await toArray(memory.list(new URL('memory://a/')))), ['memory://a/d.png']);

    await memory.delete(new URL('memory://a/d.png'));
    assert.deepEqual(toHref(await toArray(memory.list(new URL('memory://a/')))), []);
  });
});
