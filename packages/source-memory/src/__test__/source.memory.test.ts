import { toArray } from '@chunkd/core';
import o from 'ospec';
import { FsMemory } from '../memory.fs.js';

o.spec('FsMemory', () => {
  const memory = new FsMemory();

  o.afterEach(() => {
    memory.files.clear();
  });
  o('should write files', async () => {
    o(memory.files.size).equals(0);
    await memory.write('memory://foo.png', Buffer.from('a'));
    o(memory.files.size).equals(1);

    const b = await memory.read('memory://foo.png');
    o(b.toString()).equals('a');
  });

  o('should write with metadata', async () => {
    await memory.write('memory://foo.png', Buffer.from('a'), {
      contentType: 'text/plain',
      metadata: { 'X-LINZ-TEST': '123' },
    });

    const head = await memory.head('memory://foo.png');
    o(head?.contentType).equals('text/plain');
    o(head?.metadata).deepEquals({ 'X-LINZ-TEST': '123' });
  });

  o('should stream files', async () => {
    await memory.write('memory://foo.png', Buffer.from('a'));

    await memory.write('memory://bar.png', memory.stream('memory://foo.png'));
    o(memory.files.size).equals(2);

    const bar = await memory.read('memory://bar.png');
    o(bar.toString()).equals('a');
  });

  o('should list files', async () => {
    await memory.write('memory://a/b/c.png', Buffer.from('a'));
    await memory.write('memory://a/d.png', Buffer.from('a'));

    o(await toArray(memory.list('memory://a/b'))).deepEquals(['memory://a/b/c.png']);
  });

  o('should delete files', async () => {
    await memory.write('memory://a/b/c.png', Buffer.from('a'));
    await memory.write('memory://a/d.png', Buffer.from('a'));
    o(await toArray(memory.list('memory://a/b'))).deepEquals(['memory://a/b/c.png']);

    await memory.delete('memory://a/b/c.png');
    o(await toArray(memory.list('memory://a/'))).deepEquals(['memory://a/d.png']);

    await memory.delete('memory://a/d.png');
    o(await toArray(memory.list('memory://a/'))).deepEquals([]);
  });
});
