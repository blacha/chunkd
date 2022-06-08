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
});
